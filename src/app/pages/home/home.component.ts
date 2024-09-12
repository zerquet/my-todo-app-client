import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { EditComponent } from './components/edit/edit.component';
import { ListComponent } from './components/list/list.component';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { TodoList } from 'src/app/models/todolist.model';
import { SidepanelComponent } from './components/sidepanel/sidepanel.component';
import { Tag } from 'src/app/models/tag.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild(EditComponent) editChild!:EditComponent;
  @ViewChild(ListComponent) listChild!:ListComponent;
  @ViewChild(SidepanelComponent) sidePanelChild!:SidepanelComponent;
  editChildIsNull: boolean = false;
  sideMenuIsCollapsed: boolean = false;


  title = 'my-todo-app';

  constructor(private profileService: ProfileService, private router: Router, private cdref: ChangeDetectorRef) { }

  ngOnInit(): void {
    //Home component gets account info and passes it to child components. Move to app.component.ts?
    this.profileService.getAccountInfo().subscribe(
      (accountInfo) => {
        if(accountInfo === null) {
          this.router.navigate(["/login"]); 
        }
      },
      (error:any) => {
        this.router.navigate(["/login"]);
      }
    );

  }
  
  ngAfterViewChecked(): void {
    this.editChildIsNull = this.editChild.editingTodo === null;
    this.sideMenuIsCollapsed = this.sidePanelChild.isMenuCollapsed;
    this.cdref.detectChanges();
  }

  onTodoClicked(todo: Todo): void {
    this.editChild.loadTodo(todo);
  }

  onTodoUpdated(todo: Todo): void {
    this.listChild.updateList(todo);
  }

  onTodoDeleted(id: number): void {
    this.listChild.deleteTodo(id);
  }

  onListClicked(todoList: TodoList): void {
    //All todos
    if(todoList === undefined) {
      this.listChild.loadTodos(undefined);
      this.listChild.tagMode = false;
      this.listChild.currentList = "Inbox";
      this.listChild.currentListId = undefined;
      //Reset edit panel and selected todo color when Inbox is clicked.
      this.editChild.editingTodo = null;
      this.listChild.selectedTodoItem = undefined;
      this.listChild.resetNoItemMessage();
    }
    //Todos due today
    else if(todoList.id === -2) {
      this.listChild.loadTodos(-2);
      this.listChild.tagMode = false;
      this.listChild.currentList = "Today";
      this.listChild.currentListId = undefined;
      this.editChild.editingTodo = null;
      this.listChild.selectedTodoItem = undefined;
      this.listChild.noItemsMessage = "No items due today :)"
    }
    //Completed todos
    else if(todoList.id === -3) {
      this.listChild.loadTodos(-3);
      this.listChild.tagMode = false;
      this.listChild.currentList = "Completed";
      this.listChild.currentListId = undefined;
      this.editChild.editingTodo = null;
      this.listChild.selectedTodoItem = undefined;
      this.listChild.noItemsMessage = "You have no completed items :(";
      this.listChild.showCompletedList = true;
    }
    //Todos from list
    else {
      this.listChild.loadTodos(todoList.id!);
      this.listChild.tagMode = false;
      this.listChild.currentList = todoList.title!; 
      this.listChild.currentListId = todoList.id!;
      this.listChild.resetNoItemMessage();
    }
    //NOTE: If user adds a todo, they don't expect it to be added to a previously selected tag. So clear the values. 
    this.listChild.currentTag = null;
  }
  
  onListChanged(): void {
    //NOTE: Can't this code go inside onListClicked? Keep to enforce intention?
    this.editChild.editingTodo = null;
    this.listChild.selectedTodoItem = undefined; //NOTE: Why not add this to onListClicked? It will unfocus when user clicks any List -> Inbox. 
    this.listChild.editListMode = false;
  }

  onTodoAddedOrDeleted(outputModel: {listId: number | undefined, value: number}): void {
    debugger;
    //Even though listId is of type number | undefined, it can be null if you are deleting a todo item w/o a list assigned to it. 
    if(outputModel.listId === undefined || outputModel.listId === null) {
      this.sidePanelChild.totalTodos = this.sidePanelChild.totalTodos + outputModel.value;
    } 
    else if(outputModel.listId === -2) {
      this.sidePanelChild.totalDueTodos += outputModel.value;
    }
    else if(outputModel.listId === -3) {
      this.sidePanelChild.totalCompletedTodos += outputModel.value;
    }
    else {
      const index = this.sidePanelChild.lists.findIndex(list => list.id == outputModel.listId);
      let listToUpdate = this.sidePanelChild.lists.at(index);
      listToUpdate!.totalCount = listToUpdate!.totalCount! + outputModel.value;
      this.sidePanelChild.lists[index] = listToUpdate!;

      this.sidePanelChild.totalTodos = this.sidePanelChild.totalTodos + outputModel.value;
    } //next, when saving todo, update list item counter
  }

  onTodoListChanged(outputModel: {listId: number | undefined, value: number}): void {
    debugger;
    //Even though listId is of type number | undefined, it can be null if you are deleting a todo item w/o a list assigned to it. 
    if(outputModel.listId === undefined || outputModel.listId === null) {
      this.sidePanelChild.totalTodos = this.sidePanelChild.totalTodos + outputModel.value;
    } 
    else {
      const index = this.sidePanelChild.lists.findIndex(list => list.id == outputModel.listId);
      let listToUpdate = this.sidePanelChild.lists.at(index);
      listToUpdate!.totalCount = listToUpdate!.totalCount! + outputModel.value;
      this.sidePanelChild.lists[index] = listToUpdate!;

    } 
  }

  onListTitleUpdated(newList: TodoList): void {
    //Update Sidepanel component
    let index = this.sidePanelChild.lists.findIndex(list => list.id == newList.id);
    let oldList = this.sidePanelChild.lists.at(index);
    let newListEntry: TodoList = {
      id: oldList?.id,
      title: newList.title,
      todoItems: oldList?.todoItems!,
      totalCount: oldList?.totalCount
    };
    this.sidePanelChild.lists[index] = newListEntry;

    //Update EditComponent
    index = this.editChild.availableLists.findIndex(list => list.id == newList.id);
    oldList = this.editChild.availableLists.at(index);
    newListEntry = {
      id: oldList?.id,
      title: newList.title,
      todoItems: oldList?.todoItems!,
      totalCount: oldList?.totalCount
    };
    this.editChild.availableLists[index] = newListEntry;
  }

  onListDeleted(id: number): void {
    this.editChild.editingTodo = null;
    this.sidePanelChild.lists = this.sidePanelChild.lists.filter(x => x.id !== id);
    this.sidePanelChild.onInboxClick();
  }

  onListDeletedCascade(todosDeleted: number): void {
    this.sidePanelChild.totalTodos = this.sidePanelChild.totalTodos - todosDeleted;
  }

  onTagClicked(tag: Tag): void {
    this.listChild.loadTodosByTag(tag.id!);
    this.listChild.tagMode = true;
    this.listChild.currentTag = {...tag};
    this.listChild.editingTag = {...tag};
    //may need to set list to undefined. If user clicks on a tag and they create an item, they don't expect for it to be under the last clicked list. 
    //Set list to undefined (aka Inbox) so it's added without a list
    this.listChild.currentList = "Inbox";
    this.listChild.currentListId = undefined;
  }

  onTagChanged(): void {
    this.editChild.editingTodo = null;
    this.listChild.selectedTodoItem = undefined;
    //this.listChild.editListMode = false;
  }

  onTagUpdated(newTag: Tag): void {
        //Update Sidepanel component
        let index = this.sidePanelChild.tags.findIndex(tag => tag.id == newTag.id);
        let oldTag = this.sidePanelChild.tags.at(index);
        let newTagEntry: Tag = {
          id: oldTag?.id,
          name: newTag.name,
          colorCode: newTag.colorCode,
          todoItems: oldTag?.todoItems!
        };
        this.sidePanelChild.tags[index] = newTagEntry;

        //Update Edit component
        index = this.editChild.availableTags.findIndex(tag => tag.id == newTag.id);
        oldTag = this.editChild.availableTags.at(index);
        newTagEntry = {
          id: oldTag?.id,
          name: newTag.name,
          colorCode: newTag.colorCode!,
          todoItems: oldTag?.todoItems!
        };
        this.editChild.availableTags[index] = newTagEntry;

        ///Update added tag in EditComponent
        index = this.editChild.addedTags.findIndex(tag => tag.id == newTag.id);
        oldTag = this.editChild.addedTags.at(index);
        this.editChild.addedTags[index] = newTagEntry;
  }

  onTagDeleted(id: number): void {
    this.editChild.editingTodo = null;
    this.sidePanelChild.tags = this.sidePanelChild.tags.filter(x => x.id !== id);
    this.sidePanelChild.onInboxClick();
  }

  onTodoCompletedStatusChanged(newCountUpdate: number): void {
    debugger;
    this.sidePanelChild.totalCompletedTodos += newCountUpdate;
  }

  onTodoAddedToTodayList(val: number): void {
    this.sidePanelChild.totalDueTodos += val;
  }

  onTodoDueDateChanged(editingTodo: Todo): void {
    let today = new Date();
    let todoDueDate = new Date(editingTodo.dueDate!);
    let todoDueDateIsToday = (todoDueDate.getMonth() + 1) === (today.getMonth() + 1) 
        && todoDueDate.getFullYear() === today.getFullYear()
        && todoDueDate.getDate() === today.getDate();
    
    if(!todoDueDateIsToday) {
      //Only remove if todo already exists.
      if(this.sidePanelChild.dueToday.some(t => t.id === editingTodo.id)) {
        //move these to a SidepanelComponent function?
        this.sidePanelChild.dueToday = this.sidePanelChild.dueToday.filter(t => t.id !== editingTodo.id);
        this.sidePanelChild.totalDueTodos -= 1;
      }
    }
    else {
      //Only push if editing todo doesn't exist in array
      if(!this.sidePanelChild.dueToday.some(t => t.id === editingTodo.id)) {
        this.sidePanelChild.dueToday.push(editingTodo);
        this.sidePanelChild.totalDueTodos += 1;
      }
    }
  }

  onTodoClickedToggle(): void {
    this.editChild.editingTodo = null;
  }

}
