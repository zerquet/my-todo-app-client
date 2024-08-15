import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styles: [
  ]
})
export class EditComponent {
  editingTodo: Todo | null = null;
  
  constructor(private todoService: TodoService) { }
  
  @Output() todoDeleted = new EventEmitter<number>();
  @Output() todoUpdated = new EventEmitter<Todo>();

  loadTodo(todo: Todo): void {
    this.editingTodo = { ...todo };

    /** NOTE: Spreading properties of 'todo' to create clone instead of directly referencing the passed-in todo from the list component. 
     *  Otherwise, changes are reflected live on list (or any 'source' component) and could confuse users on whether it's saving the changes or not.
     *  Ref: https://chatgpt.com/share/8184a7d6-6c73-403c-a675-b87568b2f61b
     */
  }

  saveChanges(): void {
    this.todoService.updateTodo(this.editingTodo!).subscribe(
      () => {
        this.todoUpdated.emit(this.editingTodo!);

        console.log("Updated ID " + this.editingTodo!.id)
      }
    );
  }

  deleteTodo(): void {
    this.todoService.deleteTodo(this.editingTodo!.id!).subscribe(
      () => {
        this.todoDeleted.emit(this.editingTodo!.id);
        
        console.log("Deleted ID " + this.editingTodo!.id)
        this.editingTodo = null;
      }
    )
  }
}
