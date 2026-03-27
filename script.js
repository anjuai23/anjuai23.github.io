let randomNumber = Math.floor(Math.random() * 100) + 1;
let maxAttempts = 7;
let attemptsLeft = maxAttempts;

function checkGuess() {
    const userGuess = Number(document.getElementById("guessInput").value);
    const message = document.getElementById("message");
    const attempts = document.getElementById("attempts");

    if (!userGuess) {
        message.textContent = "⚠️ Please enter a number!";
        return;
    }

    attemptsLeft--;

    if (userGuess === randomNumber) {
        message.textContent = "🎉 Correct! You guessed the number!";
        endGame();
    } else if (userGuess > randomNumber) {
        message.textContent = "📉 Too high!";
    } else {
        message.textContent = "📈 Too low!";
    }

    attempts.textContent = `Attempts left: ${attemptsLeft}`;

    if (attemptsLeft === 0 && userGuess !== randomNumber) {
        message.textContent = `❌ Game Over! The number was ${randomNumber}`;
        endGame();
    }
}

function endGame() {
    document.getElementById("restartBtn").style.display = "inline-block";
}

function restartGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = maxAttempts;

    document.getElementById("message").textContent = "";
    document.getElementById("attempts").textContent = "";
    document.getElementById("guessInput").value = "";
    document.getElementById("restartBtn").style.display = "none";
}
