import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../../services/user.service';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';
import { Book } from '../../models/book.model';
import { CartItem } from '../../models/cartItem.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})
export class IndexComponent implements OnInit {
  currentUser: User;
  books: Array<Book> = [];
  booksWithImages: Array<Book> = [];

  constructor(
    private userService: UserService,
    private bookService: BookService,
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private logger: NGXLogger
  ) { }

  ngOnInit(): void {
    //Check for current user and fetch their car information
    if((this.currentUser = this.userService.currentUserValue)){
      let start_time: number = new Date().getTime();
      this.bookService.getAll().subscribe(
        response => {
          let end_time: number = new Date().getTime();
          this.logger.log("Http-Request", end_time-start_time);
          for(let book of response){
            let tempBook = new Book(book.title, book.authors, book.ISBN, book.publication_date, book.quantity, book.price, book.owner, null);
            tempBook.id = book.id;
            let tokens = book.image_names.split("||");
            for(let i=0; i<tokens.length-1; i++){
              tempBook.image_tokens.push(`${environment.serverBaseURL}/books/image/` + tokens[i]);
            }
            this.books.push(tempBook);
          }
        },
        error =>{
          window.alert("Cannot Get the books!");
          console.log(error);
        }
      );
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  sortBy(books: Array<Book>){
    return books.sort(function(book1, book2){
      if(book1.title > book2.title) return 1;
      if(book1.title < book2.title) return -1;

      if(book1.price > book2.price) return 1;
      if(book1.price < book2.price) return -1;
    })
  }

  updateBook(updatedBook: Book){
    this.bookService.updatedBook = updatedBook;
    console.log(this.bookService.updatedBook);
    this.router.navigate(['/book/update', updatedBook.id]);
  }

  deleteBook(id: number){
    console.log(id);
    if(confirm("Are you sure you want to delete the Book?")){
      this.logger.info("User attempting to delete book: " + id);
      let start_time: number = new Date().getTime();
      this.bookService.deleteByID(id).subscribe(
        response => {
          let end_time: number = new Date().getTime();
          this.logger.log("Http-Request", end_time-start_time);
          window.alert("Book successfully deleted!");
          window.location.reload();
        },
        error => {
          window.alert("Delete failed");
        }
      )
    }
  }

  addToCart(book: Book){
    let cartItem = new CartItem(book.id, this.currentUser.email);
    console.log(cartItem);
    this.logger.info("User attempting to add book to cart: " + book.id);
    let start_time: number = new Date().getTime();
    this.cartService.add(cartItem).subscribe(
      response => {
        let end_time: number = new Date().getTime();
        this.logger.log("Http-Request", end_time-start_time);
        window.alert("Add to your shopping cart successfully!");
      },
      error => {
        window.alert("Cannot add to cart");
        console.log(error);
      }
    )

  }
}
