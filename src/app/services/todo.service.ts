import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';
import { Observable } from 'rxjs';

const BASE_URL = "https://localhost:7025/api/TodoItems";

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(private http: HttpClient) { }

  createTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(BASE_URL, todo);
  }

  getTodo(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${BASE_URL}/${id}`)
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(BASE_URL);
  }

  getDueToday(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${BASE_URL}/getDueToday`);
  }

  countTotal(): Observable<number> {
    return this.http.get<number>(`${BASE_URL}/count`);
  }

  countCompleted(): Observable<number> {
    return this.http.get<number>(`${BASE_URL}/completedCount`);
  }

  countDueToday(): Observable<number> {
    return this.http.get<number>(`${BASE_URL}/dueTodayCount`);
  }

  updateTodo(todo: Todo): Observable<void> {
    return this.http.put<void>(`${BASE_URL}/${todo.id}`, todo);
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }

  deleteTodos(ids: number[]): Observable<void> {
    return this.http.delete<void>(BASE_URL, { body: ids});
  }
}
