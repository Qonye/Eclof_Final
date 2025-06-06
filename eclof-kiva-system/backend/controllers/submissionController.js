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
      repSignatureDate: submissionData.repSignatureDate ? new Date(submissionData.repSignatureDate) : null,
      // Add agent information if provided
      submittedBy: submissionData.submittedBy ? {
        agentId: submissionData.submittedBy.agentId,
        agentName: submissionData.submittedBy.agentName,
        agentBranch: submissionData.submittedBy.agentBranch,
        agentRole: submissionData.submittedBy.agentRole
      } : null
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
    
    // Map submission fields to profile generator expected format
    const borrowerData = {
      fullName: submission.name,
      age: submission.age || 'Not specified',
      gender: submission.gender || 'Not specified', 
      maritalStatus: submission.maritalStatus || 'Not specified',
      numberOfChildren: submission.numberOfChildren || 0,
      location: submission.branch, // Use branch as location
      businessName: submission.business || 'Small Business',
      businessType: submission.business || 'Small Business',
      businessDescription: submission.business || '',
      businessExperience: submission.businessExperience || 'Several years',
      monthlyIncome: submission.monthlyIncome || null,
      loanAmount: submission.loanAmount,
      loanPurpose: submission.loanPurpose,
      expectedImpact: submission.futurePlans || submission.challenges || 'Improve business operations',
      // Additional context for better profile generation
      background: submission.background,
      challenges: submission.challenges,
      community: submission.community,
      previousLoans: submission.previousLoans,
      additionalComments: submission.additionalComments
    };
    
    // Generate profile using OpenAI
    const profileResult = await generateProfile(borrowerData);
    
    if (!profileResult.success) {
      return res.status(500).json({
        success: false,
        message: profileResult.error || 'Failed to generate profile'
      });
    }
      // Update submission with generated profile
    submission.generatedProfile = JSON.stringify(profileResult.data);
    submission.profileGeneratedAt = new Date();
    await submission.save();
    
    res.json({
      success: true,
      message: 'Profile generated successfully',
      data: {
        profile: profileResult.data,
        submission: submission
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
    });  }
};

// @desc    Update submission image
// @route   POST /api/submissions/:id/image
// @access  Private (Admin)
const updateSubmissionImage = async (req, res) => {
  try {
    const { imageType } = req.body;
    const submissionId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    let cloudinaryResult;
    
    // Upload new image to Cloudinary
    if (imageType === 'profile') {
      cloudinaryResult = await uploadImage(req.file.path, 'eclof-profiles');
      
      // Delete old image if exists
      if (submission.profileImage?.cloudinaryId) {
        try {
          await deleteImage(submission.profileImage.cloudinaryId);
        } catch (error) {
          console.error('Failed to delete old profile image:', error);
        }
      }
      
      // Update submission
      submission.profileImage = cloudinaryResult;
    } else if (imageType === 'clientSignature') {
      cloudinaryResult = await uploadSignature(req.file.path, 'eclof-signatures');
      
      // Delete old signature if exists
      if (submission.clientSignature?.cloudinaryId) {
        try {
          await deleteImage(submission.clientSignature.cloudinaryId);
        } catch (error) {
          console.error('Failed to delete old client signature:', error);
        }
      }
      
      // Update submission
      submission.clientSignature = cloudinaryResult;
    } else if (imageType === 'representativeSignature') {
      cloudinaryResult = await uploadSignature(req.file.path, 'eclof-signatures');
      
      // Delete old signature if exists
      if (submission.representativeSignature?.cloudinaryId) {
        try {
          await deleteImage(submission.representativeSignature.cloudinaryId);
        } catch (error) {
          console.error('Failed to delete old representative signature:', error);
        }
      }
      
      // Update submission
      submission.representativeSignature = cloudinaryResult;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type'
      });
    }
    
    // Save updated submission
    await submission.save();
    
    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json({
      success: true,
      message: 'Image updated successfully',
      imagePath: cloudinaryResult.secure_url,
      data: {
        imageType,
        imageUrl: cloudinaryResult.secure_url
      }
    });
    
  } catch (error) {
    console.error('Update image error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update image',
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
  deleteSubmission,
  updateSubmissionImage
};
