import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Router,NavigationEnd  } from '@angular/router';
import { BuilderService } from 'src/app/services/builder.service';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
create_project_form : FormGroup
  constructor( private fb: FormBuilder, private bs: BuilderService ,private dialogRef: MatDialogRef<CreateComponent>,) { 
    
    this.create_project_form = fb.group({
      name :new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),
      // tools_you_need : new FormControl('',[Validators.required]),
    })
  }

  ngOnInit(): void {
  }

  createProject(){
    let research_coordinator_id = localStorage.getItem('rc_id')
    if(this.create_project_form.valid){
      this.bs.createProject(this.create_project_form.value,research_coordinator_id).subscribe(project_create_res=>{
        console.log(project_create_res);
        this.dialogRef.close(project_create_res);
      });
    }
  }

  biomarker_selected = false;
  registry_selected = false;
  aiMarrvel_selected = false;
  onSelectCard(appName) {
    this[appName] = !this[appName]
  }
}
