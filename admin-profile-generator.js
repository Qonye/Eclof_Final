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
            generateProfileButton.addEventListener('click', handleGenerateProfile);
        }
        
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
                        <div class="profile-title" id="profileTitle"></div>
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
                    document.getElementById('saveProfileEdit').addEventListener('click', saveProfileEdit);
                    document.getElementById('cancelProfileEdit').addEventListener('click', cancelProfileEdit);
                }
            }
            return profileSection;
        }
        
        // Handle Generate Profile button click
        function handleGenerateProfile() {
            const submissionId = currentSubmissionId;
            if (!submissionId) {
                alert('No submission selected.');
                return;
            }
            
            // Show loading indicator
            const generateProfileButton = document.getElementById('generateProfile');
            const originalText = generateProfileButton.textContent;
            generateProfileButton.textContent = 'Generating...';
            generateProfileButton.disabled = true;
            
            // Make API request to generate profile
            fetch(`/api/admin/generate-profile/${submissionId}`, {
                method: 'POST'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error(data.message || 'Failed to generate profile');
                }
                
                // Display the generated profile
                displayGeneratedProfile(data.profile);
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
            
            // Scroll to the profile section
            profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
const originalViewSubmissionDetails = window.viewSubmissionDetails || null;

if (typeof window.viewSubmissionDetails === 'function') {
    window.originalViewSubmissionDetails = window.viewSubmissionDetails;
    
    window.viewSubmissionDetails = function(submissionId) {
        currentSubmissionId = submissionId;
        
        if (typeof window.originalViewSubmissionDetails === 'function') {
            window.originalViewSubmissionDetails(submissionId);
        }
        
        // If there's already a generated profile, display it
        setTimeout(() => {
            fetch(`/api/admin/submissions/${submissionId}`)
                .then(response => response.json())
                .then(submission => {
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
            
            profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Wait and try again
            setTimeout(checkProfileSection, 500);
        }
    };
    
    checkProfileSection();
}