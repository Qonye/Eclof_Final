document.addEventListener('DOMContentLoaded', function() {
    // Admin credentials (hard-coded for demonstration)
    // In a real application, this would be validated on the server side
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'eclof2025'
    };

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
    const resetFiltersButton = document.getElementById('resetFilters');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfoSpan = document.getElementById('pageInfo');
    const submissionModal = document.getElementById('submissionModal');
    const closeModal = document.querySelector('.close-modal');
    const submissionDetails = document.getElementById('submissionDetails');
    const printSubmissionButton = document.getElementById('printSubmission');
    const exportPDFButton = document.getElementById('exportPDF');
    const deleteSubmissionButton = document.getElementById('deleteSubmission');

    // State
    let currentSubmissions = [];
    let filteredSubmissions = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let currentSubmissionId = null;

    // Make currentSubmissionId accessible globally for the profile generator
    window.currentSubmissionId = null;

    const BASE_API_URL = 'https://eclofprofileengine.up.railway.app'; // Your deployed backend URL

    // Check if the user is already logged in
    checkLoginStatus();

    // Event Listeners
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    searchButton.addEventListener('click', handleSearch);
    filterDatesButton.addEventListener('click', handleDateFilter);
    resetFiltersButton.addEventListener('click', resetFilters);
    prevPageButton.addEventListener('click', goToPreviousPage);
    nextPageButton.addEventListener('click', goToNextPage);
    closeModal.addEventListener('click', closeSubmissionModal);
    printSubmissionButton.addEventListener('click', printSubmissionDetails);
    exportPDFButton.addEventListener('click', exportSubmissionAsPDF);
    deleteSubmissionButton.addEventListener('click', handleDeleteSubmission);

    // Handle login
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Set session
            sessionStorage.setItem('adminLoggedIn', 'true');
            
            // Hide login, show dashboard
            loginForm.style.display = 'none';
            adminDashboard.style.display = 'block';
            
            // Load submissions
            loadSubmissions();
        } else {
            loginError.textContent = 'Invalid username or password. Please try again.';
            
            // Clear the error message after 3 seconds
            setTimeout(() => {
                loginError.textContent = '';
            }, 3000);
        }
    }

    // Handle logout
    function handleLogout() {
        sessionStorage.removeItem('adminLoggedIn');
        adminDashboard.style.display = 'none';
        loginForm.style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    // Check if user is logged in
    function checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        
        if (isLoggedIn) {
            loginForm.style.display = 'none';
            adminDashboard.style.display = 'block';
            loadSubmissions();
        }
    }

    // Load submissions from the server
    function loadSubmissions() {
        fetch(`${BASE_API_URL}/api/admin/submissions`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch submissions');
                }
                return response.json();
            })
            .then(data => {
                currentSubmissions = data;
                filteredSubmissions = [...currentSubmissions];
                updatePagination();
                displaySubmissions();
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
        totalSubmissionsSpan.textContent = filteredSubmissions.length;
        
        if (pageSubmissions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">No submissions found</td>`;
            submissionsTableBody.appendChild(emptyRow);
            return;
        }
        
        // Add submissions to the table
        pageSubmissions.forEach(submission => {
            const row = document.createElement('tr');
            
            const date = new Date(submission.timestamp).toLocaleDateString();
            const name = submission.data.name || 'N/A';
            const branch = submission.data.branch || 'N/A';
            const loanAmount = submission.data.loanAmount || 'N/A';
            const clientId = submission.data.clientId || 'N/A';
            
            row.innerHTML = `
                <td data-label="Submission ID">${submission.id}</td>
                <td data-label="Date">${date}</td>
                <td data-label="Borrower Name">${name}</td>
                <td data-label="Branch">${branch}</td>
                <td data-label="Loan Amount">${loanAmount}</td>
                <td data-label="Client ID">${clientId}</td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="action-button view-button" data-id="${submission.id}">View</button>
                        <button class="action-button delete-button" data-id="${submission.id}">Delete</button>
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
        } else {
            filteredSubmissions = currentSubmissions.filter(submission => {
                const data = submission.data;
                
                // Search in common fields
                return (
                    (data.name && data.name.toLowerCase().includes(searchTerm)) ||
                    (data.branch && data.branch.toLowerCase().includes(searchTerm)) ||
                    (data.clientId && data.clientId.toLowerCase().includes(searchTerm)) ||
                    (submission.id && submission.id.toLowerCase().includes(searchTerm))
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
        }
        
        filteredSubmissions = currentSubmissions.filter(submission => {
            const submissionDate = new Date(submission.timestamp);
            
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
    }

    // View submission details
    function viewSubmissionDetails(submissionId) {
        fetch(`${BASE_API_URL}/api/admin/submissions/${submissionId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch submission details');
                }
                return response.json();
            })
            .then(submission => {
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
                setTimeout(addImageLoadEventListeners, 100);
            })
            .catch(error => {
                console.error('Error loading submission details:', error);
                alert('Failed to load submission details. Please try again later.');
            });
    }

    // Render submission details in the modal
    function renderSubmissionDetails(submission) {
        const data = submission.data;
        const date = new Date(submission.timestamp).toLocaleString();
        
        // Build the HTML for submission details
        let detailsHTML = `
            <div class="detail-section">
                <h3>Basic Information</h3>
                <div class="detail-item">
                    <div class="detail-label">Submission ID:</div>
                    <div>${submission.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date Submitted:</div>
                    <div>${date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Name:</div>
                    <div>${data.name || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Branch:</div>
                    <div>${data.branch || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Client ID:</div>
                    <div>${data.clientId || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Loan Amount:</div>
                    <div>${data.loanAmount || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Group Name:</div>
                    <div>${data.groupName || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Borrower Details</h3>
                <div class="detail-item">
                    <div class="detail-label">Background:</div>
                    <div>${data.background || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Business:</div>
                    <div>${data.business || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Loan Purpose:</div>
                    <div>${data.loanPurpose || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Challenges & Plans:</div>
                    <div>${data.challenges || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Community Contribution:</div>
                    <div>${data.community || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Previous Loans:</div>
                    <div>${data.previousLoans || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Future Plans:</div>
                    <div>${data.futurePlans || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Additional Comments:</div>
                    <div>${data.additionalComments || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Client Waiver Information</h3>
                <div class="detail-item">
                    <div class="detail-label">Client Name:</div>
                    <div>${data.clientName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Signature Date:</div>
                    <div>${data.signatureDate || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Address:</div>
                    <div>${data.address || 'N/A'}</div>
                </div>
            </div>
        `;
        
        // Add images if available
        const hasImages = submission.profileImagePath || data.clientSignatureImagePath || data.repSignatureImagePath;
        
        if (hasImages) {
            detailsHTML += `
                <div class="detail-section">
                    <h3>Images</h3>
                    <div class="borrower-images">
            `;
            
            if (submission.profileImagePath) {
                // Fix path handling - if it contains absolute path
                let profileImagePath = submission.profileImagePath;
                if (profileImagePath.includes('C:') || profileImagePath.includes('\\')) {
                    // Extract just the filename
                    const pathParts = profileImagePath.split(/[\\\/]/).filter(Boolean);
                    const filename = pathParts[pathParts.length - 1];
                    profileImagePath = `uploads/${filename}`;
                }
                
                detailsHTML += `
                    <div class="image-container">
                        <img src="${profileImagePath}" alt="Profile Image" id="profileImage">
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
            
            if (data.clientSignatureImagePath) {
                // Fix path handling for client signature
                const signatureImagePath = data.clientSignatureImagePath.startsWith('/') 
                    ? data.clientSignatureImagePath.substring(1) 
                    : data.clientSignatureImagePath;
                    
                const signatureImageUrl = signatureImagePath.startsWith('http') 
                    ? signatureImagePath 
                    : `${window.location.origin}/${signatureImagePath}`;
                    
                detailsHTML += `
                    <div class="image-container">
                        <img src="${signatureImageUrl}" alt="Client Signature" id="clientSignatureImage">
                        <div class="image-label">Client Signature</div>
                    </div>
                `;
            }
            
            if (data.repSignatureImagePath) {
                // Fix path handling for rep signature
                const repSignatureImagePath = data.repSignatureImagePath.startsWith('/') 
                    ? data.repSignatureImagePath.substring(1) 
                    : data.repSignatureImagePath;
                    
                const repSignatureImageUrl = repSignatureImagePath.startsWith('http') 
                    ? repSignatureImagePath 
                    : `${window.location.origin}/${repSignatureImagePath}`;
                    
                detailsHTML += `
                    <div class="image-container">
                        <img src="${repSignatureImageUrl}" alt="Representative Signature" id="repSignatureImage">
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
        fetch(`${BASE_API_URL}/api/admin/submissions/${currentSubmissionId}/image`, {
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
    }

    // Delete a submission
    function deleteSubmission(submissionId) {
        fetch(`${BASE_API_URL}/api/admin/submissions/${submissionId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete submission');
            }
            return response.json();
        })
        .then(data => {
            // Remove submission from arrays
            currentSubmissions = currentSubmissions.filter(s => s.id !== submissionId);
            filteredSubmissions = filteredSubmissions.filter(s => s.id !== submissionId);
            
            // Update the UI
            updatePagination();
            displaySubmissions();
            
            alert('Submission deleted successfully.');
        })
        .catch(error => {
            console.error('Error deleting submission:', error);
            alert('Failed to delete submission. Please try again later.');
        });
    }

    // Window click event to close modal if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target === submissionModal) {
            closeSubmissionModal();
        }
    });
    
    // Debug function to help troubleshoot image loading issues
    function addImageLoadEventListeners() {
        const images = document.querySelectorAll('.submission-details img');
        images.forEach(img => {
            img.addEventListener('load', function() {
                console.log('Image loaded successfully:', this.src);
            });
            
            img.addEventListener('error', function() {
                console.error('Failed to load image:', this.src);
                // Replace with a placeholder image
                this.src = 'images/image-placeholder.png';
                // Add a message below the image
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'Image could not be loaded. It may be available after profile generation.';
                errorMsg.style.color = 'red';
                errorMsg.style.fontSize = '0.8em';
                this.parentNode.insertBefore(errorMsg, this.nextSibling);
            });
        });
    }
});