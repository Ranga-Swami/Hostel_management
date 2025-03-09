// Initialize storage if not exists
if(!localStorage.getItem('rooms')) {
    localStorage.setItem('rooms', JSON.stringify([
        { id: 101, status: 'available' },
        { id: 102, status: 'occupied' },
        // Add more rooms
    ]));
}

if(!localStorage.getItem('requests')) {
    localStorage.setItem('requests', JSON.stringify([]));
}

if(!localStorage.getItem('complaints')) {
    localStorage.setItem('complaints', JSON.stringify([]));
}