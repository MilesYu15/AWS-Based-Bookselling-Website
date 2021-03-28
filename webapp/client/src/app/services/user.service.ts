import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) { 
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public search(email: string): Observable<User>{
    const user$ = this.http.get<User>(`${environment.serverBaseURL}/user/` + email);
    return user$;
  }

  public register(user: User){
    return this.http.post<any>(`${environment.serverBaseURL}/users/register`, user);
  }

  public update(user: User){
    return this.http.put<any>(`${environment.serverBaseURL}/user/update`, user).pipe(map(
      user=>{
        if(user && user.token){
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }
    ));
  }

  public testUpdate(user: User){
    this.http.put<any>(`${environment.serverBaseURL}/user/testUpdate`, user).subscribe(
      response => {
        console.log("This is success");
        console.log(response);
      },
      error => {
        console.log("This is error");
        console.log(error);
      }
    );
  }

  public login(email: string, password: string, ){
    return this.http.post<any>(`${environment.serverBaseURL}/user/authenticate`, {email, password}).pipe(map(
      user=>{
        if(user && user.token){
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }
    ));
  }

  public logout(){
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  public reset(email: string){
    return this.http.post<any>(`${environment.serverBaseURL}/user/reset`, {"email": email});
  }

  public setCurrentUser(user: User){
    var old = JSON.parse(localStorage.getItem('currentUser'));
    console.log(old.email);
    old.firstname = user.firstname;
    old.lastname = user.lastname;
    console.log(old);
    localStorage.setItem('currentUser', JSON.stringify(old));

  }
}
