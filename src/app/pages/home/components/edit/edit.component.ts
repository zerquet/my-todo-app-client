import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Todo } from 'src/app/models/todo.model';
import { TodoList } from 'src/app/models/todolist.model';
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
  
  constructor(private todoService: TodoService, private todoListService: TodolistService) { }
  
  //todoDeleted sends data to ListComponent. todoDeleted2 sends data to SidepanelComponent.
  @Output() todoDeleted = new EventEmitter<number>();
  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted2 = new EventEmitter<{listId: number | undefined, value: number}>();
  @Output() todoListChanged = new EventEmitter<{listId: number | undefined, value: number}>();


  loadTodo(todo: Todo): void {
    this.editingTodo = { ...todo };
    this.previousListId = this.editingTodo.todoListId;

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
    this.todoService.updateTodo(this.editingTodo!).subscribe(
      () => {
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
        
        console.log("Updated ID " + this.editingTodo!.id)

        this.previousListId = this.editingTodo?.todoListId;
      } //next 
    );
  }

  deleteTodo(): void {
    this.todoService.deleteTodo(this.editingTodo!.id!).subscribe(
      () => {
        this.todoDeleted.emit(this.editingTodo!.id);
        debugger;
        console.log("Deleted ID " + this.editingTodo!.id)
        this.todoDeleted2.emit({listId: this.editingTodo!.todoListId, value: -1});
        this.editingTodo = null;
      }
    )
  }
}
