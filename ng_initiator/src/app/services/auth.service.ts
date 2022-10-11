import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private subject = new Subject<any>();
  constructor(private httpc:HttpClient, private router:Router,public jwtHelper: JwtHelperService) { }

  apiUrl = "http://localhost:3040/";
  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent(): Observable<any>{ 
    return this.subject.asObservable();
  }

  createBuilderAccount(regObj){
    regObj.profile_picture_file = "1"
   return this.httpc.post(this.apiUrl+"auth/register",regObj) 
  }

  autheticate(cred_obj){
    return this.httpc.post("http://localhost:3040/auth/authenticate",cred_obj);
  }

  logout(){
    localStorage.removeItem('logged_in_user');
    localStorage.removeItem('token');
    this.router.navigate(['/home'])
  }

  public isAuthenticated(): boolean {
    let token:string = <string>localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }
}
