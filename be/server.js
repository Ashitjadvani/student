const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
// Create an instance of the express application
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('DB Connected!');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Student Model
const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  DOB: { type: Date, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, required: true },
  createdDate: { type: Date, default: Date.now } // Add the createdDate field with a default value of the current date
});

const Student = mongoose.model('Student', studentSchema);

// API Routes
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Create a new student record
// Assuming you have the Student model defined and imported


app.post('/api/students/add', async (req, res) => {
  try {
    const { firstName, lastName, DOB, email, phone, state, city, pincode, password, profileImage } = req.body;

    // Check if email or phone number already exists in the database
    const existingStudent = await Student.findOne({ $or: [{ email }, { phone }] });

    if (existingStudent) {
      // If a student with the same email or phone number exists, return an error
      let errorMessage;
      if (existingStudent.email === email) {
        errorMessage = 'Email already exists.';
      } else if (existingStudent.phone === phone) {
        errorMessage = 'Phone number already exists.';
      } else {
        errorMessage = 'Duplicate key error.';
      }
      return res.status(200).json({ error: errorMessage, status: false });
    }

    // Create a new student document
    const newStudent = new Student({
      firstName,
      lastName,
      DOB,
      email,
      phone,
      state,
      city,
      pincode,
      password,
      profileImage,
    });

    // Save the student to the database using async/await
    const savedStudent = await newStudent.save();
    res.status(201).json({ data: savedStudent, status: true ,message:"Student added succefullay." });
  } catch (err) {
    console.error('Error saving student:', err);
    res.status(500).json({ error: 'Error saving student', status: false });
  }
});



app.post('/api/students/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  // Save the image to the uploads directory
  const file = req.file;
  if (file) {
    const imagePath = path.join(__dirname, `uploads/${file.originalname}`);

    try {
      fs.renameSync(file.path, imagePath);

      // Construct the URL of the uploaded image
      const imageUrl = `http://localhost:3000/uploads/${file.originalname}`;

      // Return the image URL in the API response
      return res.json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
      console.error('Error moving the uploaded file:', error);
      return res.status(500).json({ error: 'Error moving the uploaded file' });
    }
  } else {
    return res.status(400).json({ error: 'No image provided' });
  }
});



  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get all students
// Assuming you have the Student model defined and imported

app.get('/api/students', (req, res) => {
  // Get query parameters from the request
  const { keyword, fromDate, toDate } = req.query;
  // Create an empty filter object to build the MongoDB query
  const filter = {};

  // Add conditions to the filter based on the query parameters
  if (keyword) {
    // Use a case-insensitive regular expression for keyword search in name, email, and phone
    filter.$or = [
      { name: { $regex: new RegExp(keyword, 'i') } },
      { email: { $regex: new RegExp(keyword, 'i') } },
      { phone: { $regex: new RegExp(keyword, 'i') } }
    ];
  }

  if (fromDate && toDate) {
    // Parse fromDate and toDate as Date objects
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    // Add date range condition to the filter
    filter.DOB = { $gte: fromDateObj, $lte: toDateObj };
  }

  // Perform the MongoDB query with the filter
  Student.find(filter)
    .then((students) => {
      res.status(200).json({ data: students, status: true });
    })
    .catch((err) => {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: 'Error fetching students' });
    });
});





// Get a specific student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (student) {
      // The student was found
      res.status(200).json(student);
    } else {
      // Student with the provided ID was not found
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    // Handle any errors that occurred during the retrieval process
    console.error('Error retrieving student:', error);
    res.status(500).json({ error: 'Error retrieving student' });
  }
});

// Update a student record
app.put('/api/students/:id', (req, res) => {
  const { firstName, lastName, dob, email, phone, state, city, pincode, password, profileImage } = req.body;
  const studentId = req.params.id;

  // Build the update object with the fields to be updated
  const updateObject = {
    firstName,
    lastName,
    dob,
    email,
    phone,
    state,
    city,
    pincode,
    password,
    profileImage,
  };

  // Use findByIdAndUpdate to update the student by its ID
  // { new: true } option returns the updated student in the response
  Student.findByIdAndUpdate(studentId, updateObject, { new: true })
    .then(updatedStudent => {
      if (!updatedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(201).json({ data: updatedStudent, status: true ,message:"Student updated succefullay." });
    })
    .catch(error => {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Error updating student' });
    });
});


// Delete a student record
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Remove the student by ID
    const removedStudent = await Student.findByIdAndRemove(studentId);

    if (removedStudent) {
      // The student was successfully removed
      res.status(200).json({ message: 'Student removed successfully' });
    } else {
      // Student with the provided ID was not found
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    // Handle any errors that occurred during the removal process
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Error removing student' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
