import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  serverUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private logger: NGXLogger
  ) { }

  ngOnInit(): void {
    //login form validation
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.serverUrl = environment.serverBaseURL;

  }

  get formControls(){
    return this.loginForm.controls;
  }

  onSubmit(){
    this.logger.info("User attempting to login: " + this.formControls.email.value);
    let start_time: number = new Date().getTime();
    this.userService.login(this.formControls.email.value, this.formControls.password.value).pipe(first()).subscribe(
      data => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time-start_time);
        window.alert("Welcome, " + this.userService.currentUserValue.firstname);
        this.router.navigate(['/home']);
      },
      error => {
        console.log(error.error.code);
        if(error.error.code == "ER_AUTH_FAIL")
          window.alert("Login failed: Username and password do not match.");
        else if(error.error.code == "ER_USER_NOMATCH")
          window.alert("Login failed: Username cannot be found.");
        else
          window.alert("Login failed: Unknown error.");
    });
  }

}
