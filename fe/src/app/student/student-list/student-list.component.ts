import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import {FormGroup, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgIf, JsonPipe} from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  students: any;
  displayedColumns: string[] = ['image', 'firstName', 'lastName', 'email','phone','dob','pin','state','city', 'action'];
  dataSource = [];
  keyword: string='';
  fromDate: string='';
  toDate: string='';
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
constructor(private studentService: StudentService,private router: Router,private snackBar: MatSnackBar){
  
}
  ngOnInit(): void {
    this.getStudents(this.keyword, this.fromDate, this.toDate)
  }

  onSearchInputChange(){
    this.getStudents(this.keyword, this.fromDate, this.toDate)

  }

  getStudents(keyword:any, fromDate:any, toDate:any): void {
    this.studentService.getAllStudents(keyword, fromDate, toDate).subscribe(
      (data) => {
        this.students = data;
        this.dataSource=this.students.data
        
      },
      (error) => {
        console.error('Error fetching students:', error);
      }
    );
  }
  deleteStudent(id:any){
    this.studentService.deleteStudent(id).subscribe(res=>{
      this.snackBar.open(res.message, 'Close', { duration: 5000, panelClass: 'success-snackbar' });
      this.getStudents(this.keyword, this.fromDate, this.toDate)
    })
  }
  editStudent(id:any){
    this.router.navigate(['/register/'+id]);
  }
  onDateInputChange(){
    const startDate = this.range.controls.start.value;
    const endDate = this.range.controls.end.value;

    const start =startDate?.toISOString()
    const end =endDate?.toISOString()
    // Convert the dates to the desired format (if needed)
this.getStudents(this.keyword,start,end)
   
  }
}
