// Load data from localStorage
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || {};
let playerScore = parseInt(localStorage.getItem('playerScore')) || 500; // Initialize score to 500

// Update the displayed score
function updateScore() {
    document.getElementById('score-display').textContent = `Score: ${playerScore}`;
}

// Display categories in the select dropdown
function displayCategories() {
    const categorySelect = document.getElementById('category-select');
    categorySelect.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Display questions for the selected category
function displayQuestions() {
    const category = document.getElementById('category-select').value;
    const questionSelect = document.getElementById('question-select');
    const questionDisplay = document.getElementById('question-display');

    questionSelect.innerHTML = '';
    questionDisplay.innerHTML = '';

    if (category && questions[category]) {
        questions[category].forEach((q, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Question ${index + 1}`;
            questionSelect.appendChild(option);
        });
    }
}

// Show the selected question
function showSelectedQuestion() {
    const category = document.getElementById('category-select').value;
    const questionIndex = document.getElementById('question-select').value;
    const questionDisplay = document.getElementById('question-display');

    if (category && questions[category] && questionIndex !== '') {
        const question = questions[category][questionIndex];
        questionDisplay.innerHTML = `
            <p>${question.question}</p>
            <input type="text" id="answer" class="input-field" placeholder="Your answer">
            <button onclick="submitAnswer(${questionIndex})" class="action-button">Submit Answer</button>
        `;
    }
}

// Handle submitting an answer
function submitAnswer(questionIndex) {
    const category = document.getElementById('category-select').value;
    const userAnswer = document.getElementById('answer').value.trim();
    const question = questions[category][questionIndex];

    if (userAnswer === question.answer) {
        playerScore += question.score; // Add score for correct answer
        alert('Correct answer!');
    } else {
        playerScore -= question.score; // Deduct score for wrong answer
        alert('Wrong answer!');
    }

    saveData();
    updateScore();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('playerScore', playerScore);
}

// Logout function
function logout() {
    window.location.href = 'index.html';
}

// Initialize the player page
function init() {
    displayCategories();
    updateScore();
}

// Initialize the player page
init();
