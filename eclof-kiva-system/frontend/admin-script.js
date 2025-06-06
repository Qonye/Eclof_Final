document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginForm = document.getElementById('loginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginError = document.getElementById('loginError');
    const logoutButton = document.getElementById('logoutButton');
    const submissionsTableBody = document.getElementById('submissionsTableBody');
    const totalSubmissionsSpan = document.getElementById('totalSubmissions');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterDatesButton = document.getElementById('filterDates');
    const resetFiltersButton = document.getElementById('resetFilters');    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfoSpan = document.getElementById('pageInfo');
    const submissionModal = document.getElementById('submissionModal');
    const closeSubmissionModalBtn = document.getElementById('closeSubmissionModal');
    const submissionDetails = document.getElementById('submissionDetails');
    const printSubmissionButton = document.getElementById('printSubmission');
    const exportPDFButton = document.getElementById('exportPDF');
    const deleteSubmissionButton = document.getElementById('deleteSubmission');

    // Agent management elements
    const agentsTabButton = document.querySelector('[data-tab="agents"]');
    const submissionsTabButton = document.querySelector('[data-tab="submissions"]');
    const agentsTab = document.getElementById('agentsTab');
    const submissionsTab = document.getElementById('submissionsTab');
    const addAgentButton = document.getElementById('addAgentButton');
    const agentModal = document.getElementById('agentModal');
    const closeAgentModal = document.getElementById('closeAgentModal');
    const agentForm = document.getElementById('agentForm');
    const agentModalTitle = document.getElementById('agentModalTitle');
    const saveAgentButton = document.getElementById('saveAgentButton');
    const cancelAgentButton = document.getElementById('cancelAgentButton');
    const agentsTableBody = document.getElementById('agentsTableBody');

    // State
    let currentSubmissions = [];
    let filteredSubmissions = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let currentSubmissionId = null;
    let isEditingAgent = false;
    let editingAgentId = null;

    // Make currentSubmissionId accessible globally for the profile generator
    window.currentSubmissionId = null;

    // Check if the user is already logged in
    checkLoginStatus();    // Event Listeners
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    searchButton.addEventListener('click', handleSearch);    filterDatesButton.addEventListener('click', handleDateFilter);
    resetFiltersButton.addEventListener('click', resetFilters);
    prevPageButton.addEventListener('click', goToPreviousPage);
    nextPageButton.addEventListener('click', goToNextPage);
    if (closeSubmissionModalBtn) closeSubmissionModalBtn.addEventListener('click', closeSubmissionModal);
    printSubmissionButton.addEventListener('click', printSubmissionDetails);
    exportPDFButton.addEventListener('click', exportSubmissionAsPDF);
    deleteSubmissionButton.addEventListener('click', handleDeleteSubmission);

    // Tab navigation event listeners
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });    // Agent management event listeners
    if (addAgentButton) addAgentButton.addEventListener('click', showAddAgentModal);
    if (closeAgentModal) closeAgentModal.addEventListener('click', hideAgentModal);
    if (cancelAgentButton) cancelAgentButton.addEventListener('click', hideAgentModal);
    if (agentForm) agentForm.addEventListener('submit', handleSaveAgent);
    
    // Password toggle event listener
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePasswordVisibility);
    }
      // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === agentModal) {
            hideAgentModal();
        }
        if (event.target === submissionModal) {
            closeSubmissionModal();
        }
    });// Handle login
    async function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Clear previous errors
        loginError.textContent = '';
        
        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            // Authenticate admin with API
            const authResult = await AdminAuth.login(username, password);
            
            if (authResult.success) {
                // Hide login, show dashboard
                loginForm.style.display = 'none';
                adminDashboard.style.display = 'block';
                
                // Load submissions
                loadSubmissions();
            } else {
                loginError.textContent = authResult.message || 'Invalid username or password. Please try again.';
                
                // Clear the error message after 3 seconds
                setTimeout(() => {
                    loginError.textContent = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'Login failed. Please try again.';
        } finally {
            // Restore button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    }    // Handle logout
    function handleLogout() {
        AdminAuth.logout();
        adminDashboard.style.display = 'none';
        loginForm.style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    // Check if user is logged in
    function checkLoginStatus() {
        const isLoggedIn = AdminAuth.isLoggedIn();
        
        if (isLoggedIn) {
            loginForm.style.display = 'none';
            adminDashboard.style.display = 'block';
            loadSubmissions();
        }
    }// Load submissions from the server
    function loadSubmissions() {
        fetch(window.AppConfig.getSubmissionsUrl())
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch submissions');
                }
                return response.json();
            })
            .then(response => {
                if (response.success) {
                    currentSubmissions = response.data;
                    filteredSubmissions = [...currentSubmissions];
                    updatePagination();
                    displaySubmissions();
                } else {
                    throw new Error(response.message || 'Failed to load submissions');
                }
            })
            .catch(error => {
                console.error('Error loading submissions:', error);
                alert('Failed to load submissions. Please try again later.');
            });
    }

    // Display submissions in the table
    function displaySubmissions() {
        // Clear the table
        submissionsTableBody.innerHTML = '';
        
        // Get current page submissions
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageSubmissions = filteredSubmissions.slice(startIndex, endIndex);
        
        // Update total count
        totalSubmissionsSpan.textContent = filteredSubmissions.length;        if (pageSubmissions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" style="text-align: center;">No submissions found</td>`;
            submissionsTableBody.appendChild(emptyRow);
            return;
        }

        // Add submissions to the table
        pageSubmissions.forEach(submission => {
            const row = document.createElement('tr');
              // Handle date formatting with proper validation
            let date = 'N/A';
            if (submission.createdAt || submission.submissionDate || submission.timestamp) {
                // Try different possible date fields
                const dateValue = submission.createdAt || submission.submissionDate || submission.timestamp;
                const submissionDate = new Date(dateValue);
                if (!isNaN(submissionDate.getTime())) {
                    date = submissionDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            }
              const name = submission.name || 'N/A';
            const branch = submission.branch || 'N/A';
            const loanAmount = submission.loanAmount ? `KES ${Number(submission.loanAmount).toLocaleString()}` : 'N/A';
            const clientId = submission.clientId || 'N/A';
            
            // Format agent information
            let submittedBy = 'N/A';
            if (submission.submittedBy && submission.submittedBy.agentName) {
                submittedBy = `${submission.submittedBy.agentName} (${submission.submittedBy.agentId})`;
            }
            
            row.innerHTML = `
                <td data-label="Submission ID">${submission._id}</td>
                <td data-label="Date">${date}</td>
                <td data-label="Borrower Name">${name}</td>
                <td data-label="Branch">${branch}</td>
                <td data-label="Loan Amount">${loanAmount}</td>
                <td data-label="Client ID">${clientId}</td>
                <td data-label="Submitted By">${submittedBy}</td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="action-button view-button" data-id="${submission._id}">View</button>
                        <button class="action-button delete-button" data-id="${submission._id}">Delete</button>
                    </div>
                </td>
            `;
            
            submissionsTableBody.appendChild(row);
        });
        
        // Add event listeners to the action buttons
        attachActionButtonListeners();
    }

    // Attach event listeners to view and delete buttons
    function attachActionButtonListeners() {
        // View buttons
        const viewButtons = document.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const submissionId = this.getAttribute('data-id');
                viewSubmissionDetails(submissionId);
            });
        });
        
        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const submissionId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
                    deleteSubmission(submissionId);
                }
            });
        });
    }

    // Handle search
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Reset to original list if search is empty
            filteredSubmissions = [...currentSubmissions];
        } else {        filteredSubmissions = currentSubmissions.filter(submission => {
            // Search in common fields including agent information
            const searchFields = [
                submission.name,
                submission.branch,
                submission.clientId,
                submission._id,
                submission.submittedBy?.agentName,
                submission.submittedBy?.agentId,
                submission.submittedBy?.agentBranch
            ].filter(Boolean); // Remove null/undefined values
            
            return searchFields.some(field => 
                field.toLowerCase().includes(searchTerm)
            );
        });
        }
        
        // Reset to first page and update display
        currentPage = 1;
        updatePagination();
        displaySubmissions();
    }

    // Handle date filtering
    function handleDateFilter() {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
        
        if (!startDate && !endDate) {
            alert('Please select at least one date to filter.');
            return;
        }
        
        // Set end date to end of day if provided
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }        filteredSubmissions = currentSubmissions.filter(submission => {
            // Try different possible date fields
            const dateValue = submission.createdAt || submission.submissionDate || submission.timestamp;
            const submissionDate = new Date(dateValue);
            
            if (startDate && endDate) {
                return submissionDate >= startDate && submissionDate <= endDate;
            } else if (startDate) {
                return submissionDate >= startDate;
            } else {
                return submissionDate <= endDate;
            }
        });
        
        // Reset to first page and update display
        currentPage = 1;
        updatePagination();
        displaySubmissions();
    }

    // Reset all filters
    function resetFilters() {
        searchInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        
        filteredSubmissions = [...currentSubmissions];
        
        // Reset to first page and update display
        currentPage = 1;
        updatePagination();
        displaySubmissions();
    }

    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
        
        // Update page info
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        // Update button states
        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
    }

    // Go to previous page
    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            displaySubmissions();
        }
    }

    // Go to next page
    function goToNextPage() {
        const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            displaySubmissions();
        }
    }    // View submission details
    function viewSubmissionDetails(submissionId) {
        fetch(window.AppConfig.getSubmissionUrl(submissionId))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch submission details');
                }
                return response.json();
            })
            .then(response => {
                if (response.success) {
                    const submission = response.data;
                    
                    // Store the current submission ID both locally and globally
                    currentSubmissionId = submissionId;
                    window.currentSubmissionId = submissionId;
                    
                    // Store the submission data globally for the profile generator
                    window.currentSubmissionData = submission;
                    
                    // Add the submission ID as a data attribute to the modal for easier access
                    submissionModal.dataset.submissionId = submissionId;
                    
                    // Fill the modal with submission details
                    renderSubmissionDetails(submission);
                          // Display the modal
                    submissionModal.style.display = 'block';
                    
                    // Add load event listeners to all images
                    setTimeout(attachImageActionListeners, 100);
                } else {
                    throw new Error(response.message || 'Failed to load submission details');
                }
            })
            .catch(error => {
                console.error('Error loading submission details:', error);
                alert('Failed to load submission details. Please try again later.');
            });
    }    // Render submission details in the modal
    function renderSubmissionDetails(submission) {        // Handle date formatting with proper validation
        let date = 'N/A';
        if (submission.createdAt || submission.submissionDate || submission.timestamp) {
            // Try different possible date fields
            const dateValue = submission.createdAt || submission.submissionDate || submission.timestamp;
            const submissionDate = new Date(dateValue);
            if (!isNaN(submissionDate.getTime())) {
                date = submissionDate.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
          // Build the HTML for submission details
        let detailsHTML = `
            <div class="detail-section">
                <h3>Basic Information</h3>
                <div class="detail-item">
                    <div class="detail-label">Submission ID:</div>
                    <div>${submission._id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date Submitted:</div>
                    <div>${date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Name:</div>
                    <div>${submission.name || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Branch:</div>
                    <div>${submission.branch || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client ID:</div>
                    <div>${submission.clientId || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Loan Amount:</div>
                    <div>${submission.loanAmount || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Group Name:</div>
                    <div>${submission.groupName || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Field Agent Information</h3>`;
        
        if (submission.submittedBy) {
            detailsHTML += `
                <div class="detail-item">
                    <div class="detail-label">Agent ID:</div>
                    <div>${submission.submittedBy.agentId || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Agent Name:</div>
                    <div>${submission.submittedBy.agentName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Agent Branch:</div>
                    <div>${submission.submittedBy.agentBranch || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Agent Role:</div>
                    <div>${submission.submittedBy.agentRole ? submission.submittedBy.agentRole.replace('_', ' ').toUpperCase() : 'N/A'}</div>
                </div>`;
        } else {
            detailsHTML += `
                <div class="detail-item">
                    <div class="detail-label">Agent Information:</div>
                    <div>No agent information available</div>
                </div>`;
        }
        
        detailsHTML += `
            </div>
            
            <div class="detail-section">
                <h3>Borrower Details</h3>
                <div class="detail-item">
                    <div class="detail-label">Background:</div>
                    <div>${submission.background || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Business:</div>
                    <div>${submission.business || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Loan Purpose:</div>
                    <div>${submission.loanPurpose || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Challenges & Plans:</div>
                    <div>${submission.challenges || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Community Contribution:</div>
                    <div>${submission.community || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Previous Loans:</div>
                    <div>${submission.previousLoans || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Future Plans:</div>
                    <div>${submission.futurePlans || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Additional Comments:</div>
                    <div>${submission.additionalComments || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Client Waiver Information</h3>
                <div class="detail-item">
                    <div class="detail-label">Client Name:</div>
                    <div>${submission.clientName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Signature Date:</div>
                    <div>${submission.signatureDate || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Address:</div>
                    <div>${submission.address || 'N/A'}</div>
                </div>
            </div>
        `;// Add images if available
        const hasImages = submission.profileImage || submission.clientSignature || submission.representativeSignature;
        
        if (hasImages) {
            detailsHTML += `
                <div class="detail-section">
                    <h3>Images</h3>
                    <div class="borrower-images">
            `;
            
            if (submission.profileImage) {
                const profileImageUrl = typeof submission.profileImage === 'object' ? 
                    submission.profileImage.url : submission.profileImage;
                detailsHTML += `
                    <div class="image-container">
                        <img src="${profileImageUrl}" alt="Profile Image" id="profileImage">
                        <div class="image-label">Profile Photo</div>
                        <div class="image-actions">
                            <button class="image-action-btn download-image" data-image-type="profile">Download</button>
                            <button class="image-action-btn replace-image" data-image-type="profile">Replace Image</button>
                        </div>
                        <div class="image-upload-container" id="profileImageUpload" style="display: none;">
                            <input type="file" id="newProfileImage" class="new-image-input" accept="image/*">
                            <div class="upload-actions">
                                <button class="upload-btn" data-image-type="profile">Upload</button>
                                <button class="cancel-upload-btn" data-image-type="profile">Cancel</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            if (submission.clientSignature) {
                const clientSignatureUrl = typeof submission.clientSignature === 'object' ? 
                    submission.clientSignature.url : submission.clientSignature;
                detailsHTML += `
                    <div class="image-container">
                        <img src="${clientSignatureUrl}" alt="Client Signature" id="clientSignatureImage">
                        <div class="image-label">Client Signature</div>
                    </div>
                `;
            }
            
            if (submission.representativeSignature) {
                const repSignatureUrl = typeof submission.representativeSignature === 'object' ? 
                    submission.representativeSignature.url : submission.representativeSignature;
                detailsHTML += `
                    <div class="image-container">
                        <img src="${repSignatureUrl}" alt="Representative Signature" id="repSignatureImage">
                        <div class="image-label">Representative Signature</div>
                    </div>
                `;
            }
            
            detailsHTML += `
                    </div>
                </div>
            `;
        }
        
        // Set the HTML to the submission details element
        submissionDetails.innerHTML = detailsHTML;
        
        // Attach event listeners for image management
        attachImageActionListeners();
    }

    // Attach event listeners for image actions
    function attachImageActionListeners() {
        // Download image buttons
        const downloadButtons = document.querySelectorAll('.download-image');
        downloadButtons.forEach(button => {
            button.addEventListener('click', handleImageDownload);
        });
        
        // Replace image buttons
        const replaceButtons = document.querySelectorAll('.replace-image');
        replaceButtons.forEach(button => {
            button.addEventListener('click', showImageUpload);
        });
        
        // Upload buttons
        const uploadButtons = document.querySelectorAll('.upload-btn');
        uploadButtons.forEach(button => {
            button.addEventListener('click', handleImageUpload);
        });
        
        // Cancel upload buttons
        const cancelButtons = document.querySelectorAll('.cancel-upload-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', hideImageUpload);
        });
    }

    // Handle image download
    function handleImageDownload(e) {
        const imageType = e.target.getAttribute('data-image-type');
        let imageElement;
        
        switch(imageType) {
            case 'profile':
                imageElement = document.getElementById('profileImage');
                break;
            case 'clientSignature':
                imageElement = document.getElementById('clientSignatureImage');
                break;
            case 'repSignature':
                imageElement = document.getElementById('repSignatureImage');
                break;
            default:
                console.error('Unknown image type');
                return;
        }
        
        if (!imageElement || !imageElement.src) {
            alert('Image not available for download.');
            return;
        }
        
        // Show loading state
        const originalButtonText = e.target.textContent;
        e.target.textContent = 'Downloading...';
        e.target.disabled = true;
        
        // Fix the image path if it contains an absolute file path
        let imageSrc = imageElement.src;
        
        // Extract the filename from the path
        let filename = '';
        
        // Check for absolute paths like /C:/projects/...
        if (imageSrc.includes('/C:') || imageSrc.includes('\\C:')) {
            // Get just the filename from the absolute path
            const pathParts = imageSrc.split('/').filter(Boolean);
            filename = pathParts[pathParts.length - 1];
            
            // Create a proper URL for the uploads folder
            imageSrc = `${window.location.origin}/uploads/${filename}`;
            console.log("Fixing absolute path. New path:", imageSrc);
        } else {
            // Regular relative URL
            const urlParts = imageSrc.split('/');
            filename = urlParts[urlParts.length - 1].split('?')[0];
        }
        
        if (!filename) {
            filename = `${currentSubmissionId}_${imageType}.jpg`;
        }
        
        // Download using fetch API which has better cross-browser support for binary data
        fetch(imageSrc)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Create a blob URL and trigger download
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                    
                    // Reset button state
                    e.target.textContent = originalButtonText;
                    e.target.disabled = false;
                }, 100);
            })
            .catch(error => {
                console.error('Error downloading image:', error);
                alert('Failed to download image. Please try again later.');
                
                // Reset button state
                e.target.textContent = originalButtonText;
                e.target.disabled = false;
                
                // As a fallback for direct download
                console.log("Attempting direct download as fallback...");
                window.open(imageSrc, '_blank');
            });
    }

    // Show image upload interface
    function showImageUpload(e) {
        const imageType = e.target.getAttribute('data-image-type');
        const uploadContainer = document.getElementById(`${imageType}ImageUpload`);
        
        if (uploadContainer) {
            uploadContainer.style.display = 'block';
            e.target.style.display = 'none';
        }
    }

    // Hide image upload interface
    function hideImageUpload(e) {
        const imageType = e.target.getAttribute('data-image-type');
        const uploadContainer = document.getElementById(`${imageType}ImageUpload`);
        const replaceButton = document.querySelector(`.replace-image[data-image-type="${imageType}"]`);
        
        if (uploadContainer) {
            uploadContainer.style.display = 'none';
        }
        
        if (replaceButton) {
            replaceButton.style.display = 'inline-block';
        }
    }

    // Handle image upload and replacement
    function handleImageUpload(e) {
        const imageType = e.target.getAttribute('data-image-type');
        const fileInput = document.getElementById(`new${imageType.charAt(0).toUpperCase() + imageType.slice(1)}Image`);
        
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('Please select an image to upload.');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        
        // Create FormData to send the file
        const formData = new FormData();
        formData.append('image', file);
        formData.append('imageType', imageType);
        formData.append('submissionId', currentSubmissionId);
        
        // Show loading indicator
        e.target.textContent = 'Uploading...';
        e.target.disabled = true;
        
        // Log the upload attempt
        console.log(`Uploading ${imageType} image for submission ${currentSubmissionId}`);
        console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
        
        // Upload the image
        fetch(`${window.AppConfig.API_BASE_URL}/api/submissions/${currentSubmissionId}/image`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Upload successful:', data);
            
            // Update the image on the page
            const imageElement = document.getElementById(`${imageType}Image`);
            
            if (imageElement) {
                // Add timestamp query parameter to force refresh of cached image
                const newImageUrl = data.imagePath.startsWith('/') ? data.imagePath : `/${data.imagePath}`;
                imageElement.src = `${newImageUrl}?t=${new Date().getTime()}`;
                console.log('Updated image src to:', imageElement.src);
            }
            
            // Hide upload interface
            const uploadContainer = document.getElementById(`${imageType}ImageUpload`);
            if (uploadContainer) {
                uploadContainer.style.display = 'none';
            }
            
            // Show replace button again
            const replaceButton = document.querySelector(`.replace-image[data-image-type="${imageType}"]`);
            if (replaceButton) {
                replaceButton.style.display = 'inline-block';
            }
            
            // Show success message
            alert('Image successfully updated!');
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message}`);
        })
        .finally(() => {
            // Reset button
            e.target.textContent = 'Upload';
            e.target.disabled = false;
        });
    }

    // Close the submission details modal
    function closeSubmissionModal() {
        submissionModal.style.display = 'none';
        // Don't clear the currentSubmissionId here anymore
        // This allows the profile generator to still access it after the modal is closed
    }
    
    // Make the viewSubmissionDetails function globally accessible
    window.viewSubmissionDetails = viewSubmissionDetails;

    // Print submission details
    function printSubmissionDetails() {
        const printWindow = window.open('', '_blank');
        const content = submissionDetails.innerHTML;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>ECLOF Kenya - Borrower Profile</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h3 { color: #004f71; }
                    .detail-section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
                    .detail-item { margin-bottom: 10px; display: flex; }
                    .detail-label { font-weight: bold; width: 200px; }
                    .borrower-images { display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0; }
                    .image-container { width: 200px; }
                    .image-container img { max-width: 100%; }
                    .image-label { margin-top: 5px; font-weight: bold; text-align: center; }
                    @media print {
                        .detail-item { page-break-inside: avoid; }
                        img { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h2>ECLOF Kenya - Borrower Profile Details</h2>
                ${content}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Print after images have loaded
        setTimeout(() => {
            printWindow.print();
        }, 1000);
    }

    // Export submission as PDF (Basic implementation - in a real application, use a PDF library)
    function exportSubmissionAsPDF() {
        alert('PDF export functionality would be implemented here. For now, please use the print function and save as PDF.');
        printSubmissionDetails();
    }

    // Delete submission from modal
    function handleDeleteSubmission() {
        if (currentSubmissionId && confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            deleteSubmission(currentSubmissionId);
            closeSubmissionModal();
        }
    }    // Delete a submission
    function deleteSubmission(submissionId) {
        fetch(window.AppConfig.getDeleteSubmissionUrl(submissionId), {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete submission');
            }
            return response.json();
        })
        .then(response => {
            if (response.success) {
                // Remove submission from arrays
                currentSubmissions = currentSubmissions.filter(s => s._id !== submissionId);
                filteredSubmissions = filteredSubmissions.filter(s => s._id !== submissionId);
                
                // Update the UI
                updatePagination();
                displaySubmissions();
                
                alert('Submission deleted successfully.');
            } else {
                throw new Error(response.message || 'Failed to delete submission');
            }
        })
        .catch(error => {
            console.error('Error deleting submission:', error);
            alert('Failed to delete submission. Please try again later.');
        });
    }

    // Tab Management Functions
    function switchTab(tabName) {
        // Remove active class from all tab buttons and panes
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected tab button and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load data based on selected tab
        if (tabName === 'submissions') {
            loadSubmissions();
        } else if (tabName === 'agents') {
            loadAgents();
        }
    }      // Agent Management Functions
    async function loadAgents() {
        try {
            console.log('Loading agents from API...');
            console.log('Admin logged in:', AdminAuth.isLoggedIn());
            console.log('Admin token:', AdminAuth.getAuthToken());
            
            // Get agents from API instead of localStorage
            const users = await UserManagementAPI.getAllUsers();
            console.log('Fetched users:', users);
            displayAgents(users);
        } catch (error) {
            console.error('Error loading agents:', error);
            alert(`Failed to load agents: ${error.message}`);
        }
    }
    
    // Toggle password visibility
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('agentPassword');
        const toggleBtn = document.getElementById('passwordToggle');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        const passwordHelp = document.getElementById('passwordHelp');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
            passwordHelp.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
            passwordHelp.style.display = 'none';
        }
    }    // Get stored agents from localStorage (legacy - keeping for fallback)
    function getStoredAgents() {
        try {
            const stored = localStorage.getItem('eclof_agents');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading stored agents:', error);
        }
        
        return {};
    }// Display agents in the table
    function displayAgents(users = []) {
        const tbody = document.getElementById('agentsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Determine status
            const status = user.isActive ? 'Active' : 'Inactive';
            const statusClass = user.isActive ? 'status-active' : 'status-inactive';
            
            row.innerHTML = `
                <td data-label="Agent ID">${user.agentId}</td>
                <td data-label="Name">${user.name || 'N/A'}</td>
                <td data-label="Branch">${user.branch || 'N/A'}</td>
                <td data-label="Role">${user.role || 'N/A'}</td>
                <td data-label="Status">
                    <span class="status-badge ${statusClass}">${status}</span>
                </td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="action-button edit-button" data-id="${user.agentId}">Edit</button>
                        <button class="action-button delete-button" data-id="${user.agentId}">Delete</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        attachAgentActionListeners();
    }

    // Attach event listeners to agent action buttons
    function attachAgentActionListeners() {
        const editButtons = document.querySelectorAll('.edit-button');
        const deleteButtons = document.querySelectorAll('.delete-button');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const agentId = this.getAttribute('data-id');
                editAgent(agentId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const agentId = this.getAttribute('data-id');
                deleteAgent(agentId);
            });
        });
    }    // Edit agent function
    async function editAgent(agentId) {
        try {
            const users = await UserManagementAPI.getAllUsers();
            const user = users.find(u => u.agentId === agentId);
            
            if (!user) {
                alert('Agent not found');
                return;
            }
            
            // Set editing mode
            isEditingAgent = true;
            editingAgentId = agentId;
            
            // Update modal title
            document.getElementById('agentModalTitle').textContent = 'Edit Agent';
            
            // Populate form fields
            document.getElementById('agentId').value = agentId;
            document.getElementById('agentName').value = user.name || '';
            document.getElementById('agentBranch').value = user.branch || '';
            document.getElementById('agentRole').value = user.role || '';
            document.getElementById('agentPassword').value = ''; // Don't show existing password
            
            // Make agent ID field readonly during edit
            document.getElementById('agentId').readOnly = true;
            
            // Show password by default when editing
            const passwordInput = document.getElementById('agentPassword');
            const toggleBtn = document.getElementById('passwordToggle');
            const toggleIcon = toggleBtn.querySelector('.toggle-icon');
            const passwordHelp = document.getElementById('passwordHelp');
            
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
            passwordHelp.style.display = 'block';
            
            // Show modal
            showAgentModal();
        } catch (error) {
            console.error('Error loading agent for edit:', error);
            alert('Failed to load agent details. Please try again.');
        }
    }    // Delete agent function
    async function deleteAgent(agentId) {
        if (confirm(`Are you sure you want to delete agent ${agentId}?`)) {
            try {
                await UserManagementAPI.deleteUser(agentId);
                alert(`Agent ${agentId} has been deleted.`);
                // Reload agents list
                loadAgents();
            } catch (error) {
                console.error('Error deleting agent:', error);
                alert(`Failed to delete agent: ${error.message}`);
            }
        }
    }

    // Handle saving agent (add or edit)
    async function handleSaveAgent(e) {
        e.preventDefault();
        
        const agentId = document.getElementById('agentId').value.trim().toUpperCase();
        const agentName = document.getElementById('agentName').value.trim();
        const agentBranch = document.getElementById('agentBranch').value.trim();
        const agentRole = document.getElementById('agentRole').value;
        const agentPassword = document.getElementById('agentPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Basic validation
        if (!agentId || !agentName || !agentBranch || !agentRole) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Password validation (required for new agents, optional for edits)
        if (!isEditingAgent && !agentPassword) {
            alert('Password is required for new agents.');
            return;
        }
        
        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = isEditingAgent ? 'Updating...' : 'Creating...';
        submitBtn.disabled = true;
        
        try {
            const userData = {
                agentId: agentId,
                name: agentName,
                branch: agentBranch,
                role: agentRole,
                isActive: true
            };
            
            // Only include password if provided
            if (agentPassword) {
                userData.password = agentPassword;
            }
            
            if (isEditingAgent) {
                // Update existing agent
                await UserManagementAPI.updateUser(editingAgentId, userData);
                alert(`Agent ${agentId} has been updated successfully.`);
            } else {
                // Create new agent
                await UserManagementAPI.createUser(userData);
                alert(`Agent ${agentId} has been created successfully.`);
            }
            
            // Hide modal and reload agents list
            hideAgentModal();
            loadAgents();
            
        } catch (error) {
            console.error('Error saving agent:', error);
            alert(`Failed to ${isEditingAgent ? 'update' : 'create'} agent: ${error.message}`);
        } finally {
            // Restore button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    // Show agent modal for adding new agent
    function showAddAgentModal() {
        // Reset editing mode
        isEditingAgent = false;
        editingAgentId = null;
        
        // Update modal title
        document.getElementById('agentModalTitle').textContent = 'Add New Agent';
        
        // Clear form
        document.getElementById('agentForm').reset();
        
        // Make agent ID field editable
        document.getElementById('agentId').readOnly = false;
        
        // Reset password field to hidden
        const passwordInput = document.getElementById('agentPassword');
        const toggleBtn = document.getElementById('passwordToggle');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        const passwordHelp = document.getElementById('passwordHelp');
        
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
        passwordHelp.style.display = 'none';
        
        // Show modal
        showAgentModal();
    }

    // Show agent modal
    function showAgentModal() {
        if (agentModal) {
            agentModal.style.display = 'block';
        }
    }

    // Hide agent modal
    function hideAgentModal() {
        if (agentModal) {
            agentModal.style.display = 'none';
        }
        
        // Reset form and editing state
        document.getElementById('agentForm').reset();
        isEditingAgent = false;
        editingAgentId = null;
        document.getElementById('agentId').readOnly = false;
    }    // Load agents when switching to agents tab (updated at bottom to match the earlier implementation)
    async function loadAgentsLegacy() {
        try {
            // Get agents from API instead of localStorage
            const users = await UserManagementAPI.getAllUsers();
            displayAgents(users);
        } catch (error) {
            console.error('Error loading agents:', error);
            alert('Failed to load agents. Please try again.');
        }
    }

    // ...existing code...
});