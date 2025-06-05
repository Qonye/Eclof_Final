const Submission = require('../models/Submission');
const { uploadImage, uploadSignature, deleteImage } = require('../config/cloudinary');
const { generateProfile } = require('../services/profile-generator');
const fs = require('fs');
const path = require('path');

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Public
const createSubmission = async (req, res) => {
  try {
    const submissionData = req.body;
    
    // Generate unique submission ID
    const submissionId = Submission.generateSubmissionId();
    
    // Handle file uploads to Cloudinary
    const imageUploads = {};
    
    // Process signature data URLs and convert to files if needed
    const processSignatureData = async (signatureDataUrl, folder) => {
      if (signatureDataUrl && signatureDataUrl.startsWith('data:image/')) {
        // Convert base64 data URL to buffer
        const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Create temporary file
        const tempFilePath = path.join(__dirname, '../temp', `signature_${Date.now()}.png`);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        fs.writeFileSync(tempFilePath, buffer);
        
        // Upload to Cloudinary
        const result = await uploadSignature(tempFilePath, folder);
        
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        return result;
      }
      return null;
    };
    
    if (req.files) {
      // Upload profile image
      if (req.files.profileImage) {
        const profileImageResult = await uploadImage(
          req.files.profileImage[0].path,
          'eclof-profiles'
        );
        imageUploads.profileImage = profileImageResult;
      }
    }
    
    // Handle signature data from form
    if (submissionData.clientSignature) {
      const clientSignatureResult = await processSignatureData(
        submissionData.clientSignature,
        'eclof-signatures'
      );
      if (clientSignatureResult) {
        imageUploads.clientSignature = clientSignatureResult;
      }
    }
    
    if (submissionData.representativeSignature) {
      const repSignatureResult = await processSignatureData(
        submissionData.representativeSignature,
        'eclof-signatures'
      );
      if (repSignatureResult) {
        imageUploads.representativeSignature = repSignatureResult;
      }
    }
    
    // Prepare the final submission data
    const finalSubmissionData = {
      ...submissionData,
      ...imageUploads,
      submissionId,
      // Convert date strings to Date objects
      signatureDate: submissionData.signatureDate ? new Date(submissionData.signatureDate) : new Date(),
      repSignatureDate: submissionData.repSignatureDate ? new Date(submissionData.repSignatureDate) : null
    };
      // Remove signature data URLs from final data (already processed as images)
    delete finalSubmissionData.clientSignature;
    delete finalSubmissionData.representativeSignature;
    
    // Create submission
    const submission = new Submission(finalSubmissionData);
    
    await submission.save();
    
    // Clean up temporary files
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: {
        submissionId: submission.submissionId,
        id: submission._id
      }
    });
    
  } catch (error) {
    console.error('Create submission error:', error);
    
    // Clean up temporary files on error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create submission',
      error: error.message
    });
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private (Admin)
const getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { submissionId: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');
    
    const total = await Submission.countDocuments(query);
    
    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private (Admin)
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });
    
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
};

// @desc    Generate profile for submission
// @route   POST /api/submissions/:id/generate-profile
// @access  Private (Admin)
const generateSubmissionProfile = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Generate profile using OpenAI
    const generatedProfile = await generateProfile(submission);
    
    // Update submission with generated profile
    submission.generatedProfile = generatedProfile;
    submission.profileGeneratedAt = new Date();
    await submission.save();
    
    res.json({
      success: true,
      message: 'Profile generated successfully',
      data: {
        generatedProfile
      }
    });
    
  } catch (error) {
    console.error('Generate profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate profile',
      error: error.message
    });
  }
};

// @desc    Update submission status
// @route   PUT /api/submissions/:id/status
// @access  Private (Admin)
const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, notes, reviewedBy } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    submission.status = status;
    submission.notes = notes || submission.notes;
    submission.reviewedBy = reviewedBy;
    submission.reviewedAt = new Date();
    
    await submission.save();
    
    res.json({
      success: true,
      message: 'Submission status updated successfully',
      data: submission
    });
    
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission status',
      error: error.message
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Admin)
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Delete images from Cloudinary
    const imagesToDelete = [];
    if (submission.profileImage?.cloudinaryId) {
      imagesToDelete.push(submission.profileImage.cloudinaryId);
    }
    if (submission.clientSignature?.cloudinaryId) {
      imagesToDelete.push(submission.clientSignature.cloudinaryId);
    }
    if (submission.representativeSignature?.cloudinaryId) {
      imagesToDelete.push(submission.representativeSignature.cloudinaryId);
    }
    
    // Delete images from Cloudinary (don't wait)
    imagesToDelete.forEach(async (id) => {
      try {
        await deleteImage(id);
      } catch (error) {
        console.error(`Failed to delete image ${id}:`, error);
      }
    });
    
    // Delete submission from database
    await Submission.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmission,
  generateSubmissionProfile,
  updateSubmissionStatus,
  deleteSubmission
};
