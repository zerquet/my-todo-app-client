import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Tag } from 'src/app/models/tag.model';
import { TagColor } from 'src/app/models/tagColor.model';
import { Todo } from 'src/app/models/todo.model';
import { TodoList } from 'src/app/models/todolist.model';
import { TagService } from 'src/app/services/tag.service';
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
  tagMode: boolean = false;
  currentTag: Tag | null = null;
  tagColorOptions: TagColor[] = [];
  editingTag: Tag | null = null;
  sortAlphaOption: string = "asc";
  showCompletedList: boolean = false;
  completedCount: number = 0;
  noItemsMessage: string = "Start by adding a todo item.";
  showEditPanel: boolean = false;

  
  constructor(private todoService: TodoService, private todoListService: TodolistService, private tagService: TagService,
     private router: Router) {}
  
  @Output() todoClicked = new EventEmitter<Todo>();
  @Output() todoAdded = new EventEmitter<{listId: number | undefined, value: number}>();
  @Output() listTitleUpdated = new EventEmitter<TodoList>();
  @Output() listDeleted = new EventEmitter<number>();
  @Output() listDeletedCascade = new EventEmitter<number>();
  @Output() tagUpdated = new EventEmitter<Tag>();
  @Output() tagDeleted = new EventEmitter<number>();
  @Output() todoCompletedStatusChanged = new EventEmitter<number>();
  @Output() todoAddedToTodayList = new EventEmitter<number>();
  @Output() todoClickedToggle = new EventEmitter<void>();

  ngOnInit(): void {
    debugger;
    this.loadTodos(undefined);
    this.currentList = "Inbox";
    this.currentListId = undefined;
    this.loadTagColors();
  }

  addTodo(): void {
    if(this.newTodoItem.trim() != "") {
      const todo: Todo = { 
        title: this.newTodoItem.trim(),
        todoListId: this.currentListId,
        tags: [],
        newTags: [],
        isCompleted: false
      };
      if(this.tagMode) {
        todo.newTags.push(this.currentTag?.id!);
      }

      if(this.currentList === "Today") {
        todo.dueDate = new Date();
      }
      console.log(todo);

      this.todoService.createTodo(todo).subscribe(
        (createdTodo: Todo) => {
          this.todos.push(createdTodo);

          console.log("Got item ID " + createdTodo.id);
          
          this.todoAdded.emit({listId: this.currentListId, value: 1})
          if(this.currentList === "Today") {
            this.todoAddedToTodayList.emit(1);
          }
        }
      );

      this.newTodoItem = "";
    }
  }

  setEditing(todo: Todo): void {
    //If same todo, but edit panel hidden
    if(this.selectedTodoItem === todo.id && !this.showEditPanel) {
      this.todoClicked.emit(todo);
      this.showEditPanel = true;
    }
    //If same todo, but edit panel displayed
    else if(this.selectedTodoItem === todo.id && this.showEditPanel) {
      this.showEditPanel = false;
      this.todoClickedToggle.emit();
    }
    //If clicked on different todo
    else if(this.selectedTodoItem !== todo.id) {
      this.todoClicked.emit(todo);
      this.showEditPanel = true;
    }
    this.selectedTodoItem = todo.id; //next, need to fix that delete list cascade issue. 
  }

  updateList(todo: Todo): void {
    //Todo was removed from current list
    if((todo.todoListId !== this.currentListId) && this.currentList != "Inbox") {
      if(this.currentList === "Today") {
        let today = new Date();
        if (todo.dueDate !== undefined) {
          let todoDueDate = new Date(todo.dueDate); //Redundant Date() obj?
          let datesAreSame = (todoDueDate.getMonth() + 1) === (today.getMonth() + 1) 
                            && todoDueDate.getDate() === today.getDate() 
                            && todoDueDate.getFullYear() === today.getFullYear(); 

          if(!datesAreSame) {
            this.todos = this.todos.filter(i => i.id !== todo.id);
          }
        }
      } 
      //Run same check for 'Completed'. Rn if you save changes on an unchanged todo item, it removes it from list. 
      else if(this.currentList === "Completed") {
        if(!todo.isCompleted) {
          this.todos = this.todos.filter(i => i.id !== todo.id);
        }
      }
      else {
        this.todos = this.todos.filter(i => i.id !== todo.id);
      }
    }
    const index: number = this.todos.findIndex(i => i.id == todo.id);
    if(index !== -1) {
      this.todos[index] = { ...todo }; //NOTE: Using spread operator to create clone for the same (though vice-versa) reason as in loadTodo() in edit.component.ts
    }
    if(this.tagMode && !todo.newTags.some(t => t === this.currentTag?.id)) {
      this.todos = this.todos.filter(t => t.id !== todo.id);
    }
  }

  deleteTodo(id: number):void {
    const todo = this.todos.find(t => t.id === id);
    if(todo?.isCompleted) {
      this.completedCount -= 1;
    }
    this.todos = this.todos.filter(i => i.id !== id);
  }

  loadTodos(listId: number | undefined): void {
    this.completedCount = 0;
    this.showCompletedList = false;
    if(listId === undefined) {
      this.todoService.getTodos().subscribe(
        (retrievedTodos: Todo[]) => {
          this.todos = retrievedTodos;
          //Because API deletes tags on each update req, we need to set new tags, which are the existing ones in this use case of updating just the IsCompleted property. 
          this.todos.forEach(t => {
            t.newTags = t.tags.map(tag => tag.id!);

            //In same loop, get completed count
            if(t.isCompleted) {
              this.completedCount = this.completedCount + 1;
            }
          })
  
          console.log("Retrieved todos")
        }
      )
    } 
    //Filter todos by due date
    else if (listId === -2) {
      this.todoService.getTodos().subscribe(
        (retrievedTodos: Todo[]) => {
          //Only get todos due today
          this.todos = retrievedTodos.filter(t => {
            let today = new Date();
            if (t.dueDate === undefined) {
              return false;
            }
            let todoDueDate = new Date(t.dueDate)
            return (todoDueDate.getMonth() + 1) === (today.getMonth() + 1) 
                    && todoDueDate.getDate() === today.getDate() 
                    && todoDueDate.getFullYear() === today.getFullYear(); 
          })

          this.todos.forEach(t => {
            t.newTags = t.tags.map(tag => tag.id!);

            if(t.isCompleted) {
              this.completedCount = this.completedCount + 1;
            }
          })
  
          console.log("Retrieved todos")
        }
      )
    }
    else if(listId === -3) {
      this.todoService.getTodos().subscribe(
        (retrievedTodos: Todo[]) => {
          //Only get completed todos
          this.todos = retrievedTodos.filter(t => t.isCompleted)

          this.todos.forEach(t => {
            t.newTags = t.tags.map(tag => tag.id!);

            if(t.isCompleted) {
              this.completedCount = this.completedCount + 1;
            }
          })
  
          console.log("Retrieved todos")
        }
      )
    }
    else {
      this.todoListService.getList(listId).subscribe(
        (retrievedList) => {
          this.todos = retrievedList.todoItems;
          this.todos.forEach(t => {
            t.newTags = t.tags.map(tag => tag.id!);

            if(t.isCompleted) {
              this.completedCount = this.completedCount + 1;
            }
          })
          console.log(`Retrieved list ${retrievedList.title}`);
        }
      )
    }

  }

  loadTodosByTag(tagId: number): void {
    this.completedCount = 0;
    this.showCompletedList = false;
    this.tagService.getTag(tagId).subscribe(
      (retrievedTag) => {
        this.todos = retrievedTag.todoItems;
        this.todos.forEach(t => {
          t.newTags = t.tags.map(tag => tag.id!);
          t.newTags.push(this.currentTag!.id!);

          if(t.isCompleted) {
            this.completedCount = this.completedCount + 1;
          }
        })
      }
    )
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

  updateTag(): void {
    if(this.editingTag?.name!.trim() !== "") {
      this.tagService.updateTag(this.editingTag!).subscribe(
        () => {
          this.currentTag!.name = this.editingTag?.name!;
          this.tagUpdated.emit(this.editingTag!);
          this.currentTag!.colorCode = this.editingTag?.colorCode!;
        }
      )
    }
  }

  deleteTag(): void {
    this.tagService.deleteTag(this.currentTag?.id!).subscribe(
      () => {
        this.loadTodos(undefined);
        this.tagDeleted.emit(this.currentTag?.id);
        this.currentList = "Inbox";
        this.currentListId = undefined;
        this.currentTag = null;
      }
    )
  }

  tagExistsInTodoTagCollection(todo: Todo): boolean {
    
    return todo.tags.some(t => t.id === this.currentTag!.id);
  }

  toggleSortAlpha(): void {
    if(this.sortAlphaOption === "asc") {
      this.sortAlphaOption = "desc";

      this.todos.sort(function(a, b) {
        var textA = a.title!.toUpperCase();
        var textB = b.title!.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      }).reverse();

    } 
    else if (this.sortAlphaOption === "desc") {
      this.sortAlphaOption = "asc";
      this.todos.sort(function(a, b) {
        var textA = a.title!.toUpperCase();
        var textB = b.title!.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });

    } 
  }

  onCheckboxChecked(todo: Todo): void {
    let prevCompletedVal = todo.isCompleted;
    todo.isCompleted = !todo.isCompleted;
    this.todoService.updateTodo(todo).subscribe(
      () => {
        //Update completed count
        if(todo.isCompleted === true) {
          this.completedCount += 1;
        } else {
          this.completedCount -= 1;
        }

        //Increment count if we checked as "Completed", otherwise, subtract -1 from current count on SidepanelComponent
        if(!prevCompletedVal && todo.isCompleted) {
          this.todoCompletedStatusChanged.emit(1);
        }
        else if(prevCompletedVal && !todo.isCompleted) {
          this.todoCompletedStatusChanged.emit(-1);
        }
      }
    )
  }

  toggleShowCompleted(): void {
    this.showCompletedList = !this.showCompletedList;
  }

  resetNoItemMessage(): void {
    this.noItemsMessage = "Start by adding a todo item.";
  }

  loadTagColors(): void {
    this.tagColorOptions = [
      {
        name: "red",
        hexCode: "#f55e51"
      },
      {
        name: "orange",
        hexCode: "#ebb84b"
      },
      {
        name: "yellow",
        hexCode: "#d5de2a"
      },
      {
        name: "green",
        hexCode: "#8ade31"
      },
      {
        name: "turquoise",
        hexCode: "#30bfaf"
      },
      {
        name: "blue",
        hexCode: "#4391e6"
      },
      {
        name: "purple",
        hexCode: "#803ed6"
      },
      {
        name: "brown",
        hexCode: "#634932"
      },
      {
        name: "gray",
        hexCode: "#999999"
      }
    ]
  }

  private todoItemExists(title: string): boolean {
    return this.todos.some(e => e.title == title);
    
    //Ref: https://stackoverflow.com/questions/42790602/how-do-i-check-whether-an-array-contains-a-string-in-typescript
  }
}
