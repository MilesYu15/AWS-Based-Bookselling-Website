import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.sass']
})
export class BookUpdateComponent implements OnInit {
  currentUser: User;
  updateBookForm: FormGroup;
  submitted = false;
  updatedBook: Book;
  images = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private bookService: BookService,
    private logger: NGXLogger
  ) { }

  ngOnInit(): void {
    if ((this.currentUser = this.userService.currentUserValue)) {
      let id = this.route.snapshot.paramMap.get('id');
      this.updatedBook = this.bookService.updatedBook;

      this.updateBookForm = this.formBuilder.group({
        title: [this.bookService.updatedBook.title, Validators.required],
        authors: [this.bookService.updatedBook.authors, Validators.required],
        ISBN: [this.bookService.updatedBook.ISBN, Validators.required],
        publication_date: [this.bookService.updatedBook.publication_date.split('T')[0], Validators.required],
        quantity: [this.bookService.updatedBook.quantity, [Validators.required, Validators.min(0), Validators.max(999), Validators.pattern('\\d+$')]],
        price: [this.bookService.updatedBook.price, [Validators.required, Validators.min(0.01), Validators.max(9999.99), Validators.pattern('^[0-9]{0,6}(\\.[0-9]{1,2})?$')]]
      });
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  get formControls() {
    return this.updateBookForm.controls;
  }

  RemoveImage(url) {
    var temp = [];
    for (let token of this.updatedBook.image_tokens) {
      if (token != url) {
        temp.push(token);
      }
    }
    this.updatedBook.image_tokens = temp;
    console.log(this.updatedBook.image_tokens);

  }

  onSubmit() {
    this.submitted = true;
    if (this.updateBookForm.invalid) return;

    let updatedBook = new Book(this.formControls.title.value, this.formControls.authors.value, this.formControls.ISBN.value,
      this.formControls.publication_date.value, this.formControls.quantity.value, this.formControls.price.value, this.userService.currentUserValue.email, this.images);

    var tempImageNames = "";
    for (let image of this.updatedBook.image_tokens) {
      let pathTokens = image.split("/");
      let filename = pathTokens[pathTokens.length - 1];
      tempImageNames = tempImageNames.concat(filename + "||");
    }
    console.log(tempImageNames);
    updatedBook.image_names = tempImageNames;

    updatedBook.id = this.bookService.updatedBook.id;
    console.log(updatedBook);

    this.logger.info("User attempting to update book: " + updatedBook.id);
    let start_time: number = new Date().getTime();
    this.bookService.updateBook(updatedBook).subscribe(
      response => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time - start_time);
        window.alert("Book successfully updated!");
        console.log(response);
        this.router.navigate(['/home']);
      },
      error => {
        window.alert("Update failed!");
        console.log(error);
      }
    )
  }

}
