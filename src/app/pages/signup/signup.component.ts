import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NewUser } from 'src/app/models/newUser.model';
import { Register } from 'src/app/models/register.model';
import { SignupService } from 'src/app/services/signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.component.html',
  styles: [
  ]
})
export class SignupComponent {
  user = {
    username: "",
    email: "",
    password: "",
    verifiedPassword: ""
  };
  passwordsMatch: boolean | undefined = undefined;

  constructor(private router: Router, private signupService: SignupService) {}

  onSubmit(signupForm: any): void {
    //TO DO: Find better way to lump verify password logic with how the rest of the fields are validated. Currently it's validated in onSubmit()
    if(this.user.password !== this.user.verifiedPassword) {
      this.passwordsMatch = false;
      return;
    } 
    else {
      this.passwordsMatch = true;
    }

    if(!signupForm.valid) {
      return;
    }
    
    if(signupForm.valid && this.passwordsMatch) {
      this.passwordsMatch = true;

      const registerUser: Register = {
        username : this.user.username,
        emailAddress : this.user.email,
        password : this.user.password
      };

      this.signupService.register(registerUser).subscribe(
        (newUser: NewUser) => {
          console.log("Welcome new user " + newUser.username);
          localStorage.setItem("access_token", newUser.token);
          this.router.navigate(["/home"]);
        }
      );

    }
  }
}
