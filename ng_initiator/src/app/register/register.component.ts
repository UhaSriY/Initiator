import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Router,NavigationEnd  } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  builder_account_registration : FormGroup;
  builder_account_login : FormGroup;

  @Output() logged_in = new EventEmitter();
  registration_mode : boolean;
  login_mode: boolean;
  constructor(fb: FormBuilder,private router: Router, private as:AuthService) { 
    
    this.builder_account_registration = fb.group({
      firstname:new FormControl('',[Validators.required]),
      lastname: new FormControl('',[Validators.required]),
      username : new FormControl('',[Validators.required]),
      email : new FormControl('',[Validators.required, Validators.email]),
      password : new FormControl('',[Validators.required, Validators.minLength(8)]),
      confirmpassword: new FormControl('',[Validators.required])
      
    })

    this.builder_account_login = fb.group({
      username : new FormControl('',[Validators.required]),
      password : new FormControl('',[Validators.required, Validators.minLength(8)]),
    })
  }

  ngOnInit(): void {
    this.router.url.endsWith("register") ? this.registration_mode = true : this.login_mode = true
    console.log(this.as.isAuthenticated())
  }

  createBuilderAccount(){
    console.log(this.builder_account_registration.value);
    this.as.createBuilderAccount(this.builder_account_registration.value).subscribe(res=>{
      this.router.navigate(['/login'])
    })
  }

  test(){
    this.as.sendClickEvent();
  }
  authenticate(){
    this.as.autheticate(this.builder_account_login.value)
    .subscribe(res=>{
        let loginres= <any>res;
        if(loginres.success) {
          console.log(loginres)
          localStorage.setItem('logged_in_user',loginres.user.username);
          localStorage.setItem('rc_id',loginres.user.research_coordinator_id);
          localStorage.setItem('login_role',loginres.user.role)
          localStorage.setItem('token',loginres.token);
          this.as.sendClickEvent();
          this.router.navigate(['/projects'])
        }
      });
  }

  

}
