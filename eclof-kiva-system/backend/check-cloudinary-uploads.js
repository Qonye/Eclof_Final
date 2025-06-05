const mongoose = require('mongoose');
const Submission = require('./models/Submission');

async function checkCloudinaryUploads() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/eclof-kiva', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Get all submissions
    const submissions = await Submission.find().sort({ submissionDate: -1 });
    console.log('\nSubmissions found:', submissions.length);
    
    submissions.forEach((submission, index) => {
      console.log('\n--- Submission', index + 1, '---');
      console.log('Name:', submission.name);
      console.log('Submission Date:', submission.submissionDate);
      
      // Check profile image
      if (submission.profileImage) {
        console.log('Profile Image URL:', submission.profileImage);
        console.log('Is Cloudinary URL?', submission.profileImage.includes('cloudinary.com'));
      } else {
        console.log('Profile Image: Not provided');
      }
      
      // Check client signature
      if (submission.clientSignature) {
        console.log('Client Signature URL:', submission.clientSignature);
        console.log('Is Cloudinary URL?', submission.clientSignature.includes('cloudinary.com'));
      } else {
        console.log('Client Signature: Not provided');
      }
      
      // Check representative signature
      if (submission.repSignature) {
        console.log('Rep Signature URL:', submission.repSignature);
        console.log('Is Cloudinary URL?', submission.repSignature.includes('cloudinary.com'));
      } else {
        console.log('Rep Signature: Not provided');
      }
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCloudinaryUploads();
