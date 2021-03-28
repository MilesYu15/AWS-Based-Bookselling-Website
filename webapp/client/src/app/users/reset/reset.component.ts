import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.sass']
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private logger: NGXLogger
  ) { }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]]
    });
  }

  get formControls() {
    return this.resetForm.controls;
  }

  onSubmit(){
    this.submitted = true;  
    if(this.resetForm.invalid) return;
    console.log(this.formControls.email.value);
    let start_time: number = new Date().getTime();
    this.logger.info("Attempting to change user password: " + this.formControls.email.value);
    this.userService.reset(this.formControls.email.value).subscribe(
      response => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time-start_time);
        window.alert("Email sent! Check your inbox.");
        this.router.navigate(['/login']);
      },
      error => {
        if(error.error.code == "ER_USER_NOMATCH")
          window.alert("Email address does not relate to any user.");
        else
          window.alert("Unknown Error!");
      }
    )
  }

}
