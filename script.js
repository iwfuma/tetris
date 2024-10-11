const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// テトリスのフィールド
let field = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// テトリスのブロックの定義
const TETROMINOS = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
];

let currentTetromino;
let currentPosition;

// テトリスの描画
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    drawTetromino();
}

// フィールドを描画
function drawField() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (field[r][c] !== 0) {
                context.fillStyle = 'blue';
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
                context.fillStyle = 'red';
                context.fillRect((currentPosition.x + c) * BLOCK_SIZE, (currentPosition.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((currentPosition.x + c) * BLOCK_SIZE, (currentPosition.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// 新しいテトリスのブロックを生成
function newTetromino() {
    const index = Math.floor(Math.random() * TETROMINOS.length);
    currentTetromino = {
        shape: TETROMINOS[index],
    };
    currentPosition = { x: Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2), y: 0 };

    if (!isValidMove(0, 0, currentTetromino.shape)) {
        alert('Game Over!');
        field = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // フィールドをリセット
        init(); // 新しいゲームを開始
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
        fixTetromino();
        removeFullRows();
        newTetromino();
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
                    field[y][x] = value;
                }
            }
        });
    });
}

// 完全な行を削除する関数
function removeFullRows() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (field[r].every(cell => cell !== 0)) {
            field.splice(r, 1);
            field.unshift(Array(COLS).fill(0));
        }
    }
}

// テトリスのブロックを回転する関数
function rotateTetromino() {
    const newShape = currentTetromino.shape[0].map((_, index) => currentTetromino.shape.map(row => row[index]).reverse());

    if (isValidMove(0, 0, newShape)) {
        currentTetromino.shape = newShape;
    }
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
    }
    draw();
});

// ボタンクリックイベントを処理
document.getElementById('left-btn').addEventListener('click', () => {
    moveTetromino('left');
    draw();
});

document.getElementById('right-btn').addEventListener('click', () => {
    moveTetromino('right');
    draw();
});

document.getElementById('down-btn').addEventListener('click', () => {
    moveTetromino('down');
    draw();
});

document.getElementById('rotate-btn').addEventListener('click', () => {
    rotateTetromino();
    draw();
});

// ゲームの初期化
function init() {
    newTetromino();
    draw();
}

// ゲームのループ
function gameLoop() {
    moveTetromino('down');
    draw();
    setTimeout(gameLoop, 1000); // 1秒ごとに下に移動
}

// ゲームを開始する
init();
gameLoop();

