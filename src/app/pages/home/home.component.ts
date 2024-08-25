import { Component, OnInit, ViewChild } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { EditComponent } from './components/edit/edit.component';
import { ListComponent } from './components/list/list.component';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { TodoList } from 'src/app/models/todolist.model';
import { SidepanelComponent } from './components/sidepanel/sidepanel.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild(EditComponent) editChild!:EditComponent;
  @ViewChild(ListComponent) listChild!:ListComponent;
  @ViewChild(SidepanelComponent) sidePanelChild!:SidepanelComponent;

  title = 'my-todo-app';

  constructor(private profileService: ProfileService, private router: Router) { }

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
      this.listChild.currentList = "Inbox";
      this.listChild.currentListId = undefined;
    }
    //Todos from list
    else {
      this.listChild.loadTodos(todoList.id!);
      this.listChild.currentList = todoList.title!; 
      this.listChild.currentListId = todoList.id!;
    }
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
}
