document.addEventListener("DOMContentLoaded", function () {
  // ================= VARIABLES =================
  let nextNumber = 1;
  let timerInterval = null;
  let startTime = null;

  const clickSound = document.getElementById("clickSound");
  const completeSound = document.getElementById("completeSound");
  const wrongSound = document.getElementById("wrongSound");
  const restartSound = document.getElementById("restartSound");
  const highScoreDisplay = document.getElementById("highScore");
  const grid = document.getElementById("grid");

  // ================= COUNTDOWN OVERLAY =================
  const countdownOverlay = document.createElement("div");
  countdownOverlay.id = "countdown-overlay";
  Object.assign(countdownOverlay.style, {
    position: "fixed",      // cover entire viewport
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    display: "none",       // hidden initially
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.3)",
    zIndex: "9999",
    fontSize: "6rem",
    color: "#ff5722",
    fontWeight: "bold",
    pointerEvents: "none", // ignore clicks unless countdown active
  });
  document.body.appendChild(countdownOverlay);

  // ================= SHUFFLE FUNCTION =================
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  // ================= COUNTDOWN FUNCTION =================
  function startCountdown(callback) {
    let count = 3;
    countdownOverlay.style.display = "flex";
    countdownOverlay.style.pointerEvents = "auto"; // block clicks during countdown
    countdownOverlay.textContent = count;

    const interval = setInterval(() => {
      if (count > 1) {
        count--;
        countdownOverlay.textContent = count;
      } else if (count === 1) {
        countdownOverlay.textContent = "GO!";
        count--;
      } else {
        clearInterval(interval);
        countdownOverlay.style.display = "none";
        countdownOverlay.style.pointerEvents = "none"; // allow clicks on tiles
        if (callback) callback();
      }
    }, 1000);
  }

  // ================= GRID FUNCTIONS =================
  function createGrid(size) {
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    const numbers = shuffle([...Array(size * size).keys()].map(i => i + 1));
    nextNumber = 1;

    numbers.forEach((num) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.innerText = num;
      cell.addEventListener("click", () => handleClick(cell, num, size));
      grid.appendChild(cell);
    });
  }

  function handleClick(cell, number, size) {
    if (!startTime) return; // ignore clicks before countdown ends

    if (number === nextNumber) {
      if (nextNumber === 1) startTimer();
      cell.classList.add("correct");
      clickSound?.play();
      nextNumber++;

      // Game completed
      if (number === size * size) {
        clearInterval(timerInterval);
        completeSound?.play();
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        updateHighScore(size, totalTime);
        setTimeout(() => alert(`🎉 Completed in ${totalTime} seconds!`), 100);
      }
    } else {
      // Wrong click feedback
      cell.classList.add("wrong");
      wrongSound?.play();
      setTimeout(() => cell.classList.remove("wrong"), 500);
    }
  }

  // ================= TIMER =================
  function startTimer() {
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById("timer").innerText = `Time: ${elapsed}s`;
    }, 1000);
  }

  // ================= GAME FUNCTIONS =================
  function startGame() {
    const size = parseInt(document.getElementById("gridSize").value);

    // Restart animation & sound
    restartSound?.play();
    grid.classList.remove("restart");
    void grid.offsetWidth; // trigger reflow
    grid.classList.add("restart");

    // Reset timer
    clearInterval(timerInterval);
    startTime = null;
    document.getElementById("timer").innerText = "Time: 0s";

    createGrid(size);
    showHighScore(size);

    // Start countdown before enabling clicks
    startCountdown(() => {
      startTime = Date.now();
    });
  }

  // ================= HIGH SCORE =================
  function updateHighScore(size, time) {
    const key = `schulte_highscore_${size}`;
    const current = localStorage.getItem(key);
    if (!current || time < parseInt(current)) {
      localStorage.setItem(key, time);
      showHighScore(size);

      // Glow + confetti effect
      highScoreDisplay.classList.add("new");
      setTimeout(() => highScoreDisplay.classList.remove("new"), 2000);

      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }

  function showHighScore(size) {
    const key = `schulte_highscore_${size}`;
    const score = localStorage.getItem(key);
    highScoreDisplay.innerText = score ? `High Score: ${score}s` : "High Score: --";
  }

  // ================= DARK MODE =================
  function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  }

  // Restore dark mode if previously enabled
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  // ================= EXPORT FUNCTIONS =================
  window.startGame = startGame;
  window.toggleDarkMode = toggleDarkMode;

  // Start first game on load
  startGame();
});
