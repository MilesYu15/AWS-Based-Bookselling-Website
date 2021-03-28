import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Book } from '../models/book.model';
import { CartItem } from '../models/cartItem.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {


  constructor(
    private http: HttpClient
  ) { }

  public add(cartItem: CartItem){
    return this.http.post<any>(`${environment.serverBaseURL}/carts`, cartItem);
  }

  public getByBuyer(email: string){
    return this.http.get<any>(`${environment.serverBaseURL}/carts/` + email);
  }

  public remove(cartItem: CartItem){
    return this.http.put<any>(`${environment.serverBaseURL}/carts`, cartItem);
  }
}
