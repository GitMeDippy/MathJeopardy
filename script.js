// IndexedDB Setup
let db;
let request = indexedDB.open('jeopardyDB', 1);

request.onupgradeneeded = function(e) {
    let db = e.target.result;

    // Create user store
    let userStore = db.createObjectStore('users', { keyPath: 'username' });
    userStore.createIndex('password', 'password', { unique: false });

    // Create categories store
    let categoryStore = db.createObjectStore('categories', { keyPath: 'name' });

    // Create questions store
    let questionStore = db.createObjectStore('questions', { keyPath: 'id', autoIncrement: true });
    questionStore.createIndex('category', 'category', { unique: false });

    // Create scores store
    let scoreStore = db.createObjectStore('scores', { keyPath: 'username' });
};

request.onsuccess = function(e) {
    db = e.target.result;
    initDefaultAdmin();
};

function initDefaultAdmin() {
    let transaction = db.transaction(['users'], 'readwrite');
    let store = transaction.objectStore('users');

    store.get('admin').onsuccess = function(event) {
        if (!event.target.result) {
            store.add({ username: 'admin', password: 'admin', role: 'admin' });
        }
    };
}

// Login Functionality
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    let transaction = db.transaction(['users'], 'readonly');
    let store = transaction.objectStore('users');

    store.get(username).onsuccess = function(event) {
        let user = event.target.result;
        if (user && user.password === password) {
            if (user.role === 'admin') {
                showAdminPage();
            } else {
                showPlayerPage(username);
            }
        } else {
            document.getElementById('login-error').textContent = 'Invalid username or password';
        }
    };
}

function showAdminPage() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('admin-page').classList.remove('hidden');
}

function showPlayerPage(username) {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('player-page').classList.remove('hidden');
    document.getElementById('player-name').textContent = username;

    loadPlayerScore(username);
    loadCategories();
}

function logout() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('admin-page').classList.add('hidden');
    document.getElementById('player-page').classList.add('hidden');
}

function addPlayer() {
    let username = document.getElementById('new-username').value;
    let password = document.getElementById('new-password').value;

    if (username === '' || password === '') {
        alert('Please enter both username and password');
        return;
    }

    let transaction = db.transaction(['users'], 'readwrite');
    let store = transaction.objectStore('users');

    store.add({ username, password, role: 'player' }).onsuccess = function() {
        alert('Player added!');
        displayNewPlayer(username, password);  // Display the new player on the admin page
    };

    // Clear input fields after adding the player
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
}

// Function to display newly added player with Edit and Delete buttons
function displayNewPlayer(username, password) {
    let playerListDisplay = document.getElementById('player-list-display');

    // Create a new div to display the player info with Edit and Delete buttons
    let playerInfo = document.createElement('div');
    playerInfo.innerHTML = `
        Username: ${username}, Password: ${password} 
        <button onclick="editPlayer('${username}')">Edit</button>
        <button onclick="deletePlayer('${username}')">Delete</button>
    `;
    playerListDisplay.appendChild(playerInfo);

    // Refresh the player list with scores
    loadPlayerScores();
}

// Function to load all players with Edit/Delete buttons
function loadPlayers() {
    let playerListDisplay = document.getElementById('player-list-display');
    playerListDisplay.innerHTML = ''; // Clear the display area

    let transaction = db.transaction(['users'], 'readonly');
    let userStore = transaction.objectStore('users');

    // Open a cursor to iterate over the users
    userStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let { username, password } = cursor.value;

            // Create a div to display the player's username, password, and options to edit/delete
            let playerInfo = document.createElement('div');
            playerInfo.innerHTML = `
                Username: ${username}, Password: ${password}
                <button onclick="editPlayer('${username}')">Edit</button>
                <button onclick="deletePlayer('${username}')">Delete</button>
            `;
            playerListDisplay.appendChild(playerInfo);

            cursor.continue();
        }
    };
}

// Function to edit a player's username and password
function editPlayer(username) {
    let newUsername = prompt("Enter new username:", username);
    let newPassword = prompt("Enter new password:");

    if (newUsername && newPassword) {
        let transaction = db.transaction(['users'], 'readwrite');
        let store = transaction.objectStore('users');

        // Get the player data, update it, and save back to IndexedDB
        store.get(username).onsuccess = function(event) {
            let playerData = event.target.result;
            playerData.username = newUsername;
            playerData.password = newPassword;

            // Delete the old entry and add the updated entry
            store.delete(username).onsuccess = function() {
                store.add(playerData).onsuccess = function() {
                    alert('Player details updated!');
                    loadPlayers();  // Refresh the player list
                    loadPlayerScores();  // Refresh the player scores
                };
            };
        };
    }
}

// Function to delete a player
function deletePlayer(username) {
    if (confirm(`Are you sure you want to delete player "${username}"?`)) {
        let transaction = db.transaction(['users', 'scores'], 'readwrite');
        let userStore = transaction.objectStore('users');
        let scoreStore = transaction.objectStore('scores');

        // Delete the player from both the users and scores stores
        userStore.delete(username).onsuccess = function() {
            scoreStore.delete(username).onsuccess = function() {
                alert('Player deleted!');
                loadPlayers();  // Refresh the player list
                loadPlayerScores();  // Refresh the player scores
            };
        };
    }
}

// Call this function to load players when the admin page loads
window.onload = function() {
    loadPlayers();  // Load players with Edit/Delete buttons
    loadPlayerScores();  // Load player scores
};

// end //

function addCategory() {
    let category = document.getElementById('new-category').value;

    let transaction = db.transaction(['categories'], 'readwrite');
    let store = transaction.objectStore('categories');
    store.add({ name: category });

    alert('Category added!');
    loadCategories();
}

function addQuestion() {
    let category = document.getElementById('category-list').value;
    let text = document.getElementById('question-text').value;
    let answer = document.getElementById('question-answer').value;

    let transaction = db.transaction(['questions'], 'readwrite');
    let store = transaction.objectStore('questions');
    store.add({ category, text, answer });

    alert('Question added!');
}

function updateScore() {
    let username = document.getElementById('player-list').value;
    let score = document.getElementById('player-score').value;

    let transaction = db.transaction(['scores'], 'readwrite');
    let store = transaction.objectStore('scores');
    store.put({ username, score });

    alert('Score updated!');
}

function loadCategories() {
    let transaction = db.transaction(['categories'], 'readonly');
    let store = transaction.objectStore('categories');
    let categories = [];

    store.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            categories.push(cursor.value.name);
            cursor.continue();
        } else {
            populateCategorySelect(categories);
        }
    };
}

function populateCategorySelect(categories) {
    let categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach(category => {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryList.appendChild(option);
    });
}

function loadPlayerScore(username) {
    let transaction = db.transaction(['scores'], 'readonly');
    let store = transaction.objectStore('scores');
    store.get(username).onsuccess = function(event) {
        let score = event.target.result ? event.target.result.score : 0;
        document.getElementById('player-score-display').textContent = score;
    };
}
