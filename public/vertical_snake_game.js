class SnakeGame {
  constructor() {
    // HTML elements
    this.startScreen = document.getElementById("startScreen");
    this.gameScreen = document.getElementById("gameScreen");
    this.leaderboard = document.getElementById("leaderboard");

    this.playButton = document.getElementById("playButton");
    this.leaderboardButton = document.getElementById("leaderboardButton");
    this.closeLeaderboard = document.getElementById("closeLeaderboard");

    this.leaderboardList = document.getElementById("leaderboardList");
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.playerNameInput = document.getElementById("playerName");
    this.playerNameDisplay = document.getElementById("playerNameDisplay");

    // Game Grid
    this.gridSize = 20;
    this.maxX = this.canvas.width / this.gridSize;
    this.maxY = this.canvas.height / this.gridSize;
    this.snakeY = Math.floor(this.maxY / 2);
    this.snakeX = Math.floor(this.maxX / 2);

    this.playButton.addEventListener("click", () => this.startGame());
    this.leaderboardButton.addEventListener("click", () => this.showLeaderboard());
    this.closeLeaderboard.addEventListener("click", () => this.hideLeaderboard());
  }

  
  startGame() {
    this.playerName = this.playerNameInput.value.trim() || "Player";
    this.playerNameDisplay.textContent = `Player: ${this.playerName}`;

    this.startScreen.style.display = "none";
    this.leaderboard.style.display = "none";
    this.gameScreen.style.display = "block";

    this.drawSnake();
  }

  // show Leaderboard 
  showLeaderboard() {
    this.leaderboardList.innerHTML = "<li>No scores yet</li>";
    this.leaderboard.style.display = "block";
  }

  // hide Leaderboard 
  hideLeaderboard() {
    this.leaderboard.style.display = "none";
  }
//game
  drawSnake() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "lime";
    this.ctx.fillRect(
      this.snakeX * this.gridSize,
      this.snakeY * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }
}
window.addEventListener("load", () => {
  new SnakeGame();
});
