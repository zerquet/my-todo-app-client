import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Profile } from 'src/app/models/profile.model';
import { ProfileService } from 'src/app/services/profile.service';

const allowedFileTypes = ["image/jpeg", "image/jpg"];

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styles: [
  ]
})
export class ProfileComponent implements OnInit {
  @ViewChild('pfpFileInput') pfpFileInput!: ElementRef;

  account = {
    username: "",
    profilePictureUrl: "",
  };
  pfpToUpload: File | null = null;
  errorMessage: string | null = null;
  onSubmitErrorMessage: string | null = null;
  showSuccessMessage: boolean = false;

  constructor(private router: Router, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadAccount();
  }

  onPfpSelected(e: Event): void {
    this.errorMessage = null;
    const file = (<HTMLInputElement>e.target).files![0];
    if (file.size >= 1000000) {
      this.errorMessage = "File size exceeds accepted amount.";
      return;
    } 
    else if (!allowedFileTypes.includes(file.type)) {
      this.errorMessage = "File type is not allowed.";
      return;
    }
    this.pfpToUpload = file;
    const reader = new FileReader();
    reader.readAsDataURL(file!);
    reader.onload = (_event) => {
      this.account.profilePictureUrl = reader.result!.toString();
    }
  }

  saveChanges(form: NgForm): void {
    this.onSubmitErrorMessage = null;
    this.showSuccessMessage = false;
    
    if(this.errorMessage != null) {
      this.onSubmitErrorMessage = "Please address previous errors before submitting.";
      return;
    }

    const editProfile: Profile = {
      username: this.account.username,
      newProfilePicture: this.pfpToUpload!
    };

    this.profileService.updateProfile(editProfile).subscribe(
      () => {
        this.loadAccount();
      }
    )
    this.pfpToUpload = null;
    //Reset file input. Ref: https://stackoverflow.com/a/40165524/20829897
    this.pfpFileInput.nativeElement.value = "";
    //form.resetForm();
    this.showSuccessMessage = true;
  }

  private loadAccount(): void {
    this.profileService.getAccountInfo().subscribe(
      (profile) => {
        this.account = {
          username: profile.username,
          profilePictureUrl: 'data:image/jpeg;base64,' + profile.profilePictureBase64, //base 64 URL
        }
      },
      (error:any) => {
        this.router.navigate(["/login"]);
      }
    );
  }
}
