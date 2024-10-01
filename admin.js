// Initialize or retrieve existing data from localStorage
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || {};
let playerScore = parseInt(localStorage.getItem('playerScore')) || 500; // Initialize score to 500

// Display categories in the UI
function displayCategories() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';

    categories.forEach((category, index) => {
        const categoryElement = document.createElement('div');
        categoryElement.innerHTML = `${category} 
            <button onclick="editCategory(${index})" class="action-button">Edit</button>
            <button onclick="deleteCategory(${index})" class="action-button">Delete</button>`;
        categoriesList.appendChild(categoryElement);
    });

    // Update category select options for adding questions
    const categorySelect = document.getElementById('category-select');
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category; // Display category name
        categorySelect.appendChild(option);
    });
}

// Add a new category
function addCategory() {
    const categoryName = document.getElementById('category').value.trim();
    
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        questions[categoryName] = [];
        document.getElementById('category').value = '';
        saveData();
        displayCategories();
    } else {
        alert('Category already exists or invalid input.');
    }
}

// Edit a category
function editCategory(index) {
    const newName = prompt('Enter new category name:', categories[index]);
    
    if (newName && !categories.includes(newName)) {
        const oldName = categories[index];
        categories[index] = newName;
        questions[newName] = questions[oldName];
        delete questions[oldName];
        saveData();
        displayCategories();
        displayQuestions(); // Update questions list after editing category
    } else {
        alert('Invalid category name or name already exists.');
    }
}

// Delete a category
function deleteCategory(index) {
    if (confirm(`Are you sure you want to delete the category "${categories[index]}"?`)) {
        const categoryName = categories[index];
        categories.splice(index, 1);
        delete questions[categoryName];
        saveData();
        displayCategories();
        displayQuestions(); // Update questions list after deleting category
    }
}

// Add a new question to the selected category
function addQuestion() {
    const category = document.getElementById('category-select').value;
    const questionText = document.getElementById('question').value.trim();
    const answerText = document.getElementById('answer').value.trim();
    const questionScore = parseInt(document.getElementById('score').value.trim());
    
    if (category && questionText && answerText && !isNaN(questionScore)) {
        questions[category].push({ question: questionText, answer: answerText, score: questionScore });
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
        document.getElementById('score').value = '';
        saveData();
        displayQuestions();
    } else {
        alert('Please fill in all fields correctly.');
    }
}

// Display questions for all categories
function displayQuestions() {
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';

    for (const [category, qs] of Object.entries(questions)) {
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category; // Display category name
        questionsList.appendChild(categoryHeader);
        
        qs.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.innerHTML = `${q.question} - ${q.answer} (Score: ${q.score}) 
                <button onclick="editQuestion('${category}', ${index})" class="action-button">Edit</button>
                <button onclick="deleteQuestion('${category}', ${index})" class="action-button">Delete</button>`;
            questionsList.appendChild(questionElement);
        });
    }
}

// Edit a question
function editQuestion(category, index) {
    const question = questions[category][index];
    const newQuestionText = prompt('Enter new question:', question.question);
    const newAnswerText = prompt('Enter new answer:', question.answer);
    const newScore = parseInt(prompt('Enter new score:', question.score));

    if (newQuestionText && newAnswerText && !isNaN(newScore)) {
        questions[category][index] = { question: newQuestionText, answer: newAnswerText, score: newScore };
        saveData();
        displayQuestions();
    } else {
        alert('Invalid input.');
    }
}

// Delete a question
function deleteQuestion(category, index) {
    if (confirm(`Are you sure you want to delete the question "${questions[category][index].question}"?`)) {
        questions[category].splice(index, 1);
        saveData();
        displayQuestions();
    }
}

// Modify the player's score
function modifyScore() {
    const scoreChange = parseInt(document.getElementById('score-modification').value.trim());
    
    if (!isNaN(scoreChange)) {
        playerScore += scoreChange;
        document.getElementById('score-modification').value = '';
        saveData();
        updateScoreDisplay();
    } else {
        alert('Invalid score change value.');
    }
}

// Reset the player's score to initial value
function resetScore() {
    playerScore = 500; // Reset score to 500
    saveData();
    updateScoreDisplay();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('playerScore', playerScore);
}

// Update the displayed score
function updateScoreDisplay() {
    document.getElementById('current-score').textContent = `Current Score: ${playerScore}`;
}

// Logout function
function logout() {
    window.location.href = 'index.html';
}

// Initialize the admin dashboard
displayCategories();
displayQuestions();
updateScoreDisplay(); // Initialize score display
