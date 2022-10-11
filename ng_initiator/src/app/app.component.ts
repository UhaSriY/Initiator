import { Component,  } from '@angular/core';
import { AppConfig } from './app.config';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // title = 'template-front';
  loginEventSubscription:Subscription;
  isLoggedIn : boolean = false;
  loggedInUser :string = "" ;
  constructor(private config: AppConfig, private router:Router, private as:AuthService){
    this.as.getClickEvent().subscribe(()=>{
      console.log("click event received")
      console.log(this.as.isAuthenticated());
      this.isLoggedIn = this.as.isAuthenticated()
      this.loggedInUser = localStorage.getItem('logged_in_user') || ""
    })
  }

   env = ""
   host = ""
   title = ""
  ngOnInit(){
    this.env = this.config.getEnv('env')
    this.host = this.config.getConfig('host')
    this.title = this.config.getConfig('title')
    this.isLoggedIn = this.as.isAuthenticated();
    this.loggedInUser = localStorage.getItem('logged_in_user') || ""
  
  }

  logout(){
    this.as.logout();
    this.isLoggedIn = this.as.isAuthenticated();
    // this.router.navigate(['/'])
  }
}
