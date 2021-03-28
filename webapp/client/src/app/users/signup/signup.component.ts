import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.sass']
})
export class SignupComponent implements OnInit {
    registerForm: FormGroup;
    submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router, 
    private userService: UserService,
    private logger: NGXLogger

  ) { }

  ngOnInit(): void {
    // Build the form and validations
    this.registerForm = this.formBuilder.group({
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
        password: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]]
    });
  }

  get formControls() {
    return this.registerForm.controls;
  }

  onSubmit(){
    this.submitted = true;  
    if(this.registerForm.invalid) return;

    this.logger.info("Attempting to create user: " + this.formControls.email.value);
    let start_time: number = new Date().getTime();
    this.userService.register(this.registerForm.value).subscribe(
      response => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time-start_time);
        window.alert("Registered successfully. Please login!");
        this.router.navigate(['/login']);
      },
      error => {
        if(error.error.code == "ER_DUP_ENTRY")
          window.alert("Email has been used by another use. Choose a different email address.");
        else
          window.alert("Unknown Error!");
      }
    )
  }

}
