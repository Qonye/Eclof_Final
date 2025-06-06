// Global variables for signature pads
let clientSignaturePad = null;
let repSignaturePad = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if agent is logged in
    checkAgentLogin();
    
    // Initialize agent login form
    initializeAgentLogin();
    
    // Initialize image upload functionality
    initImageUpload();
    
    // Initialize signature pads
    clientSignaturePad = initializeSignaturePad('signatureBox');
    repSignaturePad = initializeSignaturePad('repSignatureBox');
    
    // Clear signature buttons - Fix to properly clear signatures
    document.getElementById('clearSignature').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Clearing client signature pad');
        
        // Direct canvas access for most reliable clearing
        const canvas = document.querySelector('#signatureBox canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Reset context properties
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
            
            console.log('Client signature cleared successfully');
        } else {
            console.error('Could not find client signature canvas');
        }
    });
    
    document.getElementById('clearRepSignature').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Clearing representative signature pad');
        
        // Direct canvas access for most reliable clearing
        const canvas = document.querySelector('#repSignatureBox canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Reset context properties
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
            
            console.log('Representative signature cleared successfully');
        } else {
            console.error('Could not find representative signature canvas');
        }
    });    // Form submission
    document.getElementById('borrowerProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show loading indicator
            showLoadingIndicator();
            
            // Create FormData with proper field mapping
            const formData = createFormDataWithSignatures(this);
            
            // Submit form data to the server
            submitFormToServer(formData);
        }
    });
    
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default reset behavior
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            // Reset all form fields
            const form = document.getElementById('borrowerProfileForm');
            form.reset();
            
            // Clear signatures - using more direct canvas clearing approach
            const clientSignatureCanvas = document.querySelector('#signatureBox canvas');
            const repSignatureCanvas = document.querySelector('#repSignatureBox canvas');
            
            if (clientSignatureCanvas) {
                const ctx = clientSignatureCanvas.getContext('2d');
                ctx.clearRect(0, 0, clientSignatureCanvas.width, clientSignatureCanvas.height);
                // Reset context properties
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
            
            if (repSignatureCanvas) {
                const ctx = repSignatureCanvas.getContext('2d');
                ctx.clearRect(0, 0, repSignatureCanvas.width, repSignatureCanvas.height);
                // Reset context properties
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
            
            // Reset image preview
            resetImagePreview();
            
            // Reset textareas (sometimes .reset() doesn't fully clear them)
            const textAreas = document.querySelectorAll('textarea');
            textAreas.forEach(textarea => {
                textarea.value = '';
            });
            
            // Set default date to today again
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('signatureDate').value = today;
            document.getElementById('repSignatureDate').value = today;
            
            // Focus on first field
            document.querySelector('input[name="name"]').focus();
        }
    });
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('signatureDate').value = today;
    document.getElementById('repSignatureDate').value = today;

    // Apply mobile optimizations if needed
    if (isMobileDevice()) {
        // Adjust the form layout for mobile
        adjustFormForMobile();
    }
});

/**
 * Enhance mobile responsiveness for signature pads
 */
function initializeSignaturePad(elementId) {
    const container = document.getElementById(elementId);
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let ctx = null;
    let canvas = null;
    
    // Create a canvas element with proper dimensions
    if (!container.getContext) {
        // Container is a DIV, create a canvas inside it
        canvas = document.createElement('canvas');
        // Set canvas dimensions to match container
        canvas.width = container.clientWidth || 300;
        canvas.height = container.clientHeight || 150;
        canvas.id = elementId + 'Canvas';
        canvas.style.border = '1px solid #ccc';
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');
    } else {
        // Container is already a canvas
        canvas = container;
        ctx = canvas.getContext('2d');
        // Make sure canvas dimensions match container
        canvas.width = canvas.clientWidth || 300;
        canvas.height = canvas.clientHeight || 150;
    }
    
    // Set up drawing context
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    // Event listeners for mouse (desktop) - bind to the actual canvas
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Event listeners for touch (mobile) - bind to the actual canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: true });
    
    function startDrawing(e) {
        isDrawing = true;
        // Capture starting position
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
    
    function handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling while drawing
        isDrawing = true;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        
        // Update last position
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
    
    function handleTouchMove(e) {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent scrolling while drawing
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // Update last position
        lastX = currentX;
        lastY = currentY;
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
      // Handle window resize to maintain proper canvas dimensions
    window.addEventListener('resize', function() {
        // Ensure canvas dimensions are valid integers
        const currentWidth = Math.floor(canvas.width) || 1;
        const currentHeight = Math.floor(canvas.height) || 1;
        
        // Store the drawing only if canvas has valid dimensions
        let imageData = null;
        if (currentWidth > 0 && currentHeight > 0) {
            try {
                imageData = ctx.getImageData(0, 0, currentWidth, currentHeight);
            } catch (e) {
                console.warn('Could not get image data during resize:', e);
            }
        }
        
        // Resize canvas
        canvas.width = Math.floor(canvas.clientWidth) || 300;
        canvas.height = Math.floor(canvas.clientHeight) || 150;
        
        // Restore the drawing if we have valid image data
        if (imageData) {
            try {
                ctx.putImageData(imageData, 0, 0);
            } catch (e) {
                console.warn('Could not restore image data during resize:', e);
            }
        }
        
        // Reset context properties that are reset after resize
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
    });
      // Make canvas responsive to container size changes
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const width = Math.floor(entry.contentRect.width) || 300;
            const height = Math.floor(entry.contentRect.height) || 150;
            
            if (canvas.width !== width || canvas.height !== height) {
                // Store the drawing only if canvas has valid dimensions
                let imageData = null;
                const currentWidth = Math.floor(canvas.width) || 1;
                const currentHeight = Math.floor(canvas.height) || 1;
                
                if (currentWidth > 0 && currentHeight > 0) {
                    try {
                        imageData = ctx.getImageData(0, 0, currentWidth, currentHeight);
                    } catch (e) {
                        console.warn('Could not get image data during ResizeObserver:', e);
                    }
                }
                
                // Resize canvas
                canvas.width = width;
                canvas.height = height;
                
                // Restore the drawing if we have valid image data
                if (imageData) {
                    try {
                        ctx.putImageData(imageData, 0, 0);
                    } catch (e) {
                        console.warn('Could not restore image data during ResizeObserver:', e);
                    }
                }
                
                // Reset context properties
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
        }
    });
    
    // Observe canvas container size changes
    resizeObserver.observe(canvas);
    
    return {
        canvas: canvas,
        context: ctx,
        clear: function() {
            console.log(`Clearing signature pad: ${elementId}`);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // After clearing, make sure we restore the correct context properties
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
        },        isEmpty: function() {
            try {
                const canvasWidth = Math.floor(canvas.width) || 1;
                const canvasHeight = Math.floor(canvas.height) || 1;
                
                if (canvasWidth <= 0 || canvasHeight <= 0) {
                    return true; // Treat invalid canvas as empty
                }
                
                const pixelData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
                for (let i = 0; i < pixelData.length; i += 4) {
                    if (pixelData[i + 3] !== 0) {
                        return false; // Found a non-transparent pixel
                    }
                }
                return true;
            } catch (e) {
                console.warn('Could not check if canvas is empty:', e);
                return false; // Assume not empty if we can't check
            }
        }
    };
}

/**
 * Initialize image upload and preview functionality
 */
function initImageUpload() {
    const input = document.getElementById('profileImage');
    const preview = document.getElementById('imagePreview');
    const previewText = preview.querySelector('.image-preview-text');
    
    input.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            previewText.style.display = "none";
            
            reader.addEventListener('load', function() {
                // Create image element if it doesn't exist
                let previewImg = preview.querySelector('img');
                if (!previewImg) {
                    previewImg = document.createElement('img');
                    preview.appendChild(previewImg);
                }
                
                // Update image source
                previewImg.src = reader.result;
            });
            
            reader.readAsDataURL(file);
        } else {
            previewText.style.display = "block";
            const previewImg = preview.querySelector('img');
            if (previewImg) {
                preview.removeChild(previewImg);
            }
        }
    });
}

/**
 * Clear the signature pad - Updated for more reliable clearing
 */
function clearSignature(signaturePad) {
    try {
        // Direct canvas access approach - most reliable
        let canvas = null;
        
        // Try to get canvas from signature pad object
        if (signaturePad && signaturePad.canvas) {
            canvas = signaturePad.canvas;
        }
        // If that doesn't work, try to find canvas directly
        else if (signaturePad && typeof signaturePad === 'string') {
            // If signaturePad is actually an element ID
            canvas = document.querySelector(`#${signaturePad} canvas`);
        }
        // Last resort, try to find the canvas inside the signatureBox
        else if (signaturePad && signaturePad.getAttribute) {
            canvas = signaturePad.querySelector('canvas');
        }
        
        // If we have a canvas, clear it
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Reset context properties
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
                
                console.log('Signature cleared successfully via canvas');
                return true;
            }
        }
        
        // If we still couldn't find a canvas, try the clear method
        if (signaturePad && typeof signaturePad.clear === 'function') {
            signaturePad.clear();
            console.log('Signature cleared successfully via clear method');
            return true;
        }
        
        console.error('Could not find a way to clear the signature');
        return false;
    } catch (error) {
        console.error('Error clearing signature:', error);
        return false;
    }
}

/**
 * Reset image preview to default state
 */
function resetImagePreview() {
    const preview = document.getElementById('imagePreview');
    const previewText = preview.querySelector('.image-preview-text');
    const previewImg = preview.querySelector('img');
    
    if (previewImg) {
        preview.removeChild(previewImg);
    }
    
    previewText.style.display = 'block';
    
    // Also reset the file input
    const fileInput = document.getElementById('profileImage');
    fileInput.value = '';
}

/**
 * Validate form before submission
 */
function validateForm() {
    console.log('Starting form validation...');
    
    // Check required fields ONLY within the borrower profile form
    const borrowerForm = document.getElementById('borrowerProfileForm');
    const requiredFields = borrowerForm.querySelectorAll('input[required], textarea[required]');
    console.log(`Found ${requiredFields.length} required fields in borrower form`);
    
    for (let field of requiredFields) {
        const fieldValue = field.value.trim();
        console.log(`Checking field ${field.name || field.id}: "${fieldValue}"`);
        
        if (!fieldValue) {
            console.log(`Field ${field.name || field.id} is empty`);
            alert('Please fill out all required fields');
            field.focus();
            return false;
        }
    }
    
    console.log('All required fields are filled');
    
    // Check client signature (if using signature pad)
    if (clientSignaturePad && typeof clientSignaturePad.isEmpty === 'function') {
        const signatureEmpty = clientSignaturePad.isEmpty();
        console.log(`Client signature is empty: ${signatureEmpty}`);
        
        if (signatureEmpty) {
            alert('Please provide your signature');
            return false;
        }
    } else {
        console.log('Client signature pad not available or isEmpty function missing');
    }
    
    console.log('Client signature validation passed');
    
    // Check profile image (optional but recommended)
    const profileImage = document.getElementById('profileImage');
    if (!profileImage.files || !profileImage.files[0]) {
        const confirmUpload = confirm('No profile image selected. It is recommended to upload a profile image for your Kiva listing. Do you want to continue without a profile image?');
        if (!confirmUpload) {
            return false;
        }
    }
    
    return true;
}

/**
 * Detect mobile device to optimize experience
 */
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Make adjustments for mobile devices
 */
function adjustFormForMobile() {
    // Focus management to prevent zoom on iOS
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // On some mobile devices, setting font-size to 16px prevents zoom
            this.style.fontSize = '16px';
        });
    });
    
    // Make date inputs more mobile-friendly
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // iOS doesn't handle date inputs well, so we can enhance them
        dateInputs.forEach(input => {
            input.type = 'text';
            input.placeholder = 'YYYY-MM-DD';
            // Could add a date picker library here for better experience
        });
    }
    
    // Convert table layout for mobile
    if (window.innerWidth <= 768) {
        const basicInfoTable = document.querySelector('.basic-info');
        if (basicInfoTable) {
            // Ensure the table cells have proper data-label attributes
            const headerCells = basicInfoTable.querySelectorAll('th');
            const dataCells = basicInfoTable.querySelectorAll('tbody td');
            
            headerCells.forEach((header, index) => {
                if (dataCells[index] && !dataCells[index].hasAttribute('data-label')) {
                    dataCells[index].setAttribute('data-label', header.textContent);
                }
            });
        }
    }
    
    // Make signature boxes more touch-friendly
    const signatureBoxes = document.querySelectorAll('.signature-box');
    signatureBoxes.forEach(box => {
        box.style.touchAction = 'none';
    });
}

/**
 * Add global function to reset signatures from anywhere
 * This can be used for debugging or called from the console
 */
window.resetSignatures = function() {
    const signatureBoxes = document.querySelectorAll('.signature-box');
    signatureBoxes.forEach(box => {
        const canvas = box.querySelector('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Reset context properties
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
            
            console.log(`Cleared signature in ${box.id}`);
        }
    });
};

/**
 * Create FormData with signatures included
 */
function createFormDataWithSignatures(form) {
    const formData = new FormData(form);
    
    // Add agent information
    const currentAgent = AgentAuth.getCurrentAgent();
    if (currentAgent) {
        formData.append('submittedBy[agentId]', currentAgent.agentId);
        formData.append('submittedBy[agentName]', currentAgent.name);
        formData.append('submittedBy[agentBranch]', currentAgent.branch);
        formData.append('submittedBy[agentRole]', currentAgent.role);
    }
    
    // Handle client signature
    const clientSignatureCanvas = document.querySelector('#signatureBox canvas');
    if (clientSignatureCanvas) {
        const clientSignatureData = clientSignatureCanvas.toDataURL('image/png');
        formData.append('clientSignature', clientSignatureData);
    }
    
    // Handle representative signature
    const repSignatureCanvas = document.querySelector('#repSignatureBox canvas');
    if (repSignatureCanvas) {
        const repSignatureData = repSignatureCanvas.toDataURL('image/png');
        formData.append('representativeSignature', repSignatureData);
    }
    
    return formData;
}

/**
 * Submit form data to the server
 */
function submitFormToServer(formData) {
    // Set the server endpoint URL
    const apiUrl = 'http://localhost:3000/api/submissions';
    
    fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header as FormData will set it automatically with the boundary parameter
    })
    .then(response => {
        if (!response.ok) {
            // If the server response wasn't ok, throw an error
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoadingIndicator();
        
        // Log successful submission
        console.log('Form submitted successfully:', data);
        
        if (data.success) {
            // Show success message
            const successMessage = data.message || 'Form submitted successfully!';
            showSuccessMessage(successMessage);
            
            // Save submission ID if provided by server
            if (data.data && data.data.submissionId) {
                localStorage.setItem('lastSubmissionId', data.data.submissionId);
            }
            
            // Optional: Reset form after successful submission
            const shouldReset = confirm('Form submitted successfully! Would you like to reset the form to enter a new profile?');
            if (shouldReset) {
                resetForm();
            }
        } else {
            showErrorMessage(data.message || 'There was an error submitting the form');
        }
    })
    .catch(error => {
        hideLoadingIndicator();
        console.error('Error submitting form:', error);
        
        // Show appropriate error message
        let errorMessage = 'There was an error submitting the form. Please try again later.';
        
        // Check for network errors
        if (!navigator.onLine) {
            errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
        }
        
        showErrorMessage(errorMessage);
    });
}

/**
 * Reset the form completely
 */
function resetForm() {
    // Reset all form fields
    const form = document.getElementById('borrowerProfileForm');
    form.reset();
    
    // Clear signatures
    const clientSignatureCanvas = document.querySelector('#signatureBox canvas');
    const repSignatureCanvas = document.querySelector('#repSignatureBox canvas');
    
    if (clientSignatureCanvas) {
        const ctx = clientSignatureCanvas.getContext('2d');
        ctx.clearRect(0, 0, clientSignatureCanvas.width, clientSignatureCanvas.height);
        // Reset context properties
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
    }
    
    if (repSignatureCanvas) {
        const ctx = repSignatureCanvas.getContext('2d');
        ctx.clearRect(0, 0, repSignatureCanvas.width, repSignatureCanvas.height);
        // Reset context properties
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
    }
    
    // Reset image preview
    resetImagePreview();
    
    // Reset textareas
    const textAreas = document.querySelectorAll('textarea');
    textAreas.forEach(textarea => {
        textarea.value = '';
    });
    
    // Set default date to today again
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('signatureDate').value = today;
    document.getElementById('repSignatureDate').value = today;
    
    // Focus on first field
    document.querySelector('input[name="name"]').focus();
}

/**
 * Show loading indicator while form is being submitted
 */
function showLoadingIndicator() {
    // Check if loading indicator already exists
    let loader = document.querySelector('.form-loader');
    
    if (!loader) {
        // Create loading indicator if it doesn't exist
        loader = document.createElement('div');
        loader.className = 'form-loader';
        loader.innerHTML = `
            <div class="loader-overlay"></div>
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Submitting form, please wait...</p>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        // If it exists, just make it visible
        loader.style.display = 'block';
    }
    
    // Disable the submit button to prevent multiple submissions
    const submitButton = document.getElementById('submitForm');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('button-disabled');
    }
}

/**
 * Hide loading indicator after form submission completes
 */
function hideLoadingIndicator() {
    const loader = document.querySelector('.form-loader');
    if (loader) {
        loader.style.display = 'none';
    }
    
    // Re-enable the submit button
    const submitButton = document.getElementById('submitForm');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('button-disabled');
    }
}

/**
 * Show success message after successful form submission
 */
function showSuccessMessage(message) {
    // Check if message container already exists
    let messageContainer = document.querySelector('.form-message');
    
    if (!messageContainer) {
        // Create message container if it doesn't exist
        messageContainer = document.createElement('div');
        messageContainer.className = 'form-message';
        document.body.appendChild(messageContainer);
    }
    
    // Update message container with success message
    messageContainer.innerHTML = `
        <div class="message-content success">
            <span class="message-icon">✓</span>
            <p>${message}</p>
            <button class="message-close">×</button>
        </div>
    `;
    messageContainer.style.display = 'flex';
    
    // Add event listener to close button
    const closeButton = messageContainer.querySelector('.message-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            messageContainer.style.display = 'none';
        });
    }
    
    // Auto-hide message after 5 seconds
    setTimeout(function() {
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }, 5000);
}

/**
 * Show error message if form submission fails
 */
function showErrorMessage(message) {
    // Check if message container already exists
    let messageContainer = document.querySelector('.form-message');
    
    if (!messageContainer) {
        // Create message container if it doesn't exist
        messageContainer = document.createElement('div');
        messageContainer.className = 'form-message';
        document.body.appendChild(messageContainer);
    }
    
    // Update message container with error message
    messageContainer.innerHTML = `
        <div class="message-content error">
            <span class="message-icon">!</span>
            <p>${message}</p>
            <button class="message-close">×</button>
        </div>
    `;
    messageContainer.style.display = 'flex';
    
    // Add event listener to close button
    const closeButton = messageContainer.querySelector('.message-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            messageContainer.style.display = 'none';
        });
    }
    
    // Auto-hide message after 5 seconds
    setTimeout(function() {
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }, 5000);
}

/**
 * Check if agent is logged in and show appropriate interface
 */
function checkAgentLogin() {
    if (AgentAuth.isLoggedIn()) {
        showMainForm();
    } else {
        showAgentLogin();
    }
}

/**
 * Initialize agent login functionality
 */
function initializeAgentLogin() {
    const agentLoginForm = document.getElementById('agentLoginForm');
    const agentLogoutBtn = document.getElementById('agentLogout');
    
    if (agentLoginForm) {
        agentLoginForm.addEventListener('submit', handleAgentLogin);
    }
    
    if (agentLogoutBtn) {
        agentLogoutBtn.addEventListener('click', handleAgentLogout);
    }
}

/**
 * Handle agent login form submission
 */
async function handleAgentLogin(e) {
    e.preventDefault();
    
    const agentId = document.getElementById('agentId').value.trim().toUpperCase();
    const password = document.getElementById('agentPassword').value;
    const errorDiv = document.getElementById('agentLoginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Show loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Authenticate agent with API
        const authResult = await AgentAuth.login(agentId, password);
        
        if (authResult.success) {
            showMainForm();
        } else {
            errorDiv.textContent = authResult.message;
            errorDiv.style.display = 'block';
            
            // Clear error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        // Restore button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

/**
 * Handle agent logout
 */
function handleAgentLogout() {
    if (confirm('Are you sure you want to logout? Any unsaved form data will be lost.')) {
        AgentAuth.logout();
        showAgentLogin();
    }
}

/**
 * Show agent login interface
 */
function showAgentLogin() {
    const agentLogin = document.getElementById('agentLogin');
    const mainFormContainer = document.getElementById('mainFormContainer');
    
    if (agentLogin) agentLogin.style.display = 'block';
    if (mainFormContainer) mainFormContainer.style.display = 'none';
}

/**
 * Show main form interface
 */
function showMainForm() {
    const agentLogin = document.getElementById('agentLogin');
    const mainFormContainer = document.getElementById('mainFormContainer');
    
    if (agentLogin) agentLogin.style.display = 'none';
    if (mainFormContainer) mainFormContainer.style.display = 'block';
    
    // Update agent status bar
    updateAgentStatusBar();
}

/**
 * Update agent status bar with current agent info
 */
function updateAgentStatusBar() {
    const agentNameEl = document.getElementById('agentName');
    const agentBranchEl = document.getElementById('agentBranch');
    
    if (agentNameEl) agentNameEl.textContent = AgentAuth.getAgentDisplayName();
    if (agentBranchEl) agentBranchEl.textContent = AgentAuth.getAgentBranch();
}
