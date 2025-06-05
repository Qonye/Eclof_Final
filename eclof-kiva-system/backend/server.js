const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// Import the profile generator
const { generateProfile } = require('./profile-generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Define base directories using environment variables or defaults
const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
const SUBMISSIONS_DIR = process.env.SUBMISSIONS_PATH || path.join(__dirname, 'submissions');

// Ensure directories exist
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Uploads directory created at: ${UPLOADS_DIR}`);
  } else {
    console.log(`Uploads directory already exists at: ${UPLOADS_DIR}`);
  }
  if (!fs.existsSync(SUBMISSIONS_DIR)) {
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    console.log(`Submissions directory created at: ${SUBMISSIONS_DIR}`);
  } else {
    console.log(`Submissions directory already exists at: ${SUBMISSIONS_DIR}`);
  }
} catch (error) {
  console.error('Error creating initial directories:', error);
  // If directories can't be created, the app might not function correctly.
  // Depending on the severity, you might want to exit the process:
  // process.exit(1); 
}

// Enable CORS for client requests
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve uploads and submissions directories as static paths
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/submissions', express.static(SUBMISSIONS_DIR));

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist (already handled above, but good for safety)
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Configure multer for handling multipart/form-data
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Handle form submissions
app.post('/api/submit', upload.single('profileImage'), (req, res) => {
  try {
    // Get form data
    const formData = req.body;
    console.log('Received submission data:', formData); // Log incoming data
    
    // Process base64 images from signatures
    if (formData.clientSignatureImage) {
      const base64Data = formData.clientSignatureImage.replace(/^data:image\/png;base64,/, '');
      const signatureFilename = path.join(UPLOADS_DIR, `clientSignature-${Date.now()}.png`);
      console.log('Attempting to write client signature to:', signatureFilename);
      fs.writeFileSync(signatureFilename, base64Data, 'base64');
      console.log('Client signature written successfully.');
      formData.clientSignatureImagePath = signatureFilename;
    }
    
    if (formData.repSignatureImage) {
      const base64Data = formData.repSignatureImage.replace(/^data:image\/png;base64,/, '');
      const repSignatureFilename = path.join(UPLOADS_DIR, `repSignature-${Date.now()}.png`);
      console.log('Attempting to write rep signature to:', repSignatureFilename);
      fs.writeFileSync(repSignatureFilename, base64Data, 'base64');
      console.log('Rep signature written successfully.');
      formData.repSignatureImagePath = repSignatureFilename;
    }
    
    // Add the profile image path to the form data if uploaded
    if (req.file) {
      formData.profileImagePath = req.file.path;
      console.log('Profile image uploaded to:', req.file.path);
    }
    
    // Generate a submission ID
    const submissionId = `ECLOF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Save the submission data to a JSON file
    const submissionData = {
      id: submissionId,
      timestamp: new Date().toISOString(),
      data: formData,
      profileImagePath: req.file ? req.file.path : null
    };
    
    // Ensure submissions directory exists (already handled above, but good for safety)
    if (!fs.existsSync(SUBMISSIONS_DIR)) {
      console.log('Submissions directory check: creating as it does not exist (unexpected at this stage).');
      fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    }
    
    const submissionFilePath = path.join(SUBMISSIONS_DIR, `submission-${submissionId}.json`);
    console.log('Attempting to write submission JSON to:', submissionFilePath);
    fs.writeFileSync(submissionFilePath, JSON.stringify(submissionData, null, 2));
    console.log('Submission JSON written successfully to:', submissionFilePath);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      submissionId: submissionId
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your submission.',
      error: error.message
    });
  }
});

// ADMIN API ENDPOINTS

// Get all submissions for admin dashboard
app.get('/api/admin/submissions', (req, res) => {
  try {
    console.log('Looking for submissions in:', SUBMISSIONS_DIR);

    // Check if submissions directory exists
    if (!fs.existsSync(SUBMISSIONS_DIR)) {
      console.log('Submissions directory does not exist.');
      return res.status(200).json([]);
    }

    // Read all submission files
    const submissionFiles = fs.readdirSync(SUBMISSIONS_DIR)
      .filter(file => file.endsWith('.json'));

    console.log('Found submission files:', submissionFiles);

    if (submissionFiles.length === 0) {
      console.log('No submission files found.');
      return res.status(200).json([]);
    }

    // Parse each submission file
    const submissions = submissionFiles.map(file => {
      const filePath = path.join(SUBMISSIONS_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    });

    // Sort by timestamp, newest first
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving submissions.',
      error: error.message
    });
  }
});

// Get a specific submission by ID
app.get('/api/admin/submissions/:id', (req, res) => {
  try {
    const submissionId = req.params.id;
    
    // Find the submission file
    const submissionFiles = fs.readdirSync(SUBMISSIONS_DIR)
      .filter(file => file.includes(submissionId) && file.endsWith('.json'));
    
    if (submissionFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }
    
    // Read the submission file
    const filePath = path.join(SUBMISSIONS_DIR, submissionFiles[0]);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const submission = JSON.parse(fileContent);
    
    res.status(200).json(submission);
  } catch (error) {
    console.error('Error retrieving submission:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the submission.',
      error: error.message
    });
  }
});

// Delete a submission
app.delete('/api/admin/submissions/:id', (req, res) => {
  try {
    const submissionId = req.params.id;
    
    // Find the submission file
    const submissionFiles = fs.readdirSync(SUBMISSIONS_DIR)
      .filter(file => file.includes(submissionId) && file.endsWith('.json'));
    
    if (submissionFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }
    
    // Read the submission file to get file paths before deleting
    const filePath = path.join(SUBMISSIONS_DIR, submissionFiles[0]);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const submission = JSON.parse(fileContent);
    
    // Delete associated files
    // - Profile image
    if (submission.profileImagePath && fs.existsSync(submission.profileImagePath)) {
      fs.unlinkSync(submission.profileImagePath);
    }
    
    // - Client signature image
    if (submission.data.clientSignatureImagePath && fs.existsSync(submission.data.clientSignatureImagePath)) {
      fs.unlinkSync(submission.data.clientSignatureImagePath);
    }
    
    // - Representative signature image
    if (submission.data.repSignatureImagePath && fs.existsSync(submission.data.repSignatureImagePath)) {
      fs.unlinkSync(submission.data.repSignatureImagePath);
    }
    
    // Delete the submission JSON file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the submission.',
      error: error.message
    });
  }
});

// Profile Generation Endpoint
app.post('/api/admin/generate-profile/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    // Find the submission file
    const submissionFiles = fs.readdirSync(SUBMISSIONS_DIR)
      .filter(file => file.includes(submissionId) && file.endsWith('.json'));
    
    if (submissionFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }
    
    // Read the submission file
    const filePath = path.join(SUBMISSIONS_DIR, submissionFiles[0]);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const submission = JSON.parse(fileContent);
    
    // Generate profile using the submission data
    const result = await generateProfile(submission.data);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate profile',
        error: result.error
      });
    }
    
    // If the generation was successful, update the submission with the generated profile
    submission.generatedProfile = result.data;
    submission.profileGeneratedAt = new Date().toISOString();
    
    // Save the updated submission
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2));
    
    res.status(200).json({
      success: true,
      profile: result.data,
      submission: submission // Include the full submission data
    });
  } catch (error) {
    console.error('Error generating profile:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the profile.',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Form submission endpoint: http://localhost:${PORT}/api/submit`);
  console.log(`Admin dashboard available at: http://localhost:${PORT}/admin.html`);
});