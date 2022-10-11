import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ListComponent } from './list/list.component';
import { ProjectsComponent } from './projects.component';
import { MatIconModule } from '@angular/material/icon/';
import { CreateComponent } from './create/create.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [
    ListComponent,
    ProjectsComponent,
    CreateComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    MatIconModule,


    MatCardModule,
    MatButtonModule,
    FormsModule, ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatSelectModule, MatTooltipModule,MatDividerModule,MatDialogModule,
    MatExpansionModule,MatTabsModule
  ]
})
export class ProjectsModule { }
