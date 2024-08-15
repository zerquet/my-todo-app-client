import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from 'src/app/models/login.model';
import { NewUser } from 'src/app/models/newUser.model';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styles: [
  ]
})
export class LoginComponent {
  user = {
    email: "",
    password: ""
  };

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit(logInForm: any): void {
    if (!logInForm.valid) {
      return;
    }

    const loginUser: Login = {
      email : this.user.email,
      password : this.user.password
    };

    this.loginService.login(loginUser).subscribe(
      (loggedInUser: NewUser) => {
        console.log("Welcome back user " + loggedInUser.username);
        localStorage.setItem("access_token", loggedInUser.token);
        this.router.navigate(["/home"]);
      }
    )
  }
}
