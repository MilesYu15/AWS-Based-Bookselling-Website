import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './users/login/login.component';
import { SignupComponent } from './users/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { UpdateComponent } from './users/update/update.component';
import { AddComponent } from './books/add/add.component';
import { BookUpdateComponent } from './books/update/update.component';
import { IndexComponent } from './books/index/index.component';
import { ActivatedRoute } from '@angular/router';
import { TestComponent } from './test/test.component';
import { environment } from '../environments/environment';
import { ResetComponent } from './users/reset/reset.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    UpdateComponent,
    AddComponent,
    BookUpdateComponent,
    IndexComponent,
    TestComponent,
    ResetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    LoggerModule.forRoot({
      serverLoggingUrl: `${environment.serverBaseURL}/client/logs`, 
      level: NgxLoggerLevel.INFO, 
      serverLogLevel: NgxLoggerLevel.INFO,
      enableSourceMaps: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
