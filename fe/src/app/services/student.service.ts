import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3001/api/students';
  constructor(private http: HttpClient) { }

  getAllStudents(keyword: string, fromDate: string, toDate: string): Observable<any> {
    const params = {
      keyword,
      fromDate,
      toDate
    };
    return this.http.get<any>(this.apiUrl,{params});
  }

  getStudentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: any): Observable<any> {
    return this.http.post<any>(this.apiUrl+'/add', student);
  }

  updateStudent(id: string, student: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  imaeUpload(formData:any): Observable<any> {
    
    
    return this.http.post<any>(this.apiUrl+'/upload',formData)
  }
}
