// admin-profile-generator.js
// This file adds profile generation capabilities to the admin interface
// without modifying existing functionality

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the main admin script to finish initializing
    setTimeout(initializeProfileGenerator, 1000);
    
    function initializeProfileGenerator() {
        // Add Generate Profile button to the modal actions
        const modalActions = document.querySelector('.modal-actions');
        if (modalActions) {
            const generateProfileButton = document.createElement('button');
            generateProfileButton.id = 'generateProfile';
            generateProfileButton.className = 'admin-button';
            generateProfileButton.textContent = 'Generate Professional Profile';
            
            // Insert the button before the first child of modal actions
            modalActions.insertBefore(generateProfileButton, modalActions.firstChild);
            
            // Add event listener to the button
            generateProfileButton.addEventListener('click', function() {
                // Get submission ID directly from the modal if available
                const modalElement = document.getElementById('submissionModal');
                if (modalElement && modalElement.dataset.submissionId) {
                    window.currentSubmissionId = modalElement.dataset.submissionId;
                }
                
                handleGenerateProfile();
            });
        }
        
        // Load the jsPDF library for PDF export
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
            .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'))
            .catch(err => console.error('Error loading PDF libraries:', err));
        
        // Add profile section to the modal if it doesn't exist
        function ensureProfileSectionExists() {
            let profileSection = document.getElementById('generatedProfileSection');
            if (!profileSection) {
                profileSection = document.createElement('div');
                profileSection.id = 'generatedProfileSection';
                profileSection.className = 'detail-section generated-profile-section';
                profileSection.style.display = 'none';
                
                const html = `
                    <h3>Generated Professional Profile</h3>
                    <div class="profile-content">
                        <div class="profile-header">
                            <div class="profile-image-container" id="profileImageContainer"></div>
                            <div class="profile-title-container">
                                <div class="profile-title" id="profileTitle"></div>
                            </div>
                        </div>
                        <div class="profile-text" id="profileText"></div>
                        <div class="profile-metadata">
                            <h4>Key Points:</h4>
                            <ul id="profileKeyPoints"></ul>
                            <div class="profile-sentiment" id="profileSentiment"></div>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button id="copyProfile" class="admin-button secondary">Copy Profile</button>
                        <button id="editProfile" class="admin-button secondary">Edit Profile</button>
                        <button id="exportProfilePDF" class="admin-button">Export as PDF</button>
                    </div>
                    <div class="profile-editor-container" style="display: none;">
                        <textarea id="profileEditor" rows="8"></textarea>
                        <button id="saveProfileEdit" class="admin-button">Save Changes</button>
                        <button id="cancelProfileEdit" class="admin-button secondary">Cancel</button>
                    </div>
                `;
                
                profileSection.innerHTML = html;
                
                // Add the profile section to the submission details
                const submissionDetails = document.getElementById('submissionDetails');
                if (submissionDetails) {
                    submissionDetails.appendChild(profileSection);
                    
                    // Add event listeners for profile actions
                    document.getElementById('copyProfile').addEventListener('click', copyProfileToClipboard);
                    document.getElementById('editProfile').addEventListener('click', editProfile);
                    document.getElementById('exportProfilePDF').addEventListener('click', exportProfileToPDF);
                    document.getElementById('saveProfileEdit').addEventListener('click', saveProfileEdit);
                    document.getElementById('cancelProfileEdit').addEventListener('click', cancelProfileEdit);
                }
            }
            return profileSection;
        }
        
        // Handle Generate Profile button click
        function handleGenerateProfile() {
            const submissionId = window.currentSubmissionId;
            
            if (!submissionId) {
                // Try to get the submission ID from the URL if it's not in the variable
                const urlParams = new URLSearchParams(window.location.search);
                const idFromUrl = urlParams.get('id');
                
                if (idFromUrl) {
                    window.currentSubmissionId = idFromUrl;
                } else {
                    alert('No submission selected. Please try reopening the submission details.');
                    return;
                }
            }
            
            // Show loading indicator
            const generateProfileButton = document.getElementById('generateProfile');
            const originalText = generateProfileButton.textContent;
            generateProfileButton.textContent = 'Generating...';
            generateProfileButton.disabled = true;              // Make API request to generate profile
            fetch(window.AppConfig.getGenerateProfileUrl(window.currentSubmissionId), {
                method: 'POST'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(response => {
                if (!response.success) {
                    throw new Error(response.message || 'Failed to generate profile');
                }
                
                // Store the submission data globally
                window.currentSubmissionData = response.data.submission;
                
                // Display the generated profile
                displayGeneratedProfile(response.data.profile);
            })
            .catch(error => {
                console.error('Error generating profile:', error);
                alert(`Failed to generate profile: ${error.message}`);
            })
            .finally(() => {
                // Reset the button state
                generateProfileButton.textContent = originalText;
                generateProfileButton.disabled = false;
            });
        }
        
        // Display the generated profile in the UI
        function displayGeneratedProfile(profileData) {
            // Ensure profile section exists
            const profileSection = ensureProfileSectionExists();
            profileSection.style.display = 'block';
            
            // Update profile content
            document.getElementById('profileTitle').textContent = profileData.title || 'Generated Profile';
            document.getElementById('profileText').innerHTML = profileData.profile || '';
            
            // Update metadata if available
            const keyPointsList = document.getElementById('profileKeyPoints');
            keyPointsList.innerHTML = '';
            
            if (profileData.metadata && profileData.metadata.key_points) {
                profileData.metadata.key_points.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = point;
                    keyPointsList.appendChild(li);
                });
            }
            
            if (profileData.metadata && profileData.metadata.sentiment) {
                document.getElementById('profileSentiment').textContent = `Sentiment: ${profileData.metadata.sentiment}`;
            } else {
                document.getElementById('profileSentiment').textContent = '';
            }
            
            // Add profile image if available
            addProfileImage();
            
            // Scroll to the profile section
            profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Add profile image to the generated profile
        function addProfileImage() {
            const imageContainer = document.getElementById('profileImageContainer');
            if (!imageContainer) return;
            
            // Clear existing content
            imageContainer.innerHTML = '';
            
            // Check if we already have the submission data
            if (window.currentSubmissionData) {
                addImageFromSubmissionData(window.currentSubmissionData);            } else {                // Fetch the submission data if we don't have it yet
                fetch(window.AppConfig.getSubmissionUrl(window.currentSubmissionId))
                    .then(response => response.json())
                    .then(submission => {
                        window.currentSubmissionData = submission;
                        addImageFromSubmissionData(submission);
                    })
                    .catch(err => {
                        console.error('Error fetching submission details:', err);
                        // Show placeholder on error
                        const placeholder = document.createElement('div');
                        placeholder.className = 'profile-image-placeholder';
                        placeholder.textContent = 'Error loading image';
                        imageContainer.appendChild(placeholder);
                    });
            }
        }
          // Helper function to add image from submission data
        function addImageFromSubmissionData(submission) {
            const imageContainer = document.getElementById('profileImageContainer');
            if (!imageContainer) return;
            
            // Check for a profile image - handle both object and direct URL structures
            let profileImageUrl = null;
            
            if (submission && submission.profileImage) {
                if (typeof submission.profileImage === 'object' && submission.profileImage.url) {
                    // Cloudinary object structure
                    profileImageUrl = submission.profileImage.url;
                } else if (typeof submission.profileImage === 'string') {
                    // Direct URL string
                    profileImageUrl = submission.profileImage;
                }
            }
            
            if (profileImageUrl) {
                const img = document.createElement('img');
                img.src = profileImageUrl;
                img.alt = 'Borrower Profile Image';
                img.className = 'borrower-profile-image';
                img.onerror = function() {
                    console.error('Image failed to load:', profileImageUrl);
                    this.onerror = null;
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNjY2MiIGQ9Ik0xMiAxMkM5LjggMTIgOCAxMC4yIDggOHMyLjgtNCA0LTRzNCAyLjggNCA0cy0yLjggNC00IDRtMCAyYzIuNyAwIDggMS41IDggNHY0SDF2LTRjMC0yLjUgNS4zLTQgOC00bTMgNmMwLTEuMSAxLjktMiAzLTJzMyAuOSAzIDJ2Mkg3di0yeiIvPjwvc3ZnPg=='; // Default image
                };
                imageContainer.appendChild(img);
            } else {
                // No image available
                const placeholder = document.createElement('div');
                placeholder.className = 'profile-image-placeholder';
                placeholder.textContent = 'No image available';
                imageContainer.appendChild(placeholder);
            }
        }
        
        // Copy profile to clipboard
        function copyProfileToClipboard() {
            const profileTitle = document.getElementById('profileTitle').textContent;
            const profileText = document.getElementById('profileText').innerText;
            const fullProfile = `${profileTitle}\n\n${profileText}`;
            
            navigator.clipboard.writeText(fullProfile)
                .then(() => {
                    alert('Profile copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy profile: ', err);
                    alert('Failed to copy profile to clipboard');
                });
        }
        
        // Edit profile
        function editProfile() {
            const profileTitle = document.getElementById('profileTitle').textContent;
            const profileText = document.getElementById('profileText').innerText;
            const fullProfile = `${profileTitle}\n\n${profileText}`;
            
            const editor = document.getElementById('profileEditor');
            editor.value = fullProfile;
            
            // Show editor
            document.querySelector('.profile-editor-container').style.display = 'block';
            editor.focus();
        }
        
        // Save profile edits
        function saveProfileEdit() {
            const editorContent = document.getElementById('profileEditor').value;
            
            // Split content into title and body
            const parts = editorContent.split('\n\n');
            const newTitle = parts[0];
            const newProfile = parts.slice(1).join('\n\n');
            
            // Update the display
            document.getElementById('profileTitle').textContent = newTitle;
            document.getElementById('profileText').innerHTML = newProfile;
            
            // Hide editor
            document.querySelector('.profile-editor-container').style.display = 'none';
            
            // Save changes to the submission if needed
            // This would require an additional API endpoint
            
            // Show success message
            alert('Profile updated successfully!');
        }
        
        // Cancel profile edit
        function cancelProfileEdit() {
            document.querySelector('.profile-editor-container').style.display = 'none';
        }
        
        // Export profile as PDF
        function exportProfileToPDF() {
            if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
                alert('PDF export libraries are still loading. Please try again in a few seconds.');
                return;
            }
            
            // Show loading message
            const exportButton = document.getElementById('exportProfilePDF');
            const originalText = exportButton.textContent;
            exportButton.textContent = 'Generating PDF...';
            exportButton.disabled = true;
            
            // Create a container for the PDF content
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'pdf-export-container';
            pdfContainer.style.width = '800px';
            pdfContainer.style.padding = '40px';
            pdfContainer.style.backgroundColor = 'white';
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            document.body.appendChild(pdfContainer);
            
            // Get profile data
            const profileTitle = document.getElementById('profileTitle').textContent;
            const profileText = document.getElementById('profileText').innerHTML;
            
            // Get image if available
            let profileImageSrc = null;
            const profileImage = document.querySelector('.borrower-profile-image');
            if (profileImage) {
                profileImageSrc = profileImage.src;
            }
            
            // Build PDF content
            pdfContainer.innerHTML = `
                <div class="pdf-header">
                    <img src="images/logo.png" alt="ECLOF Kenya Logo" style="height: 80px; margin-bottom: 20px;">
                    <h1 style="color: #004f71; margin-bottom: 30px;">Kiva Borrower Profile</h1>
                </div>
                <div class="pdf-profile">
                    ${profileImageSrc ? `<img src="${profileImageSrc}" alt="Borrower" style="width: 200px; float: right; margin: 0 0 20px 20px; border: 1px solid #ddd;">` : ''}
                    <h2 style="color: #008751; margin-bottom: 20px;">${profileTitle}</h2>
                    <div style="line-height: 1.6; text-align: justify;">${profileText}</div>
                </div>
                <div class="pdf-footer" style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
                    <p>Generated by ECLOF Kenya - ${new Date().toLocaleDateString()}</p>
                </div>
            `;
            
            // Use html2canvas and jsPDF to create PDF
            window.html2canvas(pdfContainer, { 
                scale: 2,
                useCORS: true,
                logging: false
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                
                // Calculate dimensions
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
                const imgHeight = canvas.height * imgWidth / canvas.width;
                
                let heightLeft = imgHeight;
                let position = 0;
                
                // Add image to the PDF
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // Add additional pages if necessary
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                // Generate PDF name
                const borrowerName = currentSubmissionData?.data?.name || 'Borrower';
                const fileName = `${borrowerName.replace(/\s+/g, '_')}_Profile_${new Date().toISOString().slice(0, 10)}.pdf`;
                
                // Save the PDF
                pdf.save(fileName);
                
                // Clean up
                document.body.removeChild(pdfContainer);
                
                // Reset button
                exportButton.textContent = originalText;
                exportButton.disabled = false;
            });
        }
    }
    
    // Helper function to load external scripts
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
});

// Add CSS for profile generator
(function addProfileGeneratorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .generated-profile-section {
            background-color: #f0f8ff;
            margin-top: 20px;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #004f71;
        }
        
        .profile-header {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        
        .profile-image-container {
            width: 150px;
            height: 150px;
            border: 1px solid #ddd;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f5f5f5;
            flex-shrink: 0;
        }
        
        .borrower-profile-image {
            max-width: 100%;
            max-height: 100%;
        }
        
        .profile-image-placeholder {
            color: #999;
            text-align: center;
            font-size: 14px;
            padding: 10px;
        }
        
        .profile-title-container {
            flex-grow: 1;
        }
        
        .profile-title {
            font-size: 20px;
            font-weight: bold;
            color: #004f71;
            margin-bottom: 12px;
        }
        
        .profile-text {
            line-height: 1.6;
            text-align: justify;
            margin-bottom: 16px;
            white-space: pre-line;
        }
        
        .profile-metadata {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
        }
        
        .profile-sentiment {
            font-style: italic;
            color: #666;
            margin-top: 10px;
        }
        
        .profile-actions {
            margin-top: 15px;
            display: flex;
            gap: 10px;
        }
        
        .profile-editor-container {
            margin-top: 15px;
        }
        
        #profileEditor {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-bottom: 10px;
            font-family: inherit;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
})();

// Helper function to make currentSubmissionId accessible
let currentSubmissionId = null;
let currentSubmissionData = null;
const originalViewSubmissionDetails = window.viewSubmissionDetails || null;

if (typeof window.viewSubmissionDetails === 'function') {
    window.originalViewSubmissionDetails = window.viewSubmissionDetails;
    
    window.viewSubmissionDetails = function(submissionId) {
        currentSubmissionId = submissionId;
        
        if (typeof window.originalViewSubmissionDetails === 'function') {
            window.originalViewSubmissionDetails(submissionId);
        }        // If there's already a generated profile, display it
        setTimeout(() => {
            fetch(window.AppConfig.getSubmissionUrl(submissionId))
                .then(response => response.json())
                .then(submission => {
                    currentSubmissionData = submission;
                    if (submission.generatedProfile) {
                        const profileSection = document.getElementById('generatedProfileSection');
                        if (profileSection) {
                            displayGeneratedProfile(submission.generatedProfile);
                        }
                    }
                })
                .catch(err => console.error('Error checking for existing profile:', err));
        }, 500);
    };
}

// Display generated profile (accessible from outside)
function displayGeneratedProfile(profileData) {
    // Implementation of displayGeneratedProfile from within the DOMContentLoaded
    // This is a fallback for when the function is called from outside the scope
    if (!profileData) return;
    
    // Check if profile section exists, if not wait for it to be created
    const checkProfileSection = () => {
        const profileSection = document.getElementById('generatedProfileSection');
        if (profileSection) {
            profileSection.style.display = 'block';
            
            document.getElementById('profileTitle').textContent = profileData.title || 'Generated Profile';
            document.getElementById('profileText').innerHTML = profileData.profile || '';
            
            const keyPointsList = document.getElementById('profileKeyPoints');
            keyPointsList.innerHTML = '';
            
            if (profileData.metadata && profileData.metadata.key_points) {
                profileData.metadata.key_points.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = point;
                    keyPointsList.appendChild(li);
                });
            }
            
            if (profileData.metadata && profileData.metadata.sentiment) {
                document.getElementById('profileSentiment').textContent = `Sentiment: ${profileData.metadata.sentiment}`;
            } else {
                document.getElementById('profileSentiment').textContent = '';
            }
            
            // Add profile image
            const imageContainer = document.getElementById('profileImageContainer');
            if (imageContainer && currentSubmissionData && currentSubmissionData.profileImagePath) {
                imageContainer.innerHTML = '';
                const img = document.createElement('img');
                
                // Fix the path - convert absolute path to relative path
                let imgSrc = currentSubmissionData.profileImagePath;
                
                // Check if it's an absolute path and extract the relative part
                if (imgSrc.includes('\\uploads\\') || imgSrc.includes('/uploads/')) {
                    // Extract just the filename from the path
                    const pathParts = imgSrc.split(/[\\\/]/);
                    const filename = pathParts[pathParts.length - 1];
                    imgSrc = `/uploads/${filename}`;
                }
                
                img.src = imgSrc;
                img.alt = 'Borrower Profile Image';
                img.className = 'borrower-profile-image';
                img.onerror = function() {
                    console.error('Image failed to load:', imgSrc);
                    this.onerror = null;
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNjY2MiIGQ9Ik0xMiAxMkM5LjggMTIgOCAxMC4yIDggOHMyLjgtNCA0LTRzNCAyLjggNCA0cy0yLjggNC00IDRtMCAyYzIuNyAwIDggMS41IDggNHY0SDF2LTRjMC0yLjUgNS4zLTQgOC00bTMgNmMwLTEuMSAxLjktMiAzLTJzMyAuOSAzIDJ2Mkg3di0yeiIvPjwvc3ZnPg=='; // Default image
                };
                imageContainer.appendChild(img);
            }
            
            profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Wait and try again
            setTimeout(checkProfileSection, 500);
        }
    };
    
    checkProfileSection();
}