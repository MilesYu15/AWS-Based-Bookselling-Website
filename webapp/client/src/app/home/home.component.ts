import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

import { UserService } from '../services/user.service';
import { BookService } from '../services/book.service';
import { CartService } from '../services/cart.service';
import { User } from '../models/user.model';
import { Book } from '../models/book.model';
import { CartItem} from '../models/cartItem.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  updateForm: FormGroup;
  ownedBooks: Array<Book> = [];
  cartItems: Array<CartItem>;
  cartBooks: Array<Book> = [];
  submitted = false;
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
      this.logger.info("Retrieving user books on sale: " + this.currentUser.email);
      let start_time: number = new Date().getTime();
      this.bookService.searchByOwner(this.currentUser.email).subscribe(
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
            this.ownedBooks.push(tempBook);
          }
          console.log(this.ownedBooks);

        },
        error =>{
          window.alert("Error: Cannot get owned books");
        }
      );

      this.logger.info("Retrieving user cart items: " + this.currentUser.email);
      let start_time2: number = new Date().getTime();
      this.cartService.getByBuyer(this.currentUser.email).subscribe(
        response => {
          let end_time: number = new Date().getTime();
          this.logger.log("Http-Request", end_time-start_time2);
          this.cartItems = response;
          console.log(this.cartItems);

          this.cartItems.forEach((x) => {
            let start_time3: number = new Date().getTime();
            this.bookService.searchByID(x.bookID.toString()).subscribe(
              data => {
                let end_time: number = new Date().getTime();
                this.logger.log("Http-Request", end_time-start_time3);
                for(let book of data){
                  let tempBook = new Book(book.title, book.authors, book.ISBN, book.publication_date, book.quantity, book.price, book.owner, null);
                  tempBook.id = book.id;
                  let tokens = book.image_names.split("||");
                  for(let i=0; i<tokens.length-1; i++){
                    tempBook.image_tokens.push(`${environment.serverBaseURL}/books/image/` + tokens[i]);
                  }
                  this.cartBooks.push(tempBook);
                }
              },
              err => {
                console.log("Could not get book by id " + x.bookID);
              }
            )
          })

        },
        error => {
          window.alert("Error: Cannot get cart items");
          console.log(error);
        }
      )

      //this.bookService.getCartBooks(['12', '13']).subscribe();
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  logout(){
    console.log("You try to logout");
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  testUpdate(){
    this.userService.testUpdate(new User("J","Yu", "helo@eail.com"));
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
          console.log(response);
          window.location.reload();
        },
        error => {
          window.alert("Delete failed");
        }
      )
    }
  }

  remove(book: Book){
    console.log(book);
    if(confirm("Are you sure you want to remove this book from your cart?")){
      this.logger.info("User attempting to remove book from cart: " + book.id); 
      let start_time: number = new Date().getTime();
      this.cartService.remove(new CartItem(book.id, this.currentUser.email)).subscribe(
        response => {
          let end_time: number = new Date().getTime();
          this.logger.log("Http-Request", end_time-start_time);
          window.alert("Cart item removed successfully!");
          window.location.reload();
        },
        error => {
          window.alert("Cannot remote cart item");
          console.log(error);
        }
      )
    }
  }

}
