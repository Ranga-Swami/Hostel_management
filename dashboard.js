function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Check authentication status
window.onload = function() {
    if(!localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
    }
}