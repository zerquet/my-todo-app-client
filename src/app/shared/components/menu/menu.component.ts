import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.component.html',
  styles: [
  ]
})
export class MenuComponent implements OnInit {
  profilePictureUrl: string = "";
  
  constructor(private router: Router, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getAccountInfo().subscribe(
      (profileInfo) => {
        this.profilePictureUrl = 'data:image/jpeg;base64,' + profileInfo.profilePictureBase64
      }
    )
  }

  logout(): void {
    localStorage.setItem("access_token", "");
    this.router.navigate(["/login"]);
  }

}
