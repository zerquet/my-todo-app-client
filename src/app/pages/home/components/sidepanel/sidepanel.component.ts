import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Tag } from 'src/app/models/tag.model';
import { Todo } from 'src/app/models/todo.model';
import { TodoList } from 'src/app/models/todolist.model';
import { TagService } from 'src/app/services/tag.service';
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
  tags: Array<Tag> = [];
  newTag: string = "";
  selectedTag: number = 0;
  isMenuCollapsed: boolean = false;
  readonly todayListId: number = -2;
  readonly completedListId: number = -3;
  totalDueTodos: number = 0;
  totalCompletedTodos: number = 0;
  dueToday: Todo[] = [];

  constructor(private todoListService: TodolistService, private todoService: TodoService, private tagService: TagService) {}

  @Output() listClicked = new EventEmitter<TodoList>();
  @Output() listChanged = new EventEmitter<void>();
  @Output() tagClicked = new EventEmitter<Tag>();
  @Output() tagChanged = new EventEmitter<void>();

  onInboxClick(): void {
    this.listClicked.emit(undefined);
    this.selectedList = undefined;
  }

  onListClick(todoList: TodoList): void {
    if(todoList.id !== this.selectedList) {
      this.listChanged.emit();
    }
    this.selectedList = todoList.id!;
    this.listClicked.emit(todoList);
    this.selectedTag = 0;
  }

  onTagClick(tag: Tag): void {
    if(tag.id !== this.selectedTag) {
      this.tagChanged.emit();
    }
    this.selectedTag = tag.id!;
    this.tagClicked.emit(tag);
    this.selectedList = -1;
  }

  ngOnInit(): void {
    this.getLists();
    this.getTodoCount();
    this.getTags();
    this.todoService.getDueToday().subscribe(
      (retrievedDueToday) => {
        this.dueToday = retrievedDueToday;
        this.totalDueTodos = retrievedDueToday.length;
      }
    )
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

    this.todoService.countCompleted().subscribe(
      (count: number) => {
        this.totalCompletedTodos = count;
      }
    )

    // this.todoService.countDueToday().subscribe(
    //   (count: number) => {
    //     this.totalDueTodos = count;
    //   }
    // )
  }

  addTag(): void {
    if(this.newTag.trim() !== "") {
      const tag: Tag = {
        name: this.newTag,
        colorCode: "#999999",
        todoItems: []
      };

      this.tagService.createTag(tag).subscribe(
        (createdTag) => {
          this.tags.push(createdTag);
          this.onTagClick(createdTag);

          console.log(`Created tag ID ${createdTag.id}`);
        }
      )

      this.newTag = "";
    }
  }

  getTags(): void {
    this.tagService.getTags().subscribe(
      (retrievedTags) => {
        this.tags = retrievedTags;

        console.log("Retrived tags")
      }
    )
    
  }

  toggleCollapseMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onTodayListClicked(): void {
    //This todoList just serves the purpose of holding the id of either a "Today" id or "Completed" id.
    const todoListToday: TodoList = {
      id: this.todayListId,
      todoItems: []
    };
    this.listClicked.emit(todoListToday);
    this.selectedList = this.todayListId;
  }

  onCompletedListClicked(): void {
    const todoListCompleted: TodoList = {
      id: this.completedListId,
      todoItems: []
    };
    this.listClicked.emit(todoListCompleted);
    this.selectedList = this.completedListId;
  }

}
