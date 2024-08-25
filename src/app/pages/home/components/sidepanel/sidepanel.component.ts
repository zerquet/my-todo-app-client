import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TodoList } from 'src/app/models/todolist.model';
import { TodoService } from 'src/app/services/todo.service';
import { TodolistService } from 'src/app/services/todolist.service';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styles: [
  ]
})
export class SidepanelComponent implements OnInit {
  newTodoList: string = "";
  lists: Array<TodoList> = [];
  selectedList: number | undefined = undefined;
  totalTodos: number = 0;

  constructor(private todoListService: TodolistService, private todoService: TodoService) {}

  @Output() listClicked = new EventEmitter<TodoList>();
  @Output() listChanged = new EventEmitter<void>();

  onInboxClick(): void {
    this.listClicked.emit(undefined);
    this.selectedList = undefined;
  }

  onListClick(todoList: TodoList): void {
    debugger;
    if(todoList.id !== this.selectedList) {
      this.listChanged.emit();
    }
    this.selectedList = todoList.id!;
    this.listClicked.emit(todoList);
  }

  ngOnInit(): void {
    this.getLists();
    this.getTodoCount();
  }

  addList(): void {
    if(this.newTodoList.trim() !== "") {
      const todoList: TodoList = {
        title: this.newTodoList,
        todoItems: []
      };

      this.todoListService.createList(todoList).subscribe(
        (createdList: TodoList) => {
          this.lists.push(createdList);
          this.onListClick(createdList);

          console.log("Created list ID" + createdList.id);
        }
      );

      this.newTodoList = "";
    }
  }

  getLists(): void {
    this.todoListService.getLists().subscribe(
      (retrievedLists: TodoList[]) => {
        this.lists = retrievedLists;
        // this.totalTodos = retrievedLists.reduce((prev, cur) => {
        //   return prev + cur["totalCount"]!;
        // },0)

        console.log("Retrieved lists.");
      }
    )
  }

  getTodoCount(): void {
    this.todoService.countTotal().subscribe(
      (count: number) => {
        debugger;
        this.totalTodos = count;
      }
    )
  }

}
