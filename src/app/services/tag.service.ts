import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';

const BASE_URL = "https://localhost:7025/api/Tags"

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private http: HttpClient) { }

  createTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(BASE_URL, tag);
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(BASE_URL);
  }

  getTag(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${BASE_URL}/${id}`);
  }

  updateTag(tag: Tag): Observable<void> {
    return this.http.put<void>(`${BASE_URL}/${tag.id}`, tag);
  }

  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
