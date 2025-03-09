document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();
    
    document.getElementById('complaintForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = this.elements[0].value;
        const details = this.elements[1].value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        const newComplaint = {
            id: Date.now(),
            title,
            details,
            status: 'Open',
            date: new Date().toISOString(),
            user: currentUser.email
        };

        const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
        complaints.push(newComplaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        
        this.reset();
        loadComplaints();
    });
});

function loadComplaints() {
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    const complaintsList = document.getElementById('complaintsList');
    
    complaintsList.innerHTML = complaints.map(complaint => `
        <div class="complaint-card">
            <h4>${complaint.title} (${complaint.status})</h4>
            <p>${complaint.details}</p>
            <small>Submitted on: ${new Date(complaint.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}