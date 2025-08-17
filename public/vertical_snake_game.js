const GOOGLE_CLIENT_ID = "544791653132-ma5srr4mitc1kblbcr5f59d1tjt3ro7j.apps.googleusercontent.com";

class SnakeGame {
  constructor() {
    // DOM Elements
    this.startScreen = document.getElementById("startScreen");
    this.gameScreen = document.getElementById("gameScreen");
    this.playButton = document.getElementById("playButton");
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.playerNameInput = document.getElementById("playerName");
    this.levelDisplay = document.getElementById("levelDisplay");
    this.scoreDisplay = document.getElementById("scoreDisplay");

    this.leaderboard   = document.getElementById("leaderboard");
    this.leaderboardBtn= document.getElementById("leaderboardButton");
    this.closeBoardBtn = document.getElementById("closeLeaderboard");
    this.leaderboardList = document.getElementById("leaderboardList");
    
    this.controlsBtn = document.getElementById("controlsButton");
    this.controlsModal = document.getElementById("controlsModal");
    this.closeControlsBtn = document.getElementById("closeControls");

    this.controlsBtn.addEventListener("click", () => this.showControls());
    this.closeControlsBtn.addEventListener("click", () => this.hideControls());


    this.controlsModal.addEventListener("click", (e) => {
      if (e.target === this.controlsModal) this.hideControls();
    });
    
    this.leaderboardData = JSON.parse(localStorage.getItem("snakeLeaderboard") || "[]");
    
    this.prevScreen = "start"; 

    this.gridSize = 20;
    this.maxX = this.canvas.width / this.gridSize;
    this.maxY = this.canvas.height / this.gridSize;
    this.snakeY = Math.max(2, this.maxY - 10);

    // State
    this.level = 1;
    this.frame = 0;
    this.gameOver = false;
    this.score = 0;

    this.speed = 12;
    this.minSpeed = 1.31;
    this.obstacleGapSize = 9; 
    this.minGapSize = 4;

    this.snakeX = Math.floor(this.maxX / 2);
    this.obstacles = [];

    this.moveTimer = 0;
    this.speedIncreaseInterval = 69; 
    this.levelIncreaseInterval = 100;
    this.obstacleDifficultyInterval = 700; 
    this.lastObstacleFrame = 0;
    this.minObstacleRowSpacing = 2;    
    this.maxHoleShiftBase = 6;         
    this.leaderboardBtn.addEventListener("click", () => this.showLeaderboard());
    this.closeBoardBtn.addEventListener("click", () => this.hideLeaderboard());
    
    this.playButton.addEventListener("click", () => this.startGame());
    document.addEventListener("keydown", (e) => this._keydown(e));

    this.playerNameInput.addEventListener("input", () => {
    this.playButton.disabled = this.playerNameInput.value.trim() === "";
    });
  }

_keydown(e) {
  if (
    e.key === "ArrowLeft" || e.key === "a" || e.key === "A" ||
    e.key === "ArrowRight" || e.key === "d" || e.key === "D"
  ) {
    const direction =
      (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") ? -1 : 1;
    const nx = this.snakeX + direction;
    if (nx >= 0 && nx < this.maxX) this.snakeX = nx;
  }
}

  startGame() {
    const playerName = this.playerNameInput.value.trim();
    if (!playerName) {
      alert("Please enter a name to start the game.");
      return;
    }

    this.playerName = playerName;
    this.startScreen.style.display = "none";
    this.gameScreen.style.display = "block";
    this.resetGame();
    this.loop();
  }

  resetGame() {
    this.level = 1;
    this.frame = 0;
    this.score = 0;
    this.gameOver = false;

    this.snakeX = Math.floor(this.maxX / 2);
    this.obstacles = [];

    this.speed = 12;
    this.obstacleGapSize = 6;
    this.moveTimer = 0;

    
    this.lastHole = Math.floor((this.maxX - this.obstacleGapSize) / 2);
    this.lastObstacleFrame = 0;
    this.updateDisplays();
  }

  updateDisplays() {
    this.levelDisplay.textContent = `Level: ${this.level}" "${this.speed}`;
    this.scoreDisplay.textContent = `Score: ${this.score}`;
  }

 
computeFramesPerRow() {
  if (this.level < 15) return 92;     
  
  if (this.level <= 25) return Math.max(30, 60 - (this.level - 15) * 6);
  
  return 24;
}
generateObstacleRow() {
  const gap = Math.max(this.minGapSize, this.obstacleGapSize);
  let holeStart;

  if (this.level < 15) {
    const minSep = Math.max(3, Math.floor(this.maxX * 0.09)); 
    do {
      holeStart = Math.floor(Math.random() * (this.maxX - gap + 1));
    } while (Math.abs(holeStart - this.lastHole) < minSep);
  } else {

    const maxShift = 1;
    const rangeMin = Math.max(0, this.lastHole - maxShift);
    const rangeMax = Math.min(this.maxX - gap, this.lastHole + maxShift);

    const reach = 2;
    const reachMin = Math.max(0, Math.min(this.maxX - gap, this.snakeX - reach - gap + 1));
    const reachMax = Math.max(0, Math.min(this.maxX - gap, this.snakeX + reach));

    const candMin = Math.max(rangeMin, reachMin);
    const candMax = Math.min(rangeMax, reachMax);

    if (candMin <= candMax) {
      holeStart = Math.floor(Math.random() * (candMax - candMin + 1)) + candMin;
    } else {
      const holeCenter = this.lastHole + Math.floor(gap / 2);
      const dir = Math.sign(this.snakeX - holeCenter); 
      holeStart = Math.max(0, Math.min(this.maxX - gap, this.lastHole + dir));
    }
  }

  this.lastHole = holeStart;

 //generate one gap
  for (let x = 0; x < this.maxX; x++) {
    const inHole = (x >= holeStart && x < holeStart + gap);
    if (!inHole) this.obstacles.push({ x, y: -1 });
  }
}


  getMinObstacleY() {
    return this.obstacles.length ? Math.min(...this.obstacles.map(o => o.y)) : this.maxY;
  }

  update() {
    if (this.gameOver) return;

    this.frame++;

    // increse the lvl over time(frames)
    if (this.frame % this.levelIncreaseInterval === 0) {
      this.level++;
      this.updateDisplays();
    }

    // 
    if (this.frame % this.speedIncreaseInterval === 0 && this.speed > this.minSpeed) {
      if (this.level < 15) {
        this.speed = Math.max(3, this.speed - 1);
      } 
      else if (this.level < 22) {
        this.speed = Math.max(this.minSpeed+1, this.speed - 1);
      }
      else {
        this.speed = Math.max(this.minSpeed, this.speed - 0.10);
      } 
      this.updateDisplays();
    }

    // close the gap distance slowly
    if (this.frame % this.obstacleDifficultyInterval === 0 && this.obstacleGapSize > this.minGapSize) {
      this.obstacleGapSize--;
    }
    //row shedule, + add some randomness
    const framesPerRow = this.computeFramesPerRow();
    const jitter = (this.frame % 7 === 0) ? 2 : (this.frame % 5 === 0 ? -2 : 0);//slightly randomize the new rows
    const dueBase = this.frame - this.lastObstacleFrame >= Math.max(8, framesPerRow + jitter);

  
    const spacingY = this.getMinObstacleY() > this.minObstacleRowSpacing;

    if (dueBase && spacingY) {
      this.generateObstacleRow();
      this.lastObstacleFrame = this.frame;
    }

    if (this.level >= 15) {
      const extraDelay = Math.max(8, 30 - this.level);
      const dueExtra = this.frame - this.lastObstacleFrame >= extraDelay;
      if (dueExtra && this.getMinObstacleY() > this.minObstacleRowSpacing) {
        this.generateObstacleRow();
        this.lastObstacleFrame = this.frame;
      }
    }

this.moveTimer += 1;

while (this.moveTimer >= this.speed) {
  this.moveTimer -= this.speed;
  this.obstacles.forEach(o => o.y++);
  this.obstacles = this.obstacles.filter(o => o.y < this.maxY);
}

//Colllision detection
    if (this.obstacles.some(o =>
      o.x === this.snakeX &&
      o.y >= this.snakeY &&         
      o.y - 1 <= this.snakeY)) {     
      this.gameOver = true;
      this.saveScore();       
      this.updateLeaderboard();
      alert(`Game Over!\n${this.playerName}'s Score: ${this.score}`);
      this.resetUIStyles();
      return;
    }

    // Score
    this.score = this.level * this.frame;
    this.updateDisplays();
  }
showLeaderboard() {

  this.prevScreen = (this.gameScreen.style.display !== "none") ? "game" : "start";

  this.startScreen.style.display = "none";
  this.gameScreen.style.display  = "none";
  this.leaderboard.style.display = "block";
}

hideLeaderboard() {

  this.leaderboard.style.display = "none";
  if (this.prevScreen === "game") {
    this.gameScreen.style.display  = "block";
    this.startScreen.style.display = "none";
  } else {
    this.startScreen.style.display = "flex"; 
    this.gameScreen.style.display  = "none";
  }
}
updateLeaderboard() {
  this.leaderboardList.innerHTML = "";
  const top = [...this.leaderboardData]
               .sort((a,b)=>b.score-a.score)
               .slice(0,10);

  if (!top.length) {
    this.leaderboardList.innerHTML = "<li>No scores yet</li>";
    return;
  }
  top.forEach(e=>{
     const li = document.createElement("li");
     li.textContent = `${e.name}: ${e.score}`;
     this.leaderboardList.appendChild(li);
  });
}
showControls() {

  this.prevScreen = (this.gameScreen.style.display !== "none") ? "game" : "start";

  this.controlsModal.style.display = "flex";
}

hideControls() {
  this.controlsModal.style.display = "none";
}
saveScore() {
  if (this.score > 0) {
    this.leaderboardData.push({
      name: this.playerName,
      score: this.score,
      date: new Date().toISOString()
    });
    localStorage.setItem("snakeLeaderboard", JSON.stringify(this.leaderboardData));
  }
}

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Player
    this.ctx.fillStyle = "lime";
    this.ctx.fillRect(
      this.snakeX * this.gridSize,
      this.snakeY * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );

    // Obstacles
    this.ctx.fillStyle = "red";
    this.obstacles.forEach(o => {
      this.ctx.fillRect(
        o.x * this.gridSize,
        o.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });
  }

  loop() {
    this.update();
    this.draw();
    if (!this.gameOver) {
      requestAnimationFrame(() => this.loop());
    }
  }

resetUIStyles() {
  this.startScreen.style.display = "flex";
  this.gameScreen.style.display  = "none";
  this.leaderboard.style.display = "none";
  this.prevScreen = "start";
}
}

//Goole login
window.addEventListener("DOMContentLoaded", () => {
  const game = new SnakeGame();

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredential
  });

  google.accounts.id.renderButton(document.querySelector(".g_id_signin"), {
    theme: "outline",
    size: "large"
  });
});

function handleCredential({ credential }) {
  const p = JSON.parse(atob(credential.split(".")[1]));
  const name = p.given_name || p.name || "Player";

  document.getElementById("authStatus").textContent = `Signed in as ${name}`;
  document.getElementById("playerName").value = name;
  document.getElementById("playButton").disabled = false;
}