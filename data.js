// Initialize all data structures
if(!localStorage.getItem('hostelData')) {
    const initialData = {
        rooms: Array.from({length: 7}, (_, i) => ({
            block: i+1,
            available: 230,
            bookings: []
        })),
        complaints: [],
        maintenance: [],
        admin: {
            username: 'admin',
            password: 'admin123',
            loggedIn: false
        },
        students: JSON.parse(localStorage.getItem('users')) || []
    };
    localStorage.setItem('hostelData', JSON.stringify(initialData));
}

function getHostelData() {
    return JSON.parse(localStorage.getItem('hostelData'));
}

function updateHostelData(newData) {
    localStorage.setItem('hostelData', JSON.stringify(newData));
}