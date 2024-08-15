import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styles: [
  ]
})
export class ListComponent implements OnInit {
  todos: Array<Todo> = [];
  newTodoItem: string = "";
  nextId: number = 1;
  username: string = "";
  
  constructor(private todoService: TodoService, private router: Router) {}
  
  @Output() todoClicked = new EventEmitter<Todo>();

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(
      (retrievedTodos: Todo[]) => {
        this.todos = retrievedTodos;

        console.log("Retrieved todos")
      }
    )
  }

  addTodo(): void {
    if(this.newTodoItem.trim() != "") {
      const todo: Todo = { title: this.newTodoItem.trim()}

      this.todoService.createTodo(todo).subscribe(
        (createdTodo: Todo) => {
          this.todos.push(createdTodo);

          console.log("Got item ID " + createdTodo.id);
        }
      );

      this.newTodoItem = "";
    }
  }

  setEditing(todo: Todo): void {
    this.todoClicked.emit(todo);
  }

  updateList(todo: Todo): void {
    const index: number = this.todos.findIndex(i => i.id == todo.id);
    if(index !== -1) {
      this.todos[index] = { ...todo }; //NOTE: Using spread operator to create clone for the same (though vice-versa) reason as in loadTodo() in edit.component.ts
    }
  }

  deleteTodo(id: number):void {
    this.todos = this.todos.filter(i => i.id !== id);
  }

  private todoItemExists(title: string): boolean {
    return this.todos.some(e => e.title == title);
    
    //Ref: https://stackoverflow.com/questions/42790602/how-do-i-check-whether-an-array-contains-a-string-in-typescript
  }
}
