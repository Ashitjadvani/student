import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterFormComponent } from './student/register-form/register-form.component';
import { StudentListComponent } from './student/student-list/student-list.component';

const routes: Routes = [
  {
    path:'',redirectTo:'/register',pathMatch:'full'
  },
  {
    path:'register',component:RegisterFormComponent
  },
  {
    path:'register/:id',component:RegisterFormComponent
  },
  {
    path:'list',component:StudentListComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
