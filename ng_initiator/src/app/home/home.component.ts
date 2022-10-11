import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private matIconRegistry: MatIconRegistry,private domSanitizer: DomSanitizer) {  
    this.matIconRegistry.addSvgIcon("hipaa",  this.domSanitizer.bypassSecurityTrustResourceUrl("./../../assets/icons/hipaa_compliant.svg")); }
  ngOnInit(): void {
  }

}
