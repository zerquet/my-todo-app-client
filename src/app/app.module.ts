import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListComponent } from './pages/home/components/list/list.component';
import { EditComponent } from './pages/home/components/edit/edit.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ProfileComponent } from './pages/profile/profile.component';
import { MenuComponent } from './shared/components/menu/menu.component';
import { SidepanelComponent } from './pages/home/components/sidepanel/sidepanel.component';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    EditComponent,
    SignupComponent,
    LoginComponent,
    HomeComponent,
    ProfileComponent,
    MenuComponent,
    SidepanelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
