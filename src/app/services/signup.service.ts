import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../models/register.model';
import { Observable } from 'rxjs';
import { NewUser } from '../models/newUser.model';

const BASE_URL = "https://localhost:7025/api/Account/register"

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(private http: HttpClient) { }

  register(register: Register): Observable<NewUser> {
    return this.http.post<NewUser>(BASE_URL, register);
  }
}
