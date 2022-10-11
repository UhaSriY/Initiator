import { Component, OnInit,ViewChild } from '@angular/core';
import { CreateComponent } from '../create/create.component';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { BuilderService } from 'src/app/services/builder.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(public dialog: MatDialog, private bs:BuilderService) { }

  listOfProjects:any = [] ;
  ngOnInit(): void {
    this.populateProjects();
  }

  createEnv(projectName){

    let username = localStorage.getItem('logged_in_user') || ""
    projectName = projectName.replace(/\s+/g, '');
    console.log(projectName);
    this.bs.createEnvironment(projectName).subscribe(res=>{
      console.log(res)
    })
    // if(username != ""){
    //   username = username.toLowerCase()
    //   projectName = projectName.toLowerCase()
    //   console.log(this.bs.createEnvironment(projectName))
    // }

  }
  populateProjects(){
    this.listOfProjects = []
    this.bs.getProjectsForthisRC().subscribe(res=>{
      console.log(res)
      this.listOfProjects = <any>res;
      console.log(this.listOfProjects)
    })
  }

  openCreateDialog(){
    const dialogRef = this.dialog.open(CreateComponent,{height:'55vh', width:'100%'});

    dialogRef.afterClosed().subscribe(result => {
      this.populateProjects();
      // console.log(`Dialog result: ${result}`);
    });
  }
}
