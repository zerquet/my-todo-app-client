import { Component, ViewChild } from '@angular/core';
import { Todo } from './models/todo.model';
import { EditComponent } from './components/edit/edit.component';
import { ListComponent } from './components/list/list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  @ViewChild(EditComponent) editChild!:EditComponent;
  @ViewChild(ListComponent) listChild!:ListComponent;

  title = 'my-todo-app';

  onTodoClicked(todo: Todo): void {
    this.editChild.loadTodo(todo);
  }

  onTodoUpdated(todo: Todo): void {
    this.listChild.updateList(todo);
  }

  onTodoDeleted(id: number): void {
    this.listChild.deleteTodo(id);
  }
}
