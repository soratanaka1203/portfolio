// キャンバスのエレメントを持ってくる
let can = document.getElementById("can");
let con = can.getContext("2d");

// 初期の落ちるスピード（ミリ秒）
let game_speed = 1000;
let speedIncreaseInterval = 25000; // 25秒ごとに速度を上げる
let speedDecreaseFactor = 0.99; // 速度の減少率

// フィールドのサイズ
const field_col = 10;
const field_row = 20;

// ブロックのサイズ（ピクセル）
const block_size = 30;
// テトロミノのサイズ
const tetoro_size = 4;

// テトロミノの生成
let tetoro = createNewTetoro();

// ランダムに新しいテトロミノの形を返す
function createNewTetoro() {
    const tetoros = [
        { shape: [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ], color: "red" }, // Z型（赤）

        { shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ], color: "yellow" }, // O型（黄色）

        { shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ], color: "orange" }, // L型（オレンジ）

        { shape: [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ], color: "green" }, // S型（緑）

        { shape: [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ], color: "blue" }, // J型（青）

        { shape: [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 1],
            [0, 0, 0, 0],
        ], color: "purple" }, // T型（紫）

        { shape: [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ], color: "cyan" }, // I型（水色）
    ];

    return tetoros[Math.floor(Math.random() * tetoros.length)];
}

// テトロミノの座標
let tetoro_x = 0;
let tetoro_y = 0;

// フィールド本体
let field = [];

// 初期スコア
let score = 0;
let hi_score = 0;

// スコアを表示する関数
function updateScore() {
    document.getElementById('score').textContent = Math.floor(score.toString().padStart(7, '0'));
}

function updateHi_Score() {
    document.getElementById('hi_score').textContent = Math.floor(hi_score.toString().padStart(7, '0'));
}

// スコアを加算する関数
function addScore(points) {
    score += points;
    updateScore();
}

// 初期化
function init() {
    for (let y = 0; y < field_row; y++) {
        field[y] = [];
        for (let x = 0; x < field_col; x++) {
            field[y][x] = { value: 0, color: null }; // フィールドに色を追加
        }
    }
    game_speed = 1000;
    if(score > hi_score){
        hi_score = score;
        updateHi_Score();
    }
    score = 0;
    PlayBgm();
}
init();

// キャンバスのサイズ
const screen_w = block_size * field_col;
const screen_h = block_size * field_row;

can.width = screen_w;
can.height = screen_h;

// キャンバスの枠を表示
can.style.border = "4px solid #555";

// ブロックを一つ描画する
function drawBlock(x, y, color) {
    // 描画する座標
    let plint_x = x * block_size;
    let plint_y = y * block_size;
    // 色を付ける
    con.fillStyle = color;
    con.fillRect(plint_x, plint_y, block_size, block_size);
    // 枠線をつける
    con.strokeStyle = "black";
    con.strokeRect(plint_x, plint_y, block_size, block_size);
}

// テトロミノを描画する処理
function drawTetro() {
    for (let y = 0; y < tetoro_size; y++) {
        for (let x = 0; x < tetoro_size; x++) {
            if (tetoro.shape[y][x] == 1) {
                drawBlock(tetoro_x + x, tetoro_y + y, tetoro.color);
            }
        }
    }
}

// フィールドの表示
function drawField() {
    con.clearRect(0, 0, screen_w, screen_h);

    for (let y = 0; y < field_row; y++) {
        for (let x = 0; x < field_col; x++) {
            if (field[y][x].value == 1) {
                drawBlock(x, y, field[y][x].color);
            }
        }
    }
    drawGrid(); // 桝目を描画
}

// 桝目を描画する処理
function drawGrid() {
    con.strokeStyle = "lightgrey";
    con.lineWidth = 1;

    // 横の線を描画
    for (let y = 0; y <= field_row; y++) {
        con.beginPath();
        con.moveTo(0, y * block_size);
        con.lineTo(screen_w, y * block_size);
        con.stroke();
    }

    // 縦の線を描画
    for (let x = 0; x <= field_col; x++) {
        con.beginPath();
        con.moveTo(x * block_size, 0);
        con.lineTo(x * block_size, screen_h);
        con.stroke();
    }
}

// ブロックの衝突判定
function checkMove(mx, my, nTetoro = tetoro.shape) {
    for (let y = 0; y < tetoro_size; y++) {
        for (let x = 0; x < tetoro_size; x++) {
            let nx = tetoro_x + mx + x;
            let ny = tetoro_y + my + y;

            if (nTetoro[y][x]) {
                // 移動先にブロックがあったり画面外なら移動できなくする
                if (ny < 0 || nx < 0 || ny >= field_row || nx >= field_col || field[ny][nx].value) {
                    return false;
                }
            }
        }
    }
    return true;
}

// テトロミノを右回転させる処理
function rightRotate() {
    let nTetoro = [];

    for (let y = 0; y < tetoro_size; y++) {
        nTetoro[y] = [];
        for (let x = 0; x < tetoro_size; x++) {
            nTetoro[y][x] = tetoro.shape[tetoro_size - x - 1][y];
        }
    }

    return { shape: nTetoro, color: tetoro.color };
}

// テトロミノを左回転させる処理
function leftRotate() {
    let nTetoro = [];

    for (let y = 0; y < tetoro_size; y++) {
        nTetoro[y] = [];
        for (let x = 0; x < tetoro_size; x++) {
            nTetoro[y][x] = tetoro.shape[x][tetoro_size - y - 1];
        }
    }

    return { shape: nTetoro, color: tetoro.color };
}

// テトロミノを移動させる処理
function moveTetoro(dx, dy) {
    if (checkMove(dx, dy)) {
        tetoro_x += dx;
        tetoro_y += dy;
        playSound("moveSound");
    }
}

// テトロミノを回転させる処理
function rotateTetoro(clockwise) {
    let nTetoro = clockwise ? rightRotate() : leftRotate();
    if (checkMove(0, 0, nTetoro.shape)) {
        tetoro = nTetoro;
        playSound("moveSound");
    }
}

// テトロミノを一瞬で下に移動させる処理
function instantDrop() {
    let dropHeight = 0;
    while (checkMove(0, dropHeight + 1)) {
        dropHeight++;
    }

    tetoro_y += dropHeight;
    fixTetoro();
    clearLines();
    tetoro = createNewTetoro();
    tetoro_y = 0;
    tetoro_x = Math.floor(field_col / 2) - 2;

    if (!checkMove(0, 0)) {
        playSound("gameoverSound");
        alert("Game Over");
        init();
    }

    drawField();
    drawTetro();
}

// テトロミノをフィールドに固定する処理
function fixTetoro() {
    for (let y = 0; y < tetoro_size; y++) {
        for (let x = 0; x < tetoro_size; x++) {
            if (tetoro.shape[y][x]) {
                field[tetoro_y + y][tetoro_x + x] = { value: 1, color: tetoro.color };
            }
        }
    }
    playSound("dropSound");
}

//ブロックを消す処理
function clearLines() {
    let linesCleared = 0;

    for (let y = field_row - 1; y >= 0; y--) {
        let fullLine = true;
        for (let x = 0; x < field_col; x++) {
            if (field[y][x].value === 0) {
                fullLine = false;
                break;
            }
        }
        if (fullLine) {
            // 一行削除
            for (let ny = y; ny > 0; ny--) {
                for (let nx = 0; nx < field_col; nx++) {
                    field[ny][nx] = field[ny - 1][nx];
                }
            }
            for (let nx = 0; nx < field_col; nx++) {
                field[0][nx] = { value: 0, color: null };
            }

            linesCleared++; // 行が消えた回数をカウント
            y++; // 行が消えたので、再チェック
            playSound("lineClearSound");
        }
    }

    if (linesCleared > 0) {
        // 消した行数に応じてスコアを加算
        let scoreToAdd = 100 * Math.pow(2, linesCleared - 1) * 3.14 * linesCleared;
        addScore(scoreToAdd);
    }
}


// テトロミノが落ちる処理
function dropTetoro() {
    if (checkMove(0, 1)) {
        tetoro_y++;
    } else {
        fixTetoro();
        clearLines();
        tetoro = createNewTetoro();
        tetoro_y = 0;
        tetoro_x = Math.floor(field_col / 2) - 2;
        if (!checkMove(0, 0)) {
            playSound("gameoverSound");
            alert("Game Over");
            init();
        }
    }
}

// ページが読み込まれたときにBGMを再生する
window.onload = function() {
    PlayBgm();
};

function PlayBgm(){
    const bgm = document.getElementById('bgm');
    bgm.volume = 0.5; // 音量を調整する（0.0から1.0まで）
    bgm.play();
}

//効果音を鳴らす
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0; // 再生位置をリセット
    sound.play();

}

// ゲームのタイマーを設定する
let lastUpdate = 0;
function gameLoop(timestamp) {
    if (timestamp - lastUpdate >= game_speed) {
        dropTetoro();
        lastUpdate = timestamp;
    }
    drawField();
    drawTetro();
    requestAnimationFrame(gameLoop);
}

// ゲームのタイマーを設定する
requestAnimationFrame(gameLoop);

// ゲームのタイマーを更新する処理
function updateGameSpeed() {
    game_speed *= speedDecreaseFactor;
}

// ゲームのタイマーを設定する
setInterval(updateGameSpeed, speedIncreaseInterval);

// テトロミノの操作処理
document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37: // 左
        case 65: // A
            moveTetoro(-1, 0);
            break;
        case 39: // 右
        case 68: // D
            moveTetoro(1, 0);
            break;
        case 40: // 下
        case 83: // S
            moveTetoro(0, 1);
            break;
        case 75: // K 右回転
            rotateTetoro(true);
            break;
        case 74: // J 左回転
            rotateTetoro(false);
            break;
        case 87: // W 一瞬で下に移動
            instantDrop();
            break;
    }
    drawField();
    drawTetro();
};
