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
        fetch('/api/admin/submissions')
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
                <td>${submission.id}</td>
                <td>${date}</td>
                <td>${name}</td>
                <td>${branch}</td>
                <td>${loanAmount}</td>
                <td>${clientId}</td>
                <td>
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
        fetch(`/api/admin/submissions/${submissionId}`)
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
                detailsHTML += `
                    <div class="image-container">
                        <img src="/${submission.profileImagePath}" alt="Profile Image">
                        <div class="image-label">Profile Photo</div>
                    </div>
                `;
            }
            
            if (data.clientSignatureImagePath) {
                detailsHTML += `
                    <div class="image-container">
                        <img src="/${data.clientSignatureImagePath}" alt="Client Signature">
                        <div class="image-label">Client Signature</div>
                    </div>
                `;
            }
            
            if (data.repSignatureImagePath) {
                detailsHTML += `
                    <div class="image-container">
                        <img src="/${data.repSignatureImagePath}" alt="Representative Signature">
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
        fetch(`/api/admin/submissions/${submissionId}`, {
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
});