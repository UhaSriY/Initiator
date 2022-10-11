import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BuilderService {

  constructor(private httpc:HttpClient) { }

  createProject(projectDetails, research_coordinator_id){
    let reqObj:any = {}
    reqObj.file_input = {research_coordinator_id: research_coordinator_id, filename:"test.jpg", description:"project image" }
    reqObj.project_inp = projectDetails
    reqObj.relation_inp= { role:localStorage.getItem('login_role'), added_by:"self" } 
    projectDetails.project_picture_file = "1"
    // let reqObj = projectDetails
    reqObj.research_coordinator_id = research_coordinator_id;
    return this.httpc.post("http://localhost:3040/project/create",reqObj);
  }

  getProjectsForthisRC(){
    let projectDetails:any = {} 
    projectDetails.research_coordinator_id = localStorage.getItem('rc_id')
    return this.httpc.post("http://localhost:3040/project/listbyrc",projectDetails);
  }

  createEnvironment(projectId){
    return this.httpc.post("http://localhost:3040/api/createinstance",{name:projectId});
  }
}
