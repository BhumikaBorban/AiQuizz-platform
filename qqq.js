// qqq.js

// ⚠️ No need to import the SDK or include the API key here anymore!
// The frontend only talks to your secure backend.
const BACKEND_URL = "http://localhost:3000/generate-quiz"; // <-- Your Node.js server address

const quizBox = document.getElementById("quiz-box");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer;
let timeLeft = 10; 

// --- Core Function: Fetch Quiz from Node.js Backend ---
async function fetchQuiz(topic) {
  const topicDisplayName = topic.replace(/-/g, ' ').toUpperCase();
  
  try {
    quizBox.innerHTML = `<h2>Loading Quiz on ${topicDisplayName}... Please Wait.</h2><p>Requesting data from secure server...</p>`;
    nextBtn.style.display = "none";

    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Send the topic name to the backend
        body: JSON.stringify({ topic: topicDisplayName }), 
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // The backend sends back the clean JSON quiz array
    const quizData = await response.json(); 
    return quizData; 

  } catch (error) {
    console.error("Error fetching quiz from backend:", error);
    quizBox.innerHTML = `<h2>🛑 Error Loading Quiz!</h2><p>Could not connect to the backend server or generate quiz.</p>`;
    return []; // Return empty array on failure
  }
}

// Load Quiz based on URL param
async function loadQuizFromURL() {
  const params = new URLSearchParams(window.location.search);
  const quizName = params.get("quiz"); // e.g., 'quantitative-aptitude'
  
  if (!quizName) {
    quizBox.innerHTML = "<h2>Please select a quiz topic from the previous page.</h2>";
    nextBtn.style.display = "none";
    return;
  }
  
  // Fetch the quiz using the secure function
  currentQuiz = await fetchQuiz(quizName);
  
  if (currentQuiz.length > 0) {
      document.querySelector('.quiz-container h1').textContent = `${quizName.replace(/-/g, ' ').toUpperCase()} Quiz`;
      currentIndex = 0;
      showQuestion();
      nextBtn.style.display = "block";
  }
}

// -----------------------------------------------------------
// REMAINING FUNCTIONS (showQuestion, startTimer, nextQuestion, showResult) 
// are the same as the previous response and require no changes
// as they rely on the 'currentQuiz' array structure.
// -----------------------------------------------------------

function showQuestion() {
  if (currentIndex >= currentQuiz.length) {
    showResult();
    return;
  }

  clearInterval(timer);
  timeLeft = 10; // Reset time for next question
  nextBtn.disabled = true;
  nextBtn.textContent = "Time to Choose...";
  nextBtn.style.background = "#aaa";

  const q = currentQuiz[currentIndex];
  quizBox.innerHTML = `
    <div class="quiz-card">
      <h2>Q${currentIndex + 1}: ${q.q}</h2>
      <div class="options">
        ${q.options.map(opt => 
          `<button class="option-btn" data-value="${opt}">${opt}</button>`
        ).join("")}
      </div>
      <p id="timer" class="timer">Time Left: ${timeLeft}s</p>
    </div>
  `;

  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (!selectedAnswer) {
        // Clear previous selection highlight
        document.querySelectorAll(".option-btn").forEach(b => b.style.background = "#f0f0f0");
        
        selectedAnswer = e.target.getAttribute('data-value');
        e.target.style.background = "#2196F3"; // Highlight selection
        nextBtn.disabled = false;
        nextBtn.textContent = "Submit Answer";
        nextBtn.style.background = "#4CAF50";
        clearInterval(timer); // Stop timer once selected
      }
    });
  });

  startTimer();
}

function startTimer() {
  let timerEl = document.getElementById("timer");
  if (!timerEl) return;

  timerEl.style.color = "#333";
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 3) {
      timerEl.style.color = "#e74c3c"; // Red warning
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion(); // Time's up, move to next question
    }
  }, 1000);
}

function nextQuestion() {
  clearInterval(timer);
  const correctAnswer = currentQuiz[currentIndex].answer;
  
  // Check score (Handles both user selection and timer expiry)
  if (selectedAnswer && selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
    score++;
  } else if (selectedAnswer) {
    // Optional: Highlight correct answer after submission
    document.querySelectorAll(".option-btn").forEach(btn => {
        if (btn.getAttribute('data-value').trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
            btn.style.border = "3px solid #4CAF50"; 
        }
    });
  }
  
  currentIndex++;
  selectedAnswer = null;

  // Add a small delay for user to register the submission/time-out
  setTimeout(showQuestion, 1000); 
}

function showResult() {
  quizBox.innerHTML = "";
  nextBtn.style.display = "none";
  resultBox.innerHTML = `
    <h2>Quiz Finished!</h2>
    <p>Your Score: ${score} / ${currentQuiz.length}</p>
    <a href="quiz.html"><button>Back to Sections</button></a>
  `;
}

// Event Listener
nextBtn.addEventListener("click", nextQuestion);

// Init
window.onload = loadQuizFromURL;