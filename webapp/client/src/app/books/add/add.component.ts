import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.sass']
})
export class AddComponent implements OnInit {
  currentUser: User;
  addBookForm: FormGroup;
  submitted = false;
  uploaded = false;
  images = [];
  imageFiles = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private bookService: BookService,
    private logger: NGXLogger
  ) { }

  ngOnInit(): void {
    if ((this.currentUser = this.userService.currentUserValue)) {
      // Build the form and validations
      this.addBookForm = this.formBuilder.group({
        title: ['', Validators.required],
        authors: ['', Validators.required],
        ISBN: ['', Validators.required],
        publication_date: ['', Validators.required],
        quantity: ['', [Validators.required, Validators.min(1), Validators.max(999), Validators.pattern('\\d+$')]],
        price: ['', [Validators.required, Validators.min(0.01), Validators.max(9999.99), Validators.pattern('^[0-9]{0,6}(\\.[0-9]{1,2})?$')]],
        file: ['', [Validators.required]],
        fileSource: ['', [Validators.required]]

      });
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  get formControls() {
    return this.addBookForm.controls;
  }

  onFileChange(event) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        this.imageFiles.push(event.target.files[i]);
        var reader = new FileReader();

        reader.onload = (event: any) => {
          this.images.push(event.target.result);

          this.addBookForm.patchValue({
            fileSource: this.images
          });
        }

        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.addBookForm.invalid) return;

    let newBook = new Book(this.formControls.title.value, this.formControls.authors.value, this.formControls.ISBN.value,
      this.formControls.publication_date.value, this.formControls.quantity.value, this.formControls.price.value, this.userService.currentUserValue.email, this.imageFiles);

    console.log(newBook);

    //this.bookService.test(newBook).subscribe();
    this.logger.info("User attempting to add book for sale: " + this.userService.currentUserValue.email);
    let start_time: number = new Date().getTime();
    this.bookService.add(newBook).subscribe(
      response => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time - start_time);
        window.alert("Book successfully added!");
        console.log(response);
        this.router.navigate(['/home']);
      },
      error => {
        window.alert("Add failed!");
        console.log(error);
      }
    )
  }

  // Upload(){
  //   const bucket = new S3(
  //     {
  //         accessKeyId: environment.aws_accessKeyId,
  //         secretAccessKey: environment.aws_accessKey,
  //         region: environment.aws_region
  //     });

  //   for(let file of this.imageFiles){
  //     const contentType = file.type;
  //     const params = {
  //         Bucket: environment.aws_S3_bucket,
  //         Key: file.name,
  //         Body: file,
  //         ACL: 'public-read',
  //         ContentType: contentType
  //     };

  //     bucket.upload(params, function (err, data) {
  //         if (err) {
  //             console.log('There was an error uploading your file: ', err);
  //             return false;
  //         }
  //         console.log('Successfully uploaded file.', data);
  //         window.alert("Successfully uploaded!");

  //         return true;
  //     });
  //   }
  // }

}


