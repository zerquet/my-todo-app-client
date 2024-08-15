import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NewUser } from '../models/newUser.model';
import { HttpClient } from '@angular/common/http';
import { Profile } from '../models/profile.model';

const BASE_URL = "https://localhost:7025/api/Profile"

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getAccountInfo(): Observable<Profile> {
    return this.http.get<Profile>(BASE_URL);
  }

  updateProfile(updatedProfile: Profile): Observable<void> {
    //Because the api endpoint receives multipart/form-data (a file along with other data) instead of just JSON, we create a new FormData object and use that
    //The content type is now multipart/form-data and not application/json anymore. 
    //Ref: https://stackoverflow.com/a/58788504/20829897
    const payload = new FormData();
    payload.append('username', updatedProfile.username);
    payload.append('newProfilePicture', updatedProfile.newProfilePicture);

    return this.http.put<void>(BASE_URL, payload);
  }
}
