const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Basic Information (mapped from frontend form)
  name: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  clientId: {
    type: String,
    required: true,
    trim: true
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 100
  },
  groupName: {
    type: String,
    trim: true
  },
  
  // Background and Story (mapped from frontend form)
  background: {
    type: String,
    required: true
  },
  business: {
    type: String,
    required: true
  },
  loanPurpose: {
    type: String,
    required: true
  },
  challenges: {
    type: String,
    required: true
  },
  community: {
    type: String,
    required: true
  },
  previousLoans: {
    type: String
  },
  futurePlans: {
    type: String,
    required: true
  },
  additionalComments: {
    type: String
  },
  
  // Waiver and Signature Information
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  signatureDate: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  repSignatureDate: {
    type: Date
  },  
  // Images (Cloudinary URLs)
  profileImage: {
    url: String,
    cloudinaryId: String
  },
  clientSignature: {
    url: String,
    cloudinaryId: String
  },
  representativeSignature: {
    url: String,
    cloudinaryId: String
  },
  
  // Generated Profile
  generatedProfile: {
    type: String,
    default: null
  },
  profileGeneratedAt: {
    type: Date,
    default: null
  },
    // Consent and Legal
  consentToShare: {
    type: Boolean,
    required: true,
    default: true // Since they're submitting the form with waiver
  },
  consentToPhotography: {
    type: Boolean,
    required: true,
    default: true // Since they're submitting the form with waiver
  },
  
  // Field Agent Information
  submittedBy: {
    agentId: {
      type: String,
      required: true,
      trim: true
    },
    agentName: {
      type: String,
      required: true,
      trim: true
    },
    agentBranch: {
      type: String,
      required: true,
      trim: true
    },
    agentRole: {
      type: String,
      enum: ['field_agent', 'loan_officer', 'branch_manager', 'representative'],
      default: 'field_agent'
    }
  },

  // System Information
  submissionId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better search performance (submissionId already indexed due to unique: true)
submissionSchema.index({ name: 1 });
submissionSchema.index({ clientId: 1 });
submissionSchema.index({ branch: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });

// Virtual for formatted creation date
submissionSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Method to generate submission ID
submissionSchema.statics.generateSubmissionId = function() {
  return `ECLOF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

module.exports = mongoose.model('Submission', submissionSchema);
