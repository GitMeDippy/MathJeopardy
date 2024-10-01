const users = {
    admin: { username: 'admin', password: 'adminpass' },
    player1: { username: 'player1', password: 'playerpass' },
    // Add more users as needed
};

function login() {
    const role = document.getElementById('role').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    if (users[username] && users[username].password === password) {
        if (role === 'admin' && username === 'admin') {
            window.location.href = 'admin.html';
        } else if (role === 'player' && username !== 'admin') {
            window.location.href = 'player.html';
        } else {
            errorMessage.textContent = 'Invalid role or username.';
        }
    } else {
        errorMessage.textContent = 'Invalid username or password.';
    }
}
