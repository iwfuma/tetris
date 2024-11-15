const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');

const ROWS = 15; 
const COLS = 10;
const BLOCK_SIZE = 30;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// ゲームオーバー状態
let gameOver = false;

// スコア
let score = 0;

// テトリスのフィールド
let field = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// テトリスのブロックの定義と色
const TETROMINOS = [
    { shape: [[1, 1, 1, 1]], color: 'cyan' },      
    { shape: [[1, 1], [1, 1]], color: 'yellow' },  
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' },
    { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' },   
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' },
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'red' },
];

let currentTetromino;
let currentPosition;

// テトリスの描画
function draw() {
    if (gameOver) return;  // ゲームオーバー時は描画を停止

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    drawTetromino();
}

// フィールドを描画
function drawField() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (field[r][c] !== 0) {
                context.fillStyle = field[r][c];
                context.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// テトリスのブロックを描画
function drawTetromino() {
    currentTetromino.shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value !== 0) {
                context.fillStyle = currentTetromino.color;
                context.fillRect((currentPosition.x + c) * BLOCK_SIZE, (currentPosition.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((currentPosition.x + c) * BLOCK_SIZE, (currentPosition.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// 新しいテトリスのブロックを生成
function newTetromino() {
    if (gameOver) return;  // ゲームオーバー時にブロックの生成を停止

    const index = Math.floor(Math.random() * TETROMINOS.length);
    currentTetromino = {
        shape: TETROMINOS[index].shape,
        color: TETROMINOS[index].color,
    };
    currentPosition = { x: Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2), y: 0 };

    if (!isValidMove(0, 0, currentTetromino.shape)) {
        gameOver = true;  // ゲームオーバーに設定
        showResult();  // 結果表示
    }
}

// 移動できるかチェック
function isValidMove(offsetX, offsetY, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
                const newX = currentPosition.x + c + offsetX;
                const newY = currentPosition.y + r + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false;
                }

                if (newY >= 0 && field[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// ブロックを移動する関数
function moveTetromino(direction) {
    if (gameOver) return;  // ゲームオーバー時には移動を停止

    let offsetX = 0;
    let offsetY = 0;

    if (direction === 'left') {
        offsetX = -1;
    } else if (direction === 'right') {
        offsetX = 1;
    } else if (direction === 'down') {
        offsetY = 1;
    }

    if (isValidMove(offsetX, offsetY, currentTetromino.shape)) {
        currentPosition.x += offsetX;
        currentPosition.y += offsetY;
    } else if (direction === 'down') {
        fixTetromino(); // ブロックをフィールドに固定
        removeFullRows(); // 行を削除
        newTetromino(); // 新しいブロックを生成
    }
}

// ブロックをフィールドに固定する関数
function fixTetromino() {
    currentTetromino.shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value !== 0) {
                const x = currentPosition.x + c;
                const y = currentPosition.y + r;
                if (y >= 0) {
                    field[y][x] = currentTetromino.color;
                }
            }
        });
    });
}

// 完全な行を削除する関数
function removeFullRows() {
    let rowsToRemove = [];

    for (let r = ROWS - 1; r >= 0; r--) {
        if (field[r].every(cell => cell !== 0)) {
            rowsToRemove.push(r);
        }
    }

    rowsToRemove.forEach(rowIndex => {
        field.splice(rowIndex, 1);
        field.unshift(Array(COLS).fill(0));
    });

    // スコアを増加
    score += rowsToRemove.length;
}

// テトリスのブロックを回転する関数
function rotateTetromino() {
    if (gameOver) return;  // ゲームオーバー時に回転を停止

    const newShape = currentTetromino.shape[0].map((_, index) => currentTetromino.shape.map(row => row[index]).reverse());

    if (isValidMove(0, 0, newShape)) {
        currentTetromino.shape = newShape;
    }
}

// タイマー
let timeLeft = 30;
const timerElement = document.getElementById('timer');

// タイマーを更新する関数
function updateTimer() {
    if (gameOver) return;  // ゲームオーバー時にタイマーを停止

    if (timeLeft > 0) {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
    } else {
        gameOver = true;  // ゲームオーバー
        showResult();  // 結果表示
    }
}

// 結果を表示する関数
function showResult() {
    const resultMessage = `Game Over! Final Score: ${score}`;
    document.getElementById('game-over-message').textContent = resultMessage;
    document.getElementById('game-over-message').style.display = 'block';  // ゲームオーバーのメッセージを表示
}


// キーボード入力を処理
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            moveTetromino('left');
            break;
        case 'ArrowRight':
            moveTetromino('right');
            break;
        case 'ArrowDown':
            moveTetromino('down');
            break;
        case 'ArrowUp':
            rotateTetromino();
            break;
        case ' ':
            fastDrop = true;  // スペースキーを押したとき、速く落下させる
            dropInterval = 100;  // 落下速度を速くする
            break;
    }
    draw();
});

// ゲームの初期化
function init() {
    newTetromino();
    draw();
}

// ゲームのループ
function gameLoop() {
    if (!gameOver) {
        moveTetromino('down');
        draw();
    }
}

// ゲーム開始
init();
setInterval(updateTimer, 1000);
setInterval(gameLoop, 500);//落下速度調整
