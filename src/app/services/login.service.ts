import { Injectable } from '@angular/core';
import { Login } from '../models/login.model';
import { Observable } from 'rxjs';
import { NewUser } from '../models/newUser.model';
import { HttpClient } from '@angular/common/http';

const BASE_URL = "https://localhost:7025/api/Account/login"

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  login(login: Login): Observable<NewUser> {
    return this.http.post<NewUser>(BASE_URL, login);
  }
}
