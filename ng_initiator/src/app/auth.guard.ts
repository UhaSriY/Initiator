import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './services/auth.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router, 
    private as: AuthService) {}

  canActivate() {
    if (this.as.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }

}