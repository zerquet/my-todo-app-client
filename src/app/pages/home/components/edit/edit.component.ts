import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Tag } from 'src/app/models/tag.model';
import { Todo } from 'src/app/models/todo.model';
import { TodoList } from 'src/app/models/todolist.model';
import { TagService } from 'src/app/services/tag.service';
import { TodoService } from 'src/app/services/todo.service';
import { TodolistService } from 'src/app/services/todolist.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styles: [
  ]
})
export class EditComponent {
  editingTodo: Todo | null = null;
  availableLists: TodoList[] = [];
  previousListId: number | undefined = undefined;
  availableTags: Tag[] = [];
  addedTags: Tag[] = [];
  
  constructor(private todoService: TodoService, private todoListService: TodolistService, private tagService: TagService) { }
  
  //todoDeleted sends data to ListComponent. todoDeleted2 sends data to SidepanelComponent.
  @Output() todoDeleted = new EventEmitter<number>();
  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted2 = new EventEmitter<{listId: number | undefined, value: number}>();
  @Output() todoListChanged = new EventEmitter<{listId: number | undefined, value: number}>();
  @Output() todoDueDateChanged = new EventEmitter<Todo>();


  loadTodo(todo: Todo): void {
    this.addedTags = [];
    debugger;
    //this.editingTodo = { ...todo };
    //NOTE: Calling API to retrieve tags from Todo item as well. 
    this.todoService.getTodo(todo.id!).subscribe(
      (retrievedTodo) => {
        this.editingTodo = retrievedTodo;

        //Subscribe code block for GetTags needs to run after the todo has been retrieved, therefore the nesting.
        //This ensures the todo's tags is ready by the time we run the forEach method, given subscribe()'s async nature
        this.tagService.getTags().subscribe(
          (retrievedTags) => {
            this.availableTags = retrievedTags;
            
            retrievedTodo?.tags.forEach(tag => {
              let tagMatch = this.availableTags.find(t => t.id === tag.id);
              if(tagMatch !== undefined) {
                this.addedTags.push(tagMatch);
              }
            })

          }
        )

        this.previousListId = this.editingTodo.todoListId;

      }
    ) //work on removing tags w 'x' in edit component. Make sure saving todo with updated tags works. make sure a todo item can have a list and tags. 

    /** NOTE: Spreading properties of 'todo' to create clone instead of directly referencing the passed-in todo from the list component. 
     *  Otherwise, changes are reflected live on list (or any 'source' component) and could confuse users on whether it's saving the changes or not.
     *  Ref: https://chatgpt.com/share/8184a7d6-6c73-403c-a675-b87568b2f61b
     */
    this.todoListService.getLists().subscribe(
      (retrievedLists: TodoList[]) => {
        this.availableLists =  retrievedLists;
      }
    );

  }

  saveChanges(): void {
    debugger;
    this.editingTodo!.newTags = this.addedTags.map(tag => tag.id!);
    this.todoService.updateTodo(this.editingTodo!).subscribe(
      () => {
        //Setting tags to addedTags so updated tag list is reflected on ListComponent
        this.editingTodo!.tags = [...this.addedTags];
        this.todoUpdated.emit(this.editingTodo!);
        debugger;
        //*Update list counters*//
        //Don't update if list wasn't changed
        if(this.editingTodo?.todoListId !== this.previousListId) {
          //Dont increase 'Inbox' counter (when prev list id is not null)
          if(this.editingTodo?.todoListId !== null) {
            this.todoListChanged.emit({listId: this.editingTodo?.todoListId, value: 1});
          }
          
          //Don't decrease 'Inbox' counter
          if(this.previousListId !== null) {
            this.todoListChanged.emit({listId: this.previousListId, value: -1});
          }
        }

        if(this.editingTodo?.dueDate !== undefined) {
          this.todoDueDateChanged.emit(this.editingTodo);
          
        }
        
        console.log("Updated ID " + this.editingTodo!.id)

        this.previousListId = this.editingTodo?.todoListId;
      } //next 
    );
  }

  deleteTodo(): void {
    debugger;
    this.todoService.deleteTodo(this.editingTodo!.id!).subscribe(
      () => {
        this.todoDeleted.emit(this.editingTodo!.id);
        debugger;
        console.log("Deleted ID " + this.editingTodo!.id)
        this.todoDeleted2.emit({listId: this.editingTodo!.todoListId, value: -1});
        if(this.editingTodo?.dueDate !== undefined) {
          let today = new Date();
          let todoDueDate = new Date(this.editingTodo.dueDate);
          let todoDueDateIsToday = (todoDueDate.getMonth() + 1) === (today.getMonth() + 1) 
              && todoDueDate.getFullYear() === today.getFullYear()
              && todoDueDate.getDate() === today.getDate();
          
          if(todoDueDateIsToday) {
            this.todoDeleted2.emit({listId: -2, value: -1})
          }
        }

        if(this.editingTodo?.isCompleted) {
          this.todoDeleted2.emit({listId: -3, value: -1});
        }
        this.editingTodo = null;
      }
    )
  }

  updateAddedTags(tag: Tag): void {
    debugger;
    const isTagAdded = this.tagIsSelected(tag);
    if(!isTagAdded) {
      this.addedTags.push(tag);
    } else {
      //Remove tag from collection
      this.addedTags = this.addedTags.filter(x => x !== tag);
    }
  }

  tagIsSelected(tag: Tag): boolean {
    return this.addedTags.includes(tag);
  }
}
