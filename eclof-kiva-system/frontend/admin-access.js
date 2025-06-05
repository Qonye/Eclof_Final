document.addEventListener('DOMContentLoaded', function() {
    const adminLink = document.getElementById('adminLink');
    
    if (adminLink) {
        adminLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAdminConfirmation();
        });
    }
    
    function showAdminConfirmation() {
        // Create a modal dialog for confirmation
        const dialog = document.createElement('div');
        dialog.className = 'admin-dialog';
        dialog.innerHTML = `
            <div class="admin-dialog-content">
                <h3>Staff Access</h3>
                <p>You are about to access the staff portal area. This area is restricted to authorized personnel only.</p>
                <div class="admin-documentation-links">
                    <p>Staff Resources:</p>
                    <a href="ECLOF_Kenya_System_Overview.html" target="_blank" class="doc-link">System Overview</a>
                    <a href="ECLOF_Kenya_User_Guide.html" target="_blank" class="doc-link">User Guide</a>
                </div>
                <div class="admin-dialog-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn">Continue to Staff Portal</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Display the dialog with a slight animation
        setTimeout(() => {
            dialog.style.display = 'flex';
        }, 10);
        
        // Handle dialog buttons
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const confirmBtn = dialog.querySelector('.confirm-btn');
        
        cancelBtn.addEventListener('click', function() {
            closeDialog(dialog);
        });
        
        confirmBtn.addEventListener('click', function() {
            // Navigate to admin page
            window.location.href = 'admin.html';
        });
        
        // Close if clicked outside
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                closeDialog(dialog);
            }
        });
    }
    
    function closeDialog(dialog) {
        dialog.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(dialog);
        }, 300);
    }
});
