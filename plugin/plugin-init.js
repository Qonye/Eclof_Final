(function(window) {
    'use strict';

    // --- BEGIN EMBEDDED SignaturePad Library ---
    // Content of signature_pad.umd.js goes here.
    // This defines the SignaturePad class within this IIFE's scope.
    // Example (truncated):
    /*!
    * Signature Pad v4.0.0 | https://github.com/szimek/signature_pad
    * (c) 2021 Szymon Nowak | Released under the MIT license
    */
    var SignaturePad = (function (exports) {
        'use strict';

        // Define Point and Bezier classes first if they are used by SignaturePad
        class Point { /* ... Point class code ... */ }
        class Bezier { /* ... Bezier class code ... */ }

        // ... potentially other helper functions/classes from the library ...

        class SignaturePad {
             constructor(canvas, options = {}) { /* ... SignaturePad constructor code ... */ }
             clear() { /* ... clear method code ... */ }
             toDataURL(type = 'image/png', encoderOptions) { /* ... toDataURL method code ... */ }
             isEmpty() { /* ... isEmpty method code ... */ }
             // ... other methods ...
        }
        // ... rest of the library code ...

        // Ensure the class is available.
        return SignaturePad;

    })({}); // Execute the UMD wrapper if present, or adjust as needed.
    // --- END EMBEDDED SignaturePad Library ---


    // --- Placeholder for Bundled Plugin Code ---
    const bundledLogic = {
        initializeForm: (targetElement, options) => {
            console.log(`Initializing borrower form in ${targetElement.id} with options:`, options);
            targetElement.innerHTML = `
                <div class="eclof-plugin-container eclof-form-mode">
                    <!-- ... (Form HTML structure as defined previously) ... -->
                     <form id="borrowerFormPlugin">
                        <!-- Basic Info Section -->
                        <div class="form-section">
                            <h3>Basic Information</h3>
                            <label for="plugin-name">Name:</label>
                            <input type="text" id="plugin-name" name="name" required>
                            <!-- ... other basic info fields ... -->
                            <label for="plugin-branch">Branch:</label>
                            <input type="text" id="plugin-branch" name="branch" required>
                             <label for="plugin-clientId">Client ID:</label>
                            <input type="text" id="plugin-clientId" name="clientId" required>
                             <label for="plugin-loanAmount">Loan Amount:</label>
                            <input type="number" id="plugin-loanAmount" name="loanAmount" required>
                             <label for="plugin-groupName">Group Name (Optional):</label>
                            <input type="text" id="plugin-groupName" name="groupName">
                        </div>

                        <!-- Profile Image Section -->
                        <div class="form-section profile-image-section">
                             <h3>Profile Image</h3>
                             <div class="image-preview" id="plugin-imagePreview">
                                 <span class="image-preview-text">Image Preview</span>
                             </div>
                             <input type="file" id="plugin-profileImage" name="profileImage" accept="image/*" style="display: none;">
                             <label for="plugin-profileImage" class="file-upload-label">Choose Image</label>
                        </div>

                        <!-- Borrower Details Section -->
                        <div class="form-section">
                            <h3>Borrower Details</h3>
                            <label for="plugin-background">Background:</label>
                            <textarea id="plugin-background" name="background" rows="4" required></textarea>
                            <!-- ... other detail fields ... -->
                             <label for="plugin-business">Business:</label>
                            <textarea id="plugin-business" name="business" rows="3" required></textarea>
                             <label for="plugin-loanPurpose">Loan Purpose:</label>
                            <textarea id="plugin-loanPurpose" name="loanPurpose" rows="3" required></textarea>
                             <label for="plugin-challenges">Challenges & Plans:</label>
                            <textarea id="plugin-challenges" name="challenges" rows="3"></textarea>
                             <label for="plugin-community">Community Contribution:</label>
                            <textarea id="plugin-community" name="community" rows="3"></textarea>
                             <label for="plugin-previousLoans">Previous Loans:</label>
                            <textarea id="plugin-previousLoans" name="previousLoans" rows="2"></textarea>
                             <label for="plugin-futurePlans">Future Plans:</label>
                            <textarea id="plugin-futurePlans" name="futurePlans" rows="3"></textarea>
                             <label for="plugin-additionalComments">Additional Comments:</label>
                            <textarea id="plugin-additionalComments" name="additionalComments" rows="3"></textarea>
                        </div>

                        <!-- Waiver & Signature Section -->
                        <div class="form-section waiver-section">
                             <h3>Client Waiver and Consent</h3>
                             <div class="waiver-text">
                                 <!-- ... Waiver text ... -->
                                 <p>I, the undersigned client, hereby authorize ECLOF Kenya and Kiva Microfunds (Kiva)...</p>
                             </div>
                             <div class="signature-section">
                                 <div class="signature-field">
                                     <label for="plugin-clientSignature">Client Signature:</label>
                                     <canvas id="plugin-clientSignatureCanvas" class="signature-box"></canvas>
                                     <button type="button" class="clear-signature-btn" data-target-canvas="plugin-clientSignatureCanvas">Clear Signature</button>
                                     <input type="hidden" id="plugin-clientSignatureImage" name="clientSignatureImage">
                                 </div>
                                 <div class="signature-details">
                                     <div class="form-group">
                                         <label for="plugin-clientName">Client Print Name:</label>
                                         <input type="text" id="plugin-clientName" name="clientName" required>
                                     </div>
                                     <div class="form-group">
                                         <label for="plugin-signatureDate">Date:</label>
                                         <input type="date" id="plugin-signatureDate" name="signatureDate" required>
                                     </div>
                                     <div class="form-group">
                                         <label for="plugin-address">Address:</label>
                                         <input type="text" id="plugin-address" name="address">
                                     </div>
                                 </div>
                             </div>
                             <div class="verbal-consent">
                                 <h4>Verbal Consent Confirmation (If Applicable)</h4>
                                 <p>If the client cannot read the form, the ECLOF Kenya representative must read it aloud...</p>
                                 <div class="signature-field representative-signature">
                                     <label for="plugin-repSignature">ECLOF Kenya Representative Signature:</label>
                                     <canvas id="plugin-repSignatureCanvas" class="signature-box"></canvas>
                                     <button type="button" class="clear-signature-btn" data-target-canvas="plugin-repSignatureCanvas">Clear Signature</button>
                                     <input type="hidden" id="plugin-repSignatureImage" name="repSignatureImage">
                                 </div>
                             </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="form-actions">
                            <button type="submit">Submit Form</button>
                            <button type="reset">Reset Form</button>
                        </div>
                    </form>
                    <div class="form-loader" style="display: none;"> <!-- Loader Placeholder -->
                         <div class="loader-overlay"></div>
                         <div class="loader-content"><div class="loader-spinner"></div><p>Submitting...</p></div>
                    </div>
                    <div class="form-message" style="display: none;"> <!-- Message Placeholder -->
                         <div class="message-content"><span class="message-icon"></span><p class="message-text"></p><button class="message-close">&times;</button></div>
                    </div>
                </div>`;

            // --- Integrate JavaScript Logic from script.js ---
            const formElement = targetElement.querySelector('#borrowerFormPlugin');
            const imageInput = targetElement.querySelector('#plugin-profileImage');
            const imagePreview = targetElement.querySelector('#plugin-imagePreview');
            const clientSigCanvas = targetElement.querySelector('#plugin-clientSignatureCanvas');
            const repSigCanvas = targetElement.querySelector('#plugin-repSignatureCanvas');
            const loader = targetElement.querySelector('.form-loader');
            const messageContainer = targetElement.querySelector('.form-message');
            const messageContent = messageContainer.querySelector('.message-content');
            const messageText = messageContainer.querySelector('.message-text');
            const messageIcon = messageContainer.querySelector('.message-icon');
            const messageClose = messageContainer.querySelector('.message-close');

            let clientSignaturePad, repSignaturePad;

            // 1. Initialize Signature Pads (Now uses the embedded SignaturePad)
            if (typeof SignaturePad !== 'undefined') {
                clientSignaturePad = new SignaturePad(clientSigCanvas, { backgroundColor: 'rgb(255, 255, 255)' });
                repSignaturePad = new SignaturePad(repSigCanvas, { backgroundColor: 'rgb(255, 255, 255)' });

                // Attach clear button listeners
                targetElement.querySelectorAll('.clear-signature-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const targetCanvasId = button.getAttribute('data-target-canvas');
                        if (targetCanvasId === 'plugin-clientSignatureCanvas' && clientSignaturePad) {
                            clientSignaturePad.clear();
                        } else if (targetCanvasId === 'plugin-repSignatureCanvas' && repSignaturePad) {
                            repSignaturePad.clear();
                        }
                    });
                });
            } else {
                console.error('ECLOF Plugin: Embedded SignaturePad library failed to load.');
                clientSigCanvas.parentElement.innerHTML += '<p style="color: red;">SignaturePad library missing.</p>';
                repSigCanvas.parentElement.innerHTML += '<p style="color: red;">SignaturePad library missing.</p>';
            }

            // 2. Handle Image Preview
            imageInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
                    }
                    reader.readAsDataURL(file);
                } else {
                    imagePreview.innerHTML = '<span class="image-preview-text">Image Preview</span>';
                }
            });

            // 5. Implement showLoader, hideLoader, showMessage functions scoped to the plugin container.
            const showLoader = (show = true) => {
                loader.style.display = show ? 'flex' : 'none';
                formElement.querySelector('button[type="submit"]').disabled = show;
                formElement.querySelector('button[type="submit"]').classList.toggle('button-disabled', show);
            };

            const showMessage = (text, type = 'success') => {
                messageText.textContent = text;
                messageContent.className = `message-content ${type}`; // Reset classes
                messageIcon.textContent = type === 'success' ? '✓' : '✗';
                messageContainer.style.display = 'block';
                // Auto-hide after 5 seconds
                setTimeout(() => messageContainer.style.display = 'none', 5000);
            };
            messageClose.addEventListener('click', () => messageContainer.style.display = 'none');


            // 3. Handle Form Submission
            formElement.addEventListener('submit', function(event) {
                event.preventDefault();
                showLoader(true);

                const formData = new FormData(formElement);

                // Add signature images (if pads initialized)
                if (clientSignaturePad && !clientSignaturePad.isEmpty()) {
                    formData.set('clientSignatureImage', clientSignaturePad.toDataURL('image/png'));
                } else {
                     formData.delete('clientSignatureImage'); // Remove if empty or pad not loaded
                }
                 if (repSignaturePad && !repSignaturePad.isEmpty()) {
                    formData.set('repSignatureImage', repSignaturePad.toDataURL('image/png'));
                } else {
                     formData.delete('repSignatureImage'); // Remove if empty or pad not loaded
                }

                // Remove the file input from FormData if no file selected (handled by backend anyway)
                if (imageInput.files.length === 0) {
                     formData.delete('profileImage');
                }

                // Make fetch POST request
                fetch(`${options.apiBaseUrl}/api/submit`, {
                    method: 'POST',
                    body: formData // FormData handles multipart/form-data automatically
                    // No 'Content-Type' header needed when using FormData with files
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage('Form submitted successfully! Submission ID: ' + data.submissionId, 'success');
                        formElement.reset(); // Trigger reset event
                    } else {
                        throw new Error(data.message || 'Submission failed.');
                    }
                })
                .catch(error => {
                    console.error('Submission error:', error);
                    showMessage(`Error: ${error.message}`, 'error');
                })
                .finally(() => {
                    showLoader(false);
                });
            });

            // 4. Handle Form Reset
            formElement.addEventListener('reset', () => {
                if (clientSignaturePad) clientSignaturePad.clear();
                if (repSignaturePad) repSignaturePad.clear();
                imagePreview.innerHTML = '<span class="image-preview-text">Image Preview</span>';
                console.log('Form reset.');
            });
            // --- End JS Integration ---

            console.log('Form HTML structure rendered and basic JS logic attached.');
        },
        initializeAdmin: (targetElement, options) => {
            console.log(`Initializing admin interface in ${targetElement.id} with options:`, options);

            targetElement.innerHTML = `
                <div class="eclof-plugin-container eclof-admin-mode">
                    <!-- ... (Admin Login HTML structure as defined previously) ... -->
                    <div class="admin-login" id="plugin-loginForm">
                         <h2>Administrator Login (Plugin)</h2>
                         <form id="plugin-adminLoginForm">
                             <div class="form-group">
                                 <label for="plugin-username">Username:</label>
                                 <input type="text" id="plugin-username" required value="admin"> <!-- Default for demo -->
                             </div>
                             <div class="form-group">
                                 <label for="plugin-password">Password:</label>
                                 <input type="password" id="plugin-password" required value="eclof2025"> <!-- Default for demo -->
                             </div>
                             <button type="submit" class="admin-button">Login</button>
                         </form>
                         <div class="login-error" id="plugin-loginError"></div>
                         <div class="admin-documentation">
                              <p>Staff Resources:</p>
                              <a href="#" target="_blank" class="doc-link">System Overview (Plugin)</a>
                              <a href="#" target="_blank" class="doc-link">User Guide (Plugin)</a>
                         </div>
                    </div>
                    <!-- ... (Admin Dashboard HTML structure as defined previously) ... -->
                     <div class="admin-dashboard" id="plugin-adminDashboard" style="display: none;">
                         <div class="dashboard-container">
                             <aside class="admin-sidebar">
                                 <div class="admin-documentation">
                                     <p>Staff Resources:</p>
                                     <a href="#" target="_blank" class="doc-link">System Overview</a>
                                     <a href="#" target="_blank" class="doc-link">User Guide</a>
                                 </div>
                                 <button id="plugin-logoutButton" class="admin-button danger">Logout</button>
                             </aside>
                             <div class="dashboard-main">
                                 <h2>Borrower Submissions (Plugin)</h2>
                                 <div class="dashboard-controls">
                                     <div class="search-box">
                                         <input type="text" id="plugin-searchInput" placeholder="Search by Name, Branch, ID...">
                                         <button id="plugin-searchButton" class="admin-button secondary">Search</button>
                                     </div>
                                     <div class="filter-box">
                                         <input type="date" id="plugin-startDate">
                                         <input type="date" id="plugin-endDate">
                                         <button id="plugin-filterDatesButton" class="admin-button secondary">Filter Dates</button>
                                     </div>
                                     <button id="plugin-resetFiltersButton" class="admin-button secondary">Reset Filters</button>
                                 </div>
                                 <div class="submissions-count"><span id="plugin-totalSubmissions">0</span> Submissions Found</div>
                                 <div class="submissions-table-container">
                                     <table class="submissions-table">
                                         <thead>
                                             <tr><th>ID</th><th>Date</th><th>Name</th><th>Branch</th><th>Loan Amt</th><th>Client ID</th><th>Actions</th></tr>
                                         </thead>
                                         <tbody id="plugin-submissionsTableBody">
                                             <tr><td colspan="7" style="text-align: center;">Loading...</td></tr>
                                         </tbody>
                                     </table>
                                 </div>
                                 <div class="pagination">
                                     <button id="plugin-prevPage" disabled>&laquo; Prev</button>
                                     <span id="plugin-pageInfo">Page 1 of 1</span>
                                     <button id="plugin-nextPage" disabled>Next &raquo;</button>
                                 </div>
                             </div>
                         </div>
                    </div>
                    <!-- ... (Submission Modal HTML structure as defined previously) ... -->
                    <div class="modal" id="plugin-submissionModal" style="display: none;">
                        <div class="modal-content">
                            <span class="close-modal" id="plugin-closeModal">&times;</span>
                            <h2>Submission Details</h2>
                            <div id="plugin-submissionDetails">
                                <!-- Details will be rendered here -->
                            </div>
                            <div class="modal-actions">
                                <button id="plugin-printSubmission" class="admin-button secondary">Print</button>
                                <button id="plugin-exportPDF" class="admin-button secondary">Export PDF</button>
                                <button id="plugin-generateProfile" class="admin-button">Generate Profile</button>
                                <button id="plugin-deleteSubmission" class="admin-button danger">Delete Submission</button>
                            </div>
                        </div>
                    </div>
                </div>`;

            // --- Integrate JavaScript Logic from admin-script.js ---
            const loginForm = targetElement.querySelector('#plugin-loginForm');
            const adminLoginForm = targetElement.querySelector('#plugin-adminLoginForm');
            const adminDashboard = targetElement.querySelector('#plugin-adminDashboard');
            const loginError = targetElement.querySelector('#plugin-loginError');
            const logoutButton = targetElement.querySelector('#plugin-logoutButton');
            const submissionsTableBody = targetElement.querySelector('#plugin-submissionsTableBody');
            const totalSubmissionsSpan = targetElement.querySelector('#plugin-totalSubmissions');
            // ... (get references to search, filter, pagination elements) ...
            const searchInput = targetElement.querySelector('#plugin-searchInput');
            const searchButton = targetElement.querySelector('#plugin-searchButton');
            const startDateInput = targetElement.querySelector('#plugin-startDate');
            const endDateInput = targetElement.querySelector('#plugin-endDate');
            const filterDatesButton = targetElement.querySelector('#plugin-filterDatesButton');
            const resetFiltersButton = targetElement.querySelector('#plugin-resetFiltersButton');
            const prevPageButton = targetElement.querySelector('#plugin-prevPage');
            const nextPageButton = targetElement.querySelector('#plugin-nextPage');
            const pageInfoSpan = targetElement.querySelector('#plugin-pageInfo');

            const submissionModal = targetElement.querySelector('#plugin-submissionModal');
            const closeModalButton = targetElement.querySelector('#plugin-closeModal');
            const submissionDetailsContainer = targetElement.querySelector('#plugin-submissionDetails');
            // ... (get references to modal action buttons) ...
            const generateProfileButton = targetElement.querySelector('#plugin-generateProfile');
            const deleteModalButton = targetElement.querySelector('#plugin-deleteSubmission');


            // State variables scoped to this admin instance
            let pluginAuthState = { loggedIn: false }; // Simple in-memory auth state
            let pluginSubmissionsState = {
                all: [],
                filtered: [],
                currentPage: 1,
                itemsPerPage: 10,
                currentSubmissionId: null,
                currentSubmissionData: null // Store fetched data for modal use
            };

            // --- Core Admin Functions (Adapted) ---

            const showAdminLogin = (show = true) => {
                loginForm.style.display = show ? 'block' : 'none';
                adminDashboard.style.display = show ? 'none' : 'block';
                if (show) {
                    pluginAuthState.loggedIn = false;
                    // Clear sensitive fields on logout/show login
                    const passwordInput = targetElement.querySelector('#plugin-password');
                    if(passwordInput) passwordInput.value = '';
                } else {
                     pluginAuthState.loggedIn = true;
                     loadSubmissions(); // Load data when showing dashboard
                }
            };

            const loadSubmissions = () => {
                console.log('Plugin: Loading submissions from', `${options.apiBaseUrl}/api/admin/submissions`);
                submissionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading submissions...</td></tr>';
                fetch(`${options.apiBaseUrl}/api/admin/submissions`)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        pluginSubmissionsState.all = data;
                        pluginSubmissionsState.filtered = [...data];
                        pluginSubmissionsState.currentPage = 1;
                        displaySubmissions();
                        updatePagination();
                    })
                    .catch(error => {
                        console.error('Plugin: Error loading submissions:', error);
                        submissionsTableBody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Error loading submissions: ${error.message}</td></tr>`;
                    });
            };

            const displaySubmissions = () => {
                 submissionsTableBody.innerHTML = ''; // Clear previous
                 const { filtered, currentPage, itemsPerPage } = pluginSubmissionsState;
                 const startIndex = (currentPage - 1) * itemsPerPage;
                 const endIndex = startIndex + itemsPerPage;
                 const pageSubmissions = filtered.slice(startIndex, endIndex);
                 totalSubmissionsSpan.textContent = filtered.length;

                 if (pageSubmissions.length === 0) {
                     submissionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No submissions found matching criteria.</td></tr>';
                     return;
                 }

                 pageSubmissions.forEach(submission => {
                     const row = document.createElement('tr');
                     const date = new Date(submission.timestamp).toLocaleDateString();
                     const name = submission.data.name || 'N/A';
                     // ... (render other columns) ...
                     row.innerHTML = `
                         <td data-label="ID">${submission.id.substring(0, 10)}...</td>
                         <td data-label="Date">${date}</td>
                         <td data-label="Name">${name}</td>
                         <td data-label="Branch">${submission.data.branch || 'N/A'}</td>
                         <td data-label="Loan Amt">${submission.data.loanAmount || 'N/A'}</td>
                         <td data-label="Client ID">${submission.data.clientId || 'N/A'}</td>
                         <td data-label="Actions">
                             <div class="action-buttons">
                                 <button class="action-button view-button" data-id="${submission.id}">View</button>
                                 <button class="action-button delete-button" data-id="${submission.id}">Delete</button>
                             </div>
                         </td>`;
                     submissionsTableBody.appendChild(row);
                 });
                 attachTableActionListeners(); // Re-attach listeners for new buttons
            };

            const updatePagination = () => {
                 const { filtered, currentPage, itemsPerPage } = pluginSubmissionsState;
                 const totalPages = Math.ceil(filtered.length / itemsPerPage);
                 pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages || 1}`;
                 prevPageButton.disabled = currentPage <= 1;
                 nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
            };

            const attachTableActionListeners = () => {
                 // Use event delegation on the table body for efficiency
                 submissionsTableBody.querySelectorAll('.view-button').forEach(btn => {
                     // Remove old listener before adding new one if needed, or use delegation
                     btn.onclick = (e) => viewSubmissionDetails(e.target.getAttribute('data-id'));
                 });
                 submissionsTableBody.querySelectorAll('.delete-button').forEach(btn => {
                     btn.onclick = (e) => {
                         const id = e.target.getAttribute('data-id');
                         if (confirm(`Delete submission ${id}?`)) {
                             deleteSubmission(id);
                         }
                     };
                 });
            };

            const viewSubmissionDetails = (submissionId) => {
                 console.log('Plugin: Viewing details for', submissionId);
                 pluginSubmissionsState.currentSubmissionId = submissionId;
                 submissionDetailsContainer.innerHTML = '<p>Loading details...</p>';
                 submissionModal.style.display = 'block';

                 fetch(`${options.apiBaseUrl}/api/admin/submissions/${submissionId}`)
                    .then(response => {
                         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                         return response.json();
                     })
                    .then(submission => {
                         pluginSubmissionsState.currentSubmissionData = submission; // Store for actions
                         renderSubmissionDetails(submission); // Call the rendering function
                     })
                    .catch(error => {
                         console.error('Plugin: Error loading submission details:', error);
                         submissionDetailsContainer.innerHTML = `<p style="color: red;">Error loading details: ${error.message}</p>`;
                     });
            };

            const renderSubmissionDetails = (submission) => {
                // This function needs to be adapted from admin-script.js
                // - Use submission data to build HTML for submissionDetailsContainer
                // - Ensure image paths are constructed correctly (e.g., using options.apiBaseUrl if they are relative)
                // - Attach listeners for image management buttons (Download, Replace)
                // - Call adapted attachImageActionListeners()
                console.log('Plugin: Rendering submission details for', submission.id);
                let detailsHTML = `<h3>Details for ${submission.id}</h3>`;
                detailsHTML += `<p>Name: ${submission.data.name || 'N/A'}</p>`;
                // ... Add more fields ...

                // Image rendering (example for profile image)
                 if (submission.profileImagePath) {
                     // Construct URL carefully - assuming API returns relative path like 'uploads/...'
                     const imageUrl = `${options.apiBaseUrl}/${submission.profileImagePath.replace(/\\/g, '/')}`;
                     detailsHTML += `
                         <div class="image-container">
                             <img src="${imageUrl}" alt="Profile Image" id="plugin-profileImageDetail" style="max-width: 200px;">
                             <div class="image-actions">
                                 <button class="image-action-btn download-image" data-image-type="profile">Download</button>
                                 <button class="image-action-btn replace-image" data-image-type="profile">Replace</button>
                             </div>
                             <!-- Upload container placeholder -->
                         </div>`;
                 }
                 // ... Render other images ...

                submissionDetailsContainer.innerHTML = detailsHTML;
                attachModalActionListeners(); // Attach listeners for modal buttons like download/replace
                attachImageActionListeners(); // Attach listeners specifically for image actions
            };

             const attachImageActionListeners = () => {
                 // Adapt from admin-script.js to use targetElement.querySelector
                 // and call adapted handleImageDownload/handleImageUpload
                 const downloadBtns = submissionDetailsContainer.querySelectorAll('.download-image');
                 downloadBtns.forEach(btn => btn.onclick = handleImageDownload); // Simplified binding

                 const replaceBtns = submissionDetailsContainer.querySelectorAll('.replace-image');
                 replaceBtns.forEach(btn => btn.onclick = showImageUpload); // Simplified binding

                 // ... Add listeners for upload/cancel buttons within the upload container ...
             };

             const handleImageDownload = (e) => {
                 // Adapt from admin-script.js
                 // - Get imageType and currentSubmissionId from pluginSubmissionsState
                 // - Construct download URL using options.apiBaseUrl + `/api/download-image/...`
                 // - Trigger download
                 const imageType = e.target.getAttribute('data-image-type');
                 const submissionId = pluginSubmissionsState.currentSubmissionId;
                 if (!submissionId) return;
                 console.log(`Plugin: Downloading ${imageType} for ${submissionId}`);
                 const downloadUrl = `${options.apiBaseUrl}/api/download-image/${submissionId}/${imageType}`; // Assuming this endpoint exists
                 window.open(downloadUrl, '_blank'); // Simple download method
             };

             const showImageUpload = (e) => { /* Adapt from admin-script.js */ console.log('Show upload UI'); };
             const handleImageUpload = (e) => {
                 // Adapt from admin-script.js
                 // - Get file, imageType, submissionId
                 // - Create FormData
                 // - Fetch POST to options.apiBaseUrl + `/api/admin/submissions/${submissionId}/image`
                 // - Update image src on success
                 console.log('Handle image upload');
             };


            const deleteSubmission = (submissionId) => {
                 console.log('Plugin: Deleting submission', submissionId);
                 fetch(`${options.apiBaseUrl}/api/admin/submissions/${submissionId}`, { method: 'DELETE' })
                    .then(response => {
                         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                         return response.json();
                     })
                    .then(data => {
                         if (data.success) {
                             console.log('Plugin: Deletion successful');
                             loadSubmissions(); // Refresh list
                         } else {
                             throw new Error(data.message || 'Deletion failed');
                         }
                     })
                    .catch(error => {
                         console.error('Plugin: Error deleting submission:', error);
                         alert(`Error deleting: ${error.message}`);
                     });
            };

            const generateProfile = () => {
                const submissionId = pluginSubmissionsState.currentSubmissionId;
                if (!submissionId) return;
                console.log('Plugin: Generating profile for', submissionId);
                // - Show loading state on button
                // - Fetch POST to options.apiBaseUrl + `/api/admin/generate-profile/${submissionId}`
                // - Display generated profile in the modal or a new section
                // - Handle errors
                alert('Profile generation logic to be implemented here.');
            };


            // --- Event Listeners (Adapted) ---

            // 1. Handle Login
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                loginError.textContent = '';
                const username = targetElement.querySelector('#plugin-username').value;
                const password = targetElement.querySelector('#plugin-password').value;

                // ** IMPORTANT: Replace with actual API call for authentication **
                // This is a placeholder using the hardcoded credentials
                const ADMIN_CREDENTIALS = { username: 'admin', password: 'eclof2025' };
                if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                    console.log('Plugin: Login successful (using placeholder check)');
                    showAdminLogin(false); // Show dashboard
                } else {
                    console.log('Plugin: Login failed');
                    loginError.textContent = 'Invalid credentials (placeholder check).';
                }
            });

            // 2. Handle Logout
            logoutButton.addEventListener('click', () => {
                 console.log('Plugin: Logging out');
                 showAdminLogin(true); // Show login form
            });

            // 5. Handle Search/Filtering
            searchButton.addEventListener('click', () => { /* Adapt search logic */ console.log('Search clicked'); });
            filterDatesButton.addEventListener('click', () => { /* Adapt date filter logic */ console.log('Filter dates clicked'); });
            resetFiltersButton.addEventListener('click', () => { /* Adapt reset logic */ console.log('Reset filters clicked'); });

            // Pagination listeners
            prevPageButton.addEventListener('click', () => {
                 if (pluginSubmissionsState.currentPage > 1) {
                     pluginSubmissionsState.currentPage--;
                     displaySubmissions();
                     updatePagination();
                 }
            });
            nextPageButton.addEventListener('click', () => {
                 const totalPages = Math.ceil(pluginSubmissionsState.filtered.length / pluginSubmissionsState.itemsPerPage);
                 if (pluginSubmissionsState.currentPage < totalPages) {
                     pluginSubmissionsState.currentPage++;
                     displaySubmissions();
                     updatePagination();
                 }
            });


            // Modal listeners
            closeModalButton.addEventListener('click', () => submissionModal.style.display = 'none');
            window.addEventListener('click', (event) => { // Close modal on outside click
                 if (event.target === submissionModal) {
                     submissionModal.style.display = 'none';
                 }
            });

             // Attach listeners for modal action buttons
             const attachModalActionListeners = () => {
                 generateProfileButton.onclick = generateProfile;
                 deleteModalButton.onclick = () => {
                     if (pluginSubmissionsState.currentSubmissionId && confirm(`Delete submission ${pluginSubmissionsState.currentSubmissionId} from modal?`)) {
                         deleteSubmission(pluginSubmissionsState.currentSubmissionId);
                         submissionModal.style.display = 'none'; // Close modal after delete action
                     }
                 };
                 // ... listeners for print/export ...
             };


            // Initial Check (if some auth state could be persisted, e.g. via options)
            // For now, just show login by default
            showAdminLogin(true);

            // --- End JS Integration ---

            console.log('Admin HTML structure rendered and basic JS logic attached.');
        }
    };
    // --- End Placeholder ---

    function init(options) {
        if (!options || !options.targetElementSelector || !options.apiBaseUrl || !options.mode) {
            console.error('ECLOF Plugin Error: Missing required options (targetElementSelector, apiBaseUrl, mode).');
            return;
        }

        const targetElement = document.querySelector(options.targetElementSelector);
        if (!targetElement) {
            console.error(`ECLOF Plugin Error: Target element "${options.targetElementSelector}" not found.`);
            return;
        }

        // Ensure base URL doesn't have trailing slash
        options.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, '');

        console.log(`ECLOF Plugin: Initializing mode "${options.mode}" for target ${options.targetElementSelector}...`);

        // Load necessary CSS dynamically (optional, could be done via <link>)
        loadPluginCSS(options.cssUrl || 'eclof-plugin.css');

        // Call the appropriate initializer based on mode
        if (options.mode === 'form') {
            bundledLogic.initializeForm(targetElement, options);
        } else if (options.mode === 'admin') {
            bundledLogic.initializeAdmin(targetElement, options);
        } else {
            console.error(`ECLOF Plugin Error: Unknown mode "${options.mode}". Use 'form' or 'admin'.`);
        }
    }

    function loadPluginCSS(url) {
        // Avoid loading the same CSS file multiple times
        if (!document.querySelector(`link[href="${url}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
            console.log(`ECLOF Plugin: Loading CSS from ${url}`);
        } else {
            console.log(`ECLOF Plugin: CSS ${url} already loaded.`);
        }
    }

    // Expose the init function to the global scope
    window.ECLOFPlugin = {
        init: init
    };

})(window);
