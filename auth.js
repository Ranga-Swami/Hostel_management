// Handle user registration
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const newUser = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value
    };

    if(users.some(user => user.email === newUser.email)) {
        alert('User already exists!');
        return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful!');
    window.location.href = 'index.html';
});

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials!');
    }
});