import { Component, OnInit, ViewChild } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { EditComponent } from './components/edit/edit.component';
import { ListComponent } from './components/list/list.component';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild(EditComponent) editChild!:EditComponent;
  @ViewChild(ListComponent) listChild!:ListComponent;

  title = 'my-todo-app';

  constructor(private profileService: ProfileService, private router: Router) { }

  ngOnInit(): void {
    //Home component gets account info and passes it to child components. Move to app.component.ts?
    this.profileService.getAccountInfo().subscribe(
      (accountInfo) => {
        if(accountInfo === null) {
          this.router.navigate(["/login"]); 
        }
        this.listChild.username = accountInfo.username;
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
}
