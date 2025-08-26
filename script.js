let num1, num2, operator;
let currentQuestion = 0;
let score = 0;
let incorrectAnswers = [];
let questions = [];

function generateQuestion() {
  if (currentQuestion >= 10) {
    showResults();
    return;
  }

  num1 = Math.floor(Math.random() * 19) - 9; // -9 to 9
  num2 = Math.floor(Math.random() * 19) - 9;
  operator = '×';

  let questionText = `Q${currentQuestion + 1}: What is ${num1} ${operator} ${num2}?`;
  let correctAnswer = num1 * num2;

  questions[currentQuestion] = {
    question: questionText,
    answer: correctAnswer
  };

  document.getElementById("question").innerText = questionText;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answerInput").value = "";
}

async function generateHash(data) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

document.getElementById("answerInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    submitAnswer(); // Calls your existing function
  }
});

function submitAnswer() {
  const input = document.getElementById("answerInput").value;
  if (!input.trim()) return; // Prevent empty input

  const userAnswer = parseInt(input);
  const current = questions[currentQuestion];
  const correctAnswer = current.answer;

  if (userAnswer === correctAnswer) {
    score++;
    document.getElementById("feedback").innerText = "✅ Correct!";
  } else {
    document.getElementById("feedback").innerText = `❌ The correct answer is ${correctAnswer}.`;
    incorrectAnswers.push({
      question: current.question,
      yourAnswer: userAnswer,
      correctAnswer: correctAnswer
    });
  }

  currentQuestion++;

  if (currentQuestion < 10) {
    setTimeout(generateQuestion, 1500);
  } else {
    setTimeout(showResults, 1500);
  }
}

function showResults() {
  const quizArea = document.getElementById("quizArea");
  const results = document.getElementById("results");

  if (!quizArea || !results) {
    console.error("Missing DOM elements for results display.");
    return;
  }

  quizArea.style.display = "none";
  results.style.display = "block";

  let resultHTML = `<h2>Your Score: ${score} / 10</h2>`;

  if (incorrectAnswers.length > 0) {
    resultHTML += "<h3>Review These:</h3><ul>";
    incorrectAnswers.forEach(item => {
      resultHTML += `<li>${item.question}<br>Your answer: ${item.yourAnswer}, Correct answer: ${item.correctAnswer}</li>`;
    });
    resultHTML += "</ul>";
  }

  // Prepare data for checksum
  const resultData = JSON.stringify({
    score: score,
    answers: questions.map(q => q.answer),
    incorrect: incorrectAnswers
  });

  // Generate and display checksum
  generateHash(resultData).then(hash => {
    resultHTML += `<p><strong>Checksum:</strong> ${hash}</p>`;
    resultHTML += `<button onclick="restartQuiz()">Try Again</button>`;
    results.innerHTML = resultHTML;
  });
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  incorrectAnswers = [];
  questions = [];

  document.getElementById("results").style.display = "none";
  document.getElementById("quizArea").style.display = "block";
  generateQuestion();
}

window.onload = generateQuestion;
