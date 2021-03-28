import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.sass']
})
export class UpdateComponent implements OnInit {
  currentUser: User;
  updateForm: FormGroup;
  submitted = false;


  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private logger: NGXLogger
  ) { }

  ngOnInit(): void {
    //Check for current user and fetch their car information
    if((this.currentUser = this.userService.currentUserValue)){

    // Build the form and validations
      this.updateForm = this.formBuilder.group({
          firstname: [this.currentUser.firstname, Validators.required],
          lastname: [this.currentUser.lastname, Validators.required],
          email: [this.currentUser.email, [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
          password: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]]
      });

    }
    else{
      this.router.navigate(['/login']);
    }
  }

  get formControls() {
    return this.updateForm.controls;
  }

  onSubmit(){
    this.submitted = true;  
    if(this.updateForm.invalid) return;
    this.logger.info("User attempting to update user info: " + this.formControls.email.value);
    let start_time: number = new Date().getTime();
    this.userService.update(this.updateForm.value).pipe(first()).subscribe(
      data => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time-start_time);
        window.alert("Success");
        this.router.navigate(['/home']);
      },
      error => {
        console.log(error.error.code);
        if(error.error.code == "ER_USER_NOMATCH")
          window.alert("Update failed: User is not found.");
        else
          window.alert("Update failed: Unknown Error.");
    });
  }
}
