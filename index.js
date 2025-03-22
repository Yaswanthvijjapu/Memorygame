document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.querySelector(".game-board");
    const movesDisplay = document.querySelector(".moves");
    const timeDisplay = document.querySelector(".time");
    const scoreDisplay = document.querySelector(".score");
    const highScoreDisplay = document.querySelector(".high-score");
    const restartButton = document.querySelector(".restart");
    const resetScoreButton = document.querySelector(".reset-score");
    const difficultySelect = document.querySelector(".difficulty");
    const winMessage = document.querySelector(".win-message");
    const flipSound = document.getElementById("flip-sound");
    const matchSound = document.getElementById("match-sound");
    const winSound = document.getElementById("win-sound");

    const symbolSets = {
        easy: ["🍎", "🍌", "🍒", "🍇", "🍍", "🍓", "🥝", "🥭"],
        medium: ["🍎", "🍌", "🍒", "🍇", "🍍", "🍓", "🥝", "🥭", "🍉", "🍋", "🍊", "🍐"],
        hard: ["🍎", "🍌", "🍒", "🍇", "🍍", "🍓", "🥝", "🥭", "🍉", "🍋", "🍊", "🍐", "🥑", "🥕", "🥔", "🍅", "🌽", "🍆"]
    };

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let time = 0;
    let score = 0;
    let timer;
    let highScore = localStorage.getItem("highScore") || 0;
    highScoreDisplay.textContent = highScore;

    // Start the game with default difficulty
    startGame(difficultySelect.value);

    // Event listeners
    restartButton.addEventListener("click", () => startGame(difficultySelect.value));
    resetScoreButton.addEventListener("click", () => {
        highScore = 0;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.textContent = highScore;
    });
    difficultySelect.addEventListener("change", () => startGame(difficultySelect.value));

    function startGame(difficulty) {
        // Reset state
        moves = 0;
        time = 0;
        score = 0;
        matchedPairs = 0;
        flippedCards = [];
        movesDisplay.textContent = moves;
        timeDisplay.textContent = time;
        scoreDisplay.textContent = score;
        winMessage.classList.add("hidden");
        clearInterval(timer);
        timer = setInterval(() => {
            time++;
            timeDisplay.textContent = time;
        }, 1000);

        // Select symbols based on difficulty
        const baseSymbols = symbolSets[difficulty];
        const symbols = [...baseSymbols, ...baseSymbols]; // Double for pairs
        const gridSize = difficulty === "easy" ? 4 : 6;

        // Shuffle symbols
        cards = shuffle(symbols).map((symbol, index) => ({
            id: index,
            symbol,
            matched: false
        }));

        // Render cards
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, minmax(var(--card-size), 1fr))`;
        gameBoard.innerHTML = "";
        cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${card.symbol}</div>
                </div>
            `;
            cardElement.addEventListener("click", () => flipCard(cardElement, card));
            gameBoard.appendChild(cardElement);
        });
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function flipCard(cardElement, card) {
        if (flippedCards.length < 2 && !cardElement.classList.contains("flipped") && !card.matched) {
            cardElement.classList.add("flipped");
            flippedCards.push({ element: cardElement, card });
            flipSound.play().catch(() => console.log("Flip sound failed"));

            if (flippedCards.length === 2) {
                moves++;
                movesDisplay.textContent = moves;
                checkMatch();
            }
        }
    }

    function checkMatch() {
        const [first, second] = flippedCards;
        if (first.card.symbol === second.card.symbol) {
            first.card.matched = true;
            second.card.matched = true;
            first.element.classList.add("matched");
            second.element.classList.add("matched");
            matchedPairs++;
            score += Math.max(100 - moves - time, 10); // Base score, penalized by moves/time
            scoreDisplay.textContent = score;
            matchSound.play().catch(() => console.log("Match sound failed"));
            flippedCards = [];
            if (matchedPairs === cards.length / 2) {
                endGame();
            }
        } else {
            setTimeout(() => {
                first.element.classList.remove("flipped");
                second.element.classList.remove("flipped");
                flippedCards = [];
            }, 1000);
        }
    }

    function endGame() {
        clearInterval(timer);
        winMessage.classList.remove("hidden");
        winSound.play().catch(() => console.log("Win sound failed"));
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreDisplay.textContent = highScore;
        }
    }
});