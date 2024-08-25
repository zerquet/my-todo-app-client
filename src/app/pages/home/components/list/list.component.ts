import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Todo } from 'src/app/models/todo.model';
import { TodoList } from 'src/app/models/todolist.model';
import { TodoService } from 'src/app/services/todo.service';
import { TodolistService } from 'src/app/services/todolist.service';

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
  currentList: string = "";
  currentListId: number | undefined = undefined;
  editListMode: boolean = false;
  newListTitle: string = "";
  selectedTodoItem: number | undefined;

  
  constructor(private todoService: TodoService, private todoListService: TodolistService, private router: Router) {}
  
  @Output() todoClicked = new EventEmitter<Todo>();
  @Output() todoAdded = new EventEmitter<{listId: number | undefined, value: number}>();
  @Output() listTitleUpdated = new EventEmitter<TodoList>();
  @Output() listDeleted = new EventEmitter<number>();
  @Output() listDeletedCascade = new EventEmitter<number>();

  ngOnInit(): void {
    this.loadTodos(undefined);
    this.currentList = "Inbox";
    this.currentListId = undefined;
  }

  addTodo(): void {
    if(this.newTodoItem.trim() != "") {
      const todo: Todo = { 
        title: this.newTodoItem.trim(),
        todoListId: this.currentListId
      };
      console.log(todo);

      this.todoService.createTodo(todo).subscribe(
        (createdTodo: Todo) => {
          this.todos.push(createdTodo);

          console.log("Got item ID " + createdTodo.id);
          
          this.todoAdded.emit({listId: this.currentListId, value: 1})
        }
      );

      this.newTodoItem = "";
    }
  }

  setEditing(todo: Todo): void {
    this.todoClicked.emit(todo);
    this.selectedTodoItem = todo.id;
  }

  updateList(todo: Todo): void {
    //Todo was removed from current list
    if((todo.todoListId !== this.currentListId) && this.currentList != "Inbox") {
      this.todos = this.todos.filter(i => i.id !== todo.id);
    }
    const index: number = this.todos.findIndex(i => i.id == todo.id);
    if(index !== -1) {
      this.todos[index] = { ...todo }; //NOTE: Using spread operator to create clone for the same (though vice-versa) reason as in loadTodo() in edit.component.ts
    }
  }

  deleteTodo(id: number):void {
    this.todos = this.todos.filter(i => i.id !== id);
  }

  loadTodos(listId: number | undefined): void {
    if(listId === undefined) {
      this.todoService.getTodos().subscribe(
        (retrievedTodos: Todo[]) => {
          this.todos = retrievedTodos;
  
          console.log("Retrieved todos")
        }
      )
    } 
    else {
      this.todoListService.getList(listId).subscribe(
        (retrievedList) => {
          this.todos = retrievedList.todoItems;

          console.log(`Retrieved list ${retrievedList.title}`);
        }
      )
    }

  }

  toggleEditListMode(): void {
    this.editListMode = !this.editListMode;
  }

  updateListTitle(): void {
    if(this.newListTitle.trim() !== "" && this.currentList !== this.newListTitle.trim()) {
      const todoList: TodoList = {
        id: this.currentListId,
        title: this.newListTitle,
        todoItems: this.todos
      };

      this.todoListService.updateList(todoList).subscribe(
        () => {
          this.currentList = this.newListTitle;
          this.toggleEditListMode();
          this.listTitleUpdated.emit(todoList);
        }
      )
    }
  }

  deleteList(cascadeDelete: boolean): void {
    if(this.currentListId !== undefined) {
      this.todoListService.deleteList(this.currentListId).subscribe(
        () => {
          
          if(cascadeDelete) {
            const todoIds = this.todos.map(x => x.id!);
            this.todoService.deleteTodos(todoIds).subscribe(
              () => {
                this.loadTodos(undefined);
                this.listDeleted.emit(this.currentListId);
                this.currentList = "Inbox";
                this.currentListId = undefined;
                this.listDeletedCascade.emit(todoIds.length)
              }
            )
          } 
          else {
            //Duplicate because if we have this code after the if(cascadeDelete) not in an else clause, the UI will update before the todo items are deleted,
            //therefore unintentionally caching the todos that were supposed to be deleted. Basically, we're doing this because of async nature. Putting said code inside subscribe ensures
            // it will only run when cascadeDelete is truthy, ignore the else block code, and run after we receive the API response.
            this.loadTodos(undefined);
            this.listDeleted.emit(this.currentListId);
            this.currentList = "Inbox";
            this.currentListId = undefined;
          }
          
        }
      )
    }
  }

  private todoItemExists(title: string): boolean {
    return this.todos.some(e => e.title == title);
    
    //Ref: https://stackoverflow.com/questions/42790602/how-do-i-check-whether-an-array-contains-a-string-in-typescript
  }
}
