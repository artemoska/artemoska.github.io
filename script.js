// Игра 1: Угадай число
let randomNumber = Math.floor(Math.random() * 101); // Генерируем случайное число от 1 до 100

function guessNumber() {
    let guess = document.getElementById("guessInput").value;
    if (guess == randomNumber) {
        document.getElementById("result").innerHTML = "Верно! Вы угадали число.";
    } else if (guess > randomNumber) {
        document.getElementById("result").innerHTML = "Ваше число больше загаданного.";
    } else {
        document.getElementById("result").innerHTML = "Ваше число меньше загаданного.";
    }
}

// Игра 2: Найти слово
document.addEventListener('DOMContentLoaded', function () {
    const wordsToFind = ["HACKERSTYLE", "WIFI", "GRIDHUBS", "TECHNOLOGY", "METROPOLIS", "BIOTECH", "SMARTPHONES", "VIRTUALREALITY"];
    const grid = document.querySelectorAll('#wordGrid span');

    for (const word of wordsToFind) {
        highlightWord(word.toUpperCase());
    }

    function highlightWord(word) {
        let foundIndex = -1;
        while ((foundIndex = findNextOccurrence(word)) !== -1) {
            grid[foundIndex].classList.add('highlighted');
        }
    }

    function findNextOccurrence(word) {
        const gridText = Array.from(grid).map(span => span.textContent).join('');
        return gridText.indexOf(word);
    }
});

// Игра 3: Пазл
const puzzleSize = 3;
const pieces = [];
let solvedPieces = [];

function shufflePuzzle() {
    const ctx = document.getElementById("puzzleCanvas").getContext("2d");
    const image = new Image();
    image.src = "https://via.placeholder.com/300x200";
    image.onload = function () {
        ctx.drawImage(image, 0, 0);
        createPieces(ctx, image.width, image.height);
        shufflePieces(pieces);
        drawPieces(ctx);
    };
}

function solvePuzzle() {
    const ctx = document.getElementById("puzzleCanvas").getContext("2d");
    const image = new Image();
    image.src = "https://via.placeholder.com/300x200";
    image.onload = function () {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(image, 0, 0);
    };
}

function createPieces(ctx, width, height) {
    for (let y = 0; y < puzzleSize; y++) {
        for (let x = 0; x < puzzleSize; x++) {
            const piece = {
                x: x,
                y: y,
                imageData: ctx.getImageData(x * (width / puzzleSize), y * (height / puzzleSize), width / puzzleSize, height / puzzleSize)
            };
            pieces.push(piece);
        }
    }
}

function shufflePieces(piecesArray) {
    for (let i = piecesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [piecesArray[i], piecesArray[j]] = [piecesArray[j], piecesArray[i]];
    }
}

function drawPieces(ctx) {
    pieces.forEach((piece, index) => {
        ctx.putImageData(piece.imageData, (index % puzzleSize) * (ctx.canvas.width / puzzleSize), Math.floor(index / puzzleSize) * (ctx.canvas.height / puzzleSize));
    });
}

window.onload = shufflePuzzle;
