import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TodoList } from '../models/todolist.model';
import { Observable } from 'rxjs';

const BASE_URL = "https://localhost:7025/api/TodoLists";

@Injectable({
  providedIn: 'root'
})
export class TodolistService {

  constructor(private http: HttpClient) { }

  createList(todoList: TodoList): Observable<TodoList> {
    return this.http.post<TodoList>(BASE_URL, todoList);
  }

  getLists(): Observable<TodoList[]> {
    return this.http.get<TodoList[]>(BASE_URL);
  }

  getList(id: number): Observable<TodoList> {
    return this.http.get<TodoList>(`${BASE_URL}/${id}`);
  }

  updateList(todoList: TodoList): Observable<void> {
    return this.http.put<void>(`${BASE_URL}/${todoList.id}`, todoList)
  }

  deleteList(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
