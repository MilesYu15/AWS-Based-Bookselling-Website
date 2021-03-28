import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';


import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Book } from '../models/book.model';
import { Header } from 'aws-sdk/clients/mediastore';
import { RequestOptions } from '@angular/http';


@Injectable({
  providedIn: 'root'
})
export class BookService {
  updatedBook: Book;


  constructor(
    private http: HttpClient
  ) { }

  public test(newBook: Book){
    // const HttpUploadOptions = {
    //   headers: new HttpHeaders({ "Accept": "application/json" })
    // }

    let payload = new FormData();
    payload.append("title", newBook.title);
    payload.append("authors", newBook.authors);
    payload.append("ISBN", newBook.ISBN);
    payload.append("owner", newBook.owner);
    payload.append("publication_date", newBook.publication_date);
    payload.append("quantity", newBook.quantity.toString());
    payload.append("price", newBook.price.toString());
    for(let image of newBook.images){
      payload.append("imageFile", image);
    }

    return this.http.post<any>(`${environment.serverBaseURL}/books/test`, payload);
  }

  public add(book: Book){

    let payload = new FormData();
    payload.append("title", book.title);
    payload.append("authors", book.authors);
    payload.append("ISBN", book.ISBN);
    payload.append("owner", book.owner);
    payload.append("publication_date", book.publication_date);
    payload.append("quantity", book.quantity.toString());
    payload.append("price", book.price.toString());
    for(let image of book.images){
      payload.append("imageFile", image);
    }
    return this.http.post<any>(`${environment.serverBaseURL}/books/add`, payload);
  }

  public updateBook(book: Book){
    return this.http.put<any>(`${environment.serverBaseURL}/book/update`, book);
  }

  public getAll(){
    return this.http.get<any>(`${environment.serverBaseURL}/books`);
  }

  public getCartBooks(cartBooks: string[]){
    console.log(cartBooks);
    const params = new HttpParams()
      .set('bookIDs', cartBooks.toString());
    return this.http.get<any>(`${environment.serverBaseURL}/books/cart`, {params});
  }
  

  public searchByOwner(email: string){
    return this.http.get<any>(`${environment.serverBaseURL}/books/` + email);
  }

  public searchByID(id: string){
    return this.http.get<any>(`${environment.serverBaseURL}/book/` + id);
  }

  public deleteByID(id: number){
    return this.http.delete<any>(`${environment.serverBaseURL}/book/` + id);
  }


  // public uploadFile(files: File[]) {


  //   const bucket = new S3(
  //         {
  //             accessKeyId: environment.aws_accessKeyId,
  //             secretAccessKey: environment.aws_accessKey,
  //             region: environment.aws_region
  //         }
  //     );
    
  //   for(let file of files){
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
