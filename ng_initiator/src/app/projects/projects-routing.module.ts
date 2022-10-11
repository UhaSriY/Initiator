import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { ProjectsComponent } from './projects.component';

const routes: Routes = [
 {path:'', redirectTo:"list", pathMatch:'full'},
 { path: 'list', component: ListComponent },
 { path: 'create', component:CreateComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
