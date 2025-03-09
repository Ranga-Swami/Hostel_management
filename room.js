document.addEventListener('DOMContentLoaded', () => {
    loadRequests();
    
    document.getElementById('maintenanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = this.elements[0].value;
        const description = this.elements[1].value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        const newRequest = {
            id: Date.now(),
            title,
            description,
            status: 'Pending',
            date: new Date().toISOString(),
            user: currentUser.email
        };

        const requests = JSON.parse(localStorage.getItem('requests')) || [];
        requests.push(newRequest);
        localStorage.setItem('requests', JSON.stringify(requests));
        
        this.reset();
        loadRequests();
    });
});

function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const requestsList = document.getElementById('requestsList');
    
    requestsList.innerHTML = requests.map(request => `
        <div class="request-card">
            <h4>${request.title} (${request.status})</h4>
            <p>${request.description}</p>
            <small>Submitted on: ${new Date(request.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}