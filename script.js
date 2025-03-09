function initializeRoomBooking() {
    const data = getHostelData();
    const steps = [
        {
            title: 'Select Block',
            type: 'block',
            options: data.rooms.map(room => ({
                text: `Block ${room.block} (${room.available} available)`,
                value: room.block
            }))
        },
        {
            title: 'Bed Type',
            type: 'bed',
            options: ['2 Bed', '3 Bed', '4 Bed']
        },
        {
            title: 'Meal Preference',
            type: 'meal',
            options: ['Veg', 'Non-Veg']
        }
    ];

    const stepsHTML = steps.map((step, index) => `
        <div class="step" id="step${index + 1}" style="display: ${index === 0 ? 'block' : 'none'}">
            <h3>${step.title}</h3>
            <div class="options-container">
                ${step.options.map(option => `
                    <button class="option-btn" 
                            onclick="handleBookingSelection(${index}, ${typeof option === 'object' ? option.value : `'${option}'`})">
                        ${typeof option === 'object' ? option.text : option}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('bookingSteps').innerHTML = stepsHTML;
}

function handleBookingSelection(stepIndex, selection) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const data = getHostelData();
    
    // Store selection in sessionStorage
    sessionStorage.setItem(`step${stepIndex + 1}`, selection);

    // Update available rooms if selecting block
    if(stepIndex === 0) {
        const selectedBlock = selection;
        const blockIndex = data.rooms.findIndex(r => r.block === selectedBlock);
        if(blockIndex !== -1 && data.rooms[blockIndex].available > 0) {
            data.rooms[blockIndex].available -= 1;
            updateHostelData(data);
        }
    }

    // Show next step or complete booking
    if(stepIndex < 2) {
        // Show next step
        document.querySelectorAll('.step').forEach((step, index) => {
            step.style.display = index === stepIndex + 1 ? 'block' : 'none';
        });
    } else {
        // Complete booking
        const bookingData = {
            student: currentUser.email,
            block: sessionStorage.getItem('step1'),
            bedType: sessionStorage.getItem('step2'),
            mealType: selection,
            date: new Date().toISOString()
        };

        const blockIndex = data.rooms.findIndex(r => r.block === bookingData.block);
        data.rooms[blockIndex].bookings.push(bookingData);
        updateHostelData(data);

        // Show confirmation
        document.getElementById('bookingSummary').innerHTML = `
            <div class="success">
                <h3>Booking Confirmed!</h3>
                <p>Block ${bookingData.block}</p>
                <p>${bookingData.bedType} • ${bookingData.mealType}</p>
                <p>Booking ID: ${Date.now()}</p>
            </div>
        `;
        
        // Clear session storage
        sessionStorage.clear();
    }
}
// Complaint System
function showRaiseComplaint() {
    document.getElementById('complaintSection').innerHTML = `
        <div class="complaint-form">
            <select id="complaintType">
                <option value="electric">Electrical</option>
                <option value="water">Water</option>
                <option value="carpenter">Carpentry</option>
            </select>
            <textarea id="complaintDesc" placeholder="Describe your issue..."></textarea>
            <button onclick="submitComplaint()">Submit</button>
        </div>
    `;
}

function submitComplaint() {
    const data = getHostelData();
    const complaint = {
        id: Date.now(),
        type: document.getElementById('complaintType').value,
        description: document.getElementById('complaintDesc').value,
        student: JSON.parse(localStorage.getItem('currentUser')).email,
        date: new Date().toISOString(),
        status: 'Pending',
        resolutionDate: null
    };
    
    data.complaints.push(complaint);
    updateHostelData(data);
    showTrackComplaint();
}

function showTrackComplaint() {
    const data = getHostelData();
    const currentUser = JSON.parse(localStorage.getItem('currentUser')).email;
    const userComplaints = data.complaints.filter(c => c.student === currentUser);
    
    document.getElementById('complaintSection').innerHTML = `
        <div class="complaint-list">
            ${userComplaints.map(c => `
                <div class="complaint-card">
                    <h4>${c.type.toUpperCase()} (#${c.id})</h4>
                    <p>${c.description}</p>
                    <small>Submitted: ${new Date(c.date).toLocaleString()}</small>
                    <p>Status: ${c.status} ${c.resolutionDate ? 
                        `• Resolution Date: ${new Date(c.resolutionDate).toLocaleDateString()}` : ''}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Maintenance System
function submitMaintenance(type) {
    const data = getHostelData();
    data.maintenance.push({
        type,
        date: new Date().toISOString(),
        student: JSON.parse(localStorage.getItem('currentUser')).email,
        status: 'Requested'
    });
    updateHostelData(data);
    document.getElementById('maintenanceStatus').innerHTML = `
        <p class="success">${type.replace(/^\w/, c => c.toUpperCase())} request submitted!</p>
    `;
}

// Admin System
document.getElementById('adminLoginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = getHostelData();
    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('adminPassword').value;
    
    if(adminId === data.admin.username && password === data.admin.password) {
        data.admin.loggedIn = true;
        updateHostelData(data);
        loadAdminDashboard();
    } else {
        alert('Invalid admin credentials!');
    }
});

function loadAdminDashboard() {
    const data = getHostelData();
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    document.getElementById('adminDashboard').innerHTML = `
        <h3>Student Bookings</h3>
        <div class="bookings-list">
            ${data.rooms.flatMap(room => 
                room.bookings.map(booking => `
                    <div class="booking-card">
                        <p>Block ${room.block} • ${booking.bedType} • ${booking.mealType}</p>
                        <small>Student: ${booking.student}</small>
                    </div>
                `)
            ).join('')}
        </div>
        
        <h3>Complaints</h3>
        <div class="complaints-list">
            ${data.complaints.map(c => `
                <div class="complaint-card">
                    <h4>${c.type.toUpperCase()} (#${c.id})</h4>
                    <p>${c.description}</p>
                    <select onchange="updateComplaintStatus(${c.id}, this.value)">
                        <option ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <input type="date" onchange="setResolutionDate(${c.id}, this.value)">
                </div>
            `).join('')}
        </div>
    `;
}

function updateComplaintStatus(id, status) {
    const data = getHostelData();
    const complaint = data.complaints.find(c => c.id === id);
    if(complaint) complaint.status = status;
    updateHostelData(data);
}

function setResolutionDate(id, date) {
    const data = getHostelData();
    const complaint = data.complaints.find(c => c.id === id);
    if(complaint) complaint.resolutionDate = date;
    updateHostelData(data);
}
// Add these functions
function toggleProfileMenu() {
    const menu = document.getElementById('profileMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function showMyProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const data = getHostelData();
    const userBookings = data.rooms.flatMap(room => 
        room.bookings.filter(b => b.student === currentUser.email)
    );

    const profileHTML = `
        <div class="profile-section">
            <h3>Personal Details</h3>
            <p>Name: ${currentUser.name}</p>
            <p>Email: ${currentUser.email}</p>
        </div>
        <div class="booking-history">
            <h3>Booking History</h3>
            ${userBookings.map(booking => `
                <div class="booking-card">
                    <p>Block ${booking.block} • ${booking.bedType} • ${booking.mealType}</p>
                    <small>Booked on: ${new Date(booking.date).toLocaleDateString()}</small>
                </div>
            `).join('')}
        </div>
    `;

    // For profile.html
    if(document.getElementById('profileDetails')) {
        document.getElementById('profileDetails').innerHTML = profileHTML;
    }
    // For modal (if using modal approach)
    else {
        showModal('My Profile', profileHTML);
    }
}

function showModal(title, content) {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal">
                <h2>${title}</h2>
                ${content}
                <button onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeModal() {
    document.querySelector('.modal-overlay').remove();
}
function handleBookingSelection(stepIndex, selection) {
    // ... existing code until step 2 ...

    if(stepIndex === 2) {
        showBookingConfirmation();
    }
}

function showBookingConfirmation() {
    const bookingData = {
        block: sessionStorage.getItem('step1'),
        bedType: sessionStorage.getItem('step2'),
        mealType: sessionStorage.getItem('step3')
    };

    document.getElementById('bookingSteps').innerHTML = `
        <div class="confirmation-summary">
            <h3>Confirm Your Booking</h3>
            <p>Block: ${bookingData.block}</p>
            <p>Bed Type: ${bookingData.bedType}</p>
            <p>Meal Preference: ${bookingData.mealType}</p>
            <button class="confirm-button" onclick="confirmBooking()">Confirm Booking</button>
        </div>
    `;
}

function confirmBooking() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const data = getHostelData();
    
    const bookingData = {
        student: currentUser.email,
        block: sessionStorage.getItem('step1'),
        bedType: sessionStorage.getItem('step2'),
        mealType: sessionStorage.getItem('step3'),
        date: new Date().toISOString()
    };

    const blockIndex = data.rooms.findIndex(r => r.block == bookingData.block);
    data.rooms[blockIndex].bookings.push(bookingData);
    updateHostelData(data);

    document.getElementById('bookingSummary').innerHTML = `
        <div class="success">
            <h3>Booking Confirmed!</h3>
            <p>Your booking details have been saved.</p>
        </div>
    `;
    
    sessionStorage.clear();
}
let currentStep = 0;
const steps = [
    {
        title: 'Select Block',
        type: 'block',
        options: [1, 2, 3, 4, 5, 6, 7]
    },
    {
        title: 'Select Bed Type',
        type: 'bed',
        options: ['2 Bed', '3 Bed', '4 Bed']
    },
    {
        title: 'Meal Preference',
        type: 'meal',
        options: ['Veg', 'Non-Veg']
    }
];

function initializeRoomBooking() {
    renderStep(currentStep);
}

function renderStep(stepIndex) {
    const step = steps[stepIndex];
    const bookingSteps = document.getElementById('bookingSteps');
    
    bookingSteps.innerHTML = `
        <div class="step">
            <h3>${step.title}</h3>
            <div class="options-container">
                ${step.options.map(option => `
                    <button class="option-btn" 
                            onclick="handleSelection(${stepIndex}, ${typeof option === 'number' ? option : `'${option}'`})">
                        ${option} ${step.type === 'block' ? 'Block' : ''}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function handleSelection(stepIndex, selection) {
    sessionStorage.setItem(`step${stepIndex}`, selection);
    
    if(stepIndex < steps.length - 1) {
        currentStep = stepIndex + 1;
        renderStep(currentStep);
    } else {
        showConfirmation();
    }
}

function showConfirmation() {
    const bookingData = {
        block: sessionStorage.getItem('step0'),
        bedType: sessionStorage.getItem('step1'),
        mealType: sessionStorage.getItem('step2')
    };

    document.getElementById('bookingSteps').innerHTML = `
        <div class="confirmation-summary">
            <h3>Confirm Your Booking</h3>
            <p>Block: ${bookingData.block}</p>
            <p>Bed Type: ${bookingData.bedType}</p>
            <p>Meal Preference: ${bookingData.mealType}</p>
            <button class="confirm-button" onclick="saveBooking()">Confirm Booking</button>
        </div>
    `;
}

function saveBooking() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const data = getHostelData();
    
    const booking = {
        student: currentUser.email,
        block: sessionStorage.getItem('step0'),
        bedType: sessionStorage.getItem('step1'),
        mealType: sessionStorage.getItem('step2'),
        date: new Date().toISOString()
    };

    const blockIndex = data.rooms.findIndex(r => r.block == booking.block);
    data.rooms[blockIndex].bookings.push(booking);
    updateHostelData(data);
    
    sessionStorage.clear();
    window.location.href = 'dashboard.html';
}

// Global logout function
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    window.location.href = 'index.html';
}