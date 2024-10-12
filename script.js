const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// テトリスのフィールド
let field = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// テトリスのブロックの定義と色
const TETROMINOS = [
    { shape: [[1, 1, 1, 1]], color: 'cyan' },      // I
    { shape: [[1, 1], [1, 1]], color: 'yellow' },  // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' }, // L
    { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' },   // J
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' },  // S
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'red' },    // Z
];


let currentTetromino;
let currentPosition;
let holdInterval;

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
                context.fillStyle = field[r][c]; // 色を使用して描画
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
                context.fillStyle = currentTetromino.color; // テトリミノの色を使用
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
        shape: TETROMINOS[index].shape,
        color: TETROMINOS[index].color, // テトリミノごとの色を設定
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
                    field[y][x] = currentTetromino.color; // 色をフィールドに保存
                }
            }
        });
    });
}


// 完全な行を削除する関数
function removeFullRows() {
    let rowsToRemove = [];

    // 完全な行をリストに追加
    for (let r = ROWS - 1; r >= 0; r--) {
        if (field[r].every(cell => cell !== 0)) {
            rowsToRemove.push(r);
        }
    }

    // 完全な行を一気に削除
    rowsToRemove.forEach(rowIndex => {
        field.splice(rowIndex, 1); // 該当する行を削除
        field.unshift(Array(COLS).fill(0)); // 上に新しい空行を追加
    });
}


// テトリスのブロックを回転する関数
function rotateTetromino() {
    const newShape = currentTetromino.shape[0].map((_, index) => currentTetromino.shape.map(row => row[index]).reverse());

    if (isValidMove(0, 0, newShape)) {
        currentTetromino.shape = newShape;
    }
}

// ホールド処理の開始
function startHold(direction) {
    moveTetromino(direction); // 最初の移動
    holdInterval = setInterval(() => {
        moveTetromino(direction); // 指定した方向に連続で移動
        draw();
    }, 100); // 100ミリ秒ごとに移動
}

// ホールド処理の停止
function stopHold() {
    clearInterval(holdInterval);
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
document.getElementById('left-btn').addEventListener('mousedown', () => startHold('left'));
document.getElementById('left-btn').addEventListener('mouseup', stopHold);
document.getElementById('left-btn').addEventListener('mouseleave', stopHold);

document.getElementById('right-btn').addEventListener('mousedown', () => startHold('right'));
document.getElementById('right-btn').addEventListener('mouseup', stopHold);
document.getElementById('right-btn').addEventListener('mouseleave', stopHold);

document.getElementById('down-btn').addEventListener('mousedown', () => startHold('down'));
document.getElementById('down-btn').addEventListener('mouseup', stopHold);
document.getElementById('down-btn').addEventListener('mouseleave', stopHold);

document.getElementById('rotate-btn').addEventListener('click', () => {
    rotateTetromino();
    draw();
});

// タッチイベントを処理（スマホ対応）
document.getElementById('left-btn').addEventListener('touchstart', (event) => {
    event.preventDefault(); // スクロールを防止
    startHold('left');
});
document.getElementById('left-btn').addEventListener('touchend', (event) => {
    event.preventDefault(); // スクロールを防止
    stopHold();
});

document.getElementById('right-btn').addEventListener('touchstart', (event) => {
    event.preventDefault(); // スクロールを防止
    startHold('right');
});
document.getElementById('right-btn').addEventListener('touchend', (event) => {
    event.preventDefault(); // スクロールを防止
    stopHold();
});

document.getElementById('down-btn').addEventListener('touchstart', (event) => {
    event.preventDefault(); // スクロールを防止
    startHold('down');
});
document.getElementById('down-btn').addEventListener('touchend', (event) => {
    event.preventDefault(); // スクロールを防止
    stopHold();
});

document.getElementById('rotate-btn').addEventListener('touchstart', (event) => {
    event.preventDefault(); // スクロールを防止
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
