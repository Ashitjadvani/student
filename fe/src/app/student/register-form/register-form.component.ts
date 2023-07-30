import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {
  registrationForm: FormGroup;
  imagePreview: string | ArrayBuffer | null | undefined;



  staate: any = [
    {
      "name": "Andhra Pradesh",
      "cities": ["Hyderabad", "Visakhapatnam", "Vijayawada"]
    },
    {
      "name": "Karnataka",
      "cities": ["Bengaluru", "Mysuru", "Hubballi"]
    },
    {
      "name": "Tamil Nadu",
      "cities": ["Chennai", "Coimbatore", "Madurai"]
    },
    {
      "name": "Maharashtra",
      "cities": ["Mumbai", "Pune", "Nagpur"]
    },
    {
      "name": "Kerala",
      "cities": ["Thiruvananthapuram", "Kochi", "Kozhikode"]
    },
    {
      "name": "Gujarat",
      "cities": ["Ahmedabad", "Surat", "Vadodara"]
    },
    {
      "name": "Rajasthan",
      "cities": ["Jaipur", "Udaipur", "Jodhpur"]
    },
    {
      "name": "Uttar Pradesh",
      "cities": ["Lucknow", "Kanpur", "Agra"]
    },
    {
      "name": "West Bengal",
      "cities": ["Kolkata", "Howrah", "Durgapur"]
    },
    {
      "name": "Delhi",
      "cities": ["New Delhi", "Noida", "Gurgaon"]
    }
  ]


  states: { name: string; cities: string[] }[] = this.staate;
  cities: string[] = [];
  selectedImage: any;
  selectedImage2: any;
  id: any;
  studentId: any;
  constructor(private fb: FormBuilder, private studentService: StudentService, private router: Router,private route:ActivatedRoute,private snackBar: MatSnackBar) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]], // Required and at least 2 characters
      lastName: ['', Validators.required], // Required
      DOB: ['', Validators.required], // Required
      email: ['', [Validators.required, Validators.email]], // Required and valid email format
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Required and 10-digit numeric value only
      state: ['', Validators.required], // Required
      city: ['', Validators.required], // Required
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]], // Required and 6-digit numeric value only
      password: ['', [Validators.required, Validators.minLength(6)]], // Required and at least 6 characters
      confirmPassword: ['', Validators.required], // Required
      profileImage: ['', Validators.required] // Required
    }, {
      validator: this.passwordMatchValidator // Custom validator for password and confirm password matching
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (passwordControl?.value !== confirmPasswordControl?.value) {
      confirmPasswordControl?.setErrors({ passwordMismatch: true });
    } else {
      confirmPasswordControl?.setErrors(null);
    }
  }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.params['id'];
    this.getStudent()
  }

  getStudent(){
    if(this.studentId){
     this.studentService.getStudentById(this.studentId).subscribe(res=>{
      this.registrationForm.patchValue({
        firstName:res.firstName,
        lastName:res.lastName,
        DOB: res.DOB,
        email: res.email,
        phone: res.phone,
        state: res.state,
        city: res.city,
        pincode: res.pincode,
        password:res.password,
        confirmPassword:res.password,
        profileImage:res.profileImage
      })
      setTimeout(() => {
       this.onStateChange(res.state)
       this.registrationForm.patchValue({
        city:res.city
       })
      }, 1000);
      
      this.imagePreview=res.profileImage
      this.selectedImage2=res.profileImage
     })
    }
    
  }

  onSubmit() {
      
    if (this.registrationForm.valid && this.selectedImage2) {
      if (this.selectedImage2) {
        if (!this.studentId) {
          this.studentService.createStudent(this.registrationForm.value).subscribe((res: any) => {
            if(res.status === false){
              this.snackBar.open(res.error, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
            }else{
              this.snackBar.open(res.message, 'Close', { duration: 5000, panelClass: 'success-snackbar' });

              this.router.navigate(['/list']);
            }
            
           
          })
        } else {
          this.studentService.updateStudent(this.studentId,this.registrationForm.value).subscribe((res: any) => {          
            this.snackBar.open(res.message, 'Close', { duration: 5000, panelClass: 'success-snackbar' });
            this.router.navigate(['/list']);
          })
        }
        
      }

    } else {
    
      console.log('Form is invalid');
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      const formData = new FormData();
      formData.append('file', this.selectedImage, this.selectedImage.name);
      this.studentService.imaeUpload(formData).subscribe((res: any) => {
        this.selectedImage2 = res.imageUrl
        this.registrationForm.patchValue({
          profileImage: this.selectedImage2
        })
      })
    }
  }

  onStateChange(stateName: string) {
    const selectedState = this.states.find((state) => state.name === stateName);
    this.cities = selectedState ? selectedState.cities : [];
    this.registrationForm.get('city')?.setValue('');
  }

}
