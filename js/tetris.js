const start = document.getElementById('start');
const pause = document.getElementById('pause');
const cellbox = document.getElementById('grid__cellbox');
const time = document.getElementById('time');
const score = document.getElementById('score');
const level = document.getElementById('level');
const sound = document.getElementById('sound');
const next = document.getElementById('next');
const nextcellbox = document.getElementById('next__cellbox');
const keyboard = document.querySelectorAll('.keyboard__btn');
//記錄所有形狀
let tetris = {
    blocks:  [
                {
                    name: 'O_type',
                    shape: [
                                [[0,-1], [1,-1],[0,0],[1,0]]
                            ]
                },
                {
                    name: 'L_type',
                    shape: [
                                [[-1,-1],[0,-1],[0,0],[0,1]],
                                [[1,-1],[-1,0],[0,0],[1,0]],
                                [[0,-1],[0,0],[0,1],[1,1]],
                                [[-1,0],[0,0],[1,0],[-1,1]]
                            ]
                },
                {
                    name: 'L_type_reverse',
                    shape: [
                                [[0,-1],[1,-1],[0,0],[0,1]],
                                [[-1,0],[0,0],[1,0],[1,1]],
                                [[0,-1],[0,0],[-1,1],[0,1]],
                                [[-1,-1],[-1,0],[0,0],[1,0]]
                            ]
                },
                {
                    name: 'T_type',
                    shape: [
                                [[0,-1],[-1,0],[0,0],[1,0]],
                                [[0,-1],[0,0],[1,0],[0,1]],
                                [[-1,0],[0,0],[1,0],[0,1]],
                                [[0,-1],[-1,0],[0,0],[0,1]]
                            ]
                },
                {
                    name: 'Z_type',
                    shape: [
                                [[-1,-1],[0,-1],[0,0],[1,0]],
                                [[1,-1],[0,0],[1,0],[0,1]]
                            ]
                },
                {
                    name: 'Z_type_reverse',
                    shape: [
                                [[0,-1],[1,-1],[-1,0],[0,0]],
                                [[0,-1],[0,0],[1,0],[1,1]]
                            ]
                },
                {
                    name: 'I_type',
                    shape: [
                                [[-1,0],[0,0],[1,0],[2,0]],
                                [[0,-2],[0,-1],[0,0],[0,1]]
                            ]
                }
            ]

};
//開始遊戲事件
start.addEventListener('click', function() {
    reset(start_game);
}, false);
//random決定下一個方塊
function random() {
    return tetris.blocks[Math.ceil(Math.random() * tetris.blocks.length) - 1];
};
//清空版面 and data重製
function reset(callback) {
    clearInterval(tetris.moveTimer);
    clearInterval(tetris.gameTimer);
    tetris.nextBlock = random();
    tetris.blockArr = [];
    tetris.baseArr = [];
    tetris.leftWall = [];
    tetris.rightWall = [];
    tetris.userScore = 0;
    tetris.level = 1;
    tetris.row = 10;
    tetris.col = 20;
    nextcellbox.innerHTML = '';
    next.classList.remove('next--start');
    cellbox.innerHTML = '';
    cellbox.classList.remove('grid__cellbox--start');
    time.innerHTML = '';
    score.innerHTML = '';
    level.innerHTML = '';
    document.removeEventListener('keydown', keyDownEvent, false);
    document.removeEventListener('keyup', keyUpEvent, false);
    keyboard.forEach(function(element) {
        element.removeEventListener('click', keyUpEvent, false);
    });
    if (typeof callback ==='function') {
        callback();
    }
};
//開始遊戲
function start_game () {
    let cellHTML = '';
    let nextHTML = '';
    for (let i = 1; i <= tetris.row * tetris.col; i++) {
        cellHTML += '<div class="grid__cell"></div>';
    }
    for (let i = 1; i <= 25; i++) {
        nextHTML += '<div class="grid__cell"></div>';
    }
    next.classList.add('next--start');
    nextcellbox.innerHTML = nextHTML;
    nextcellbox.style.maxWidth = document.querySelector('.next__cellbox .grid__cell').offsetWidth * 5 + 'px';
    cellbox.classList.add('grid__cellbox--start');
    cellbox.innerHTML = cellHTML;
    cellbox.style.maxWidth = document.querySelector('.grid__cellbox .grid__cell').offsetWidth * tetris.row + 'px';
    time.innerHTML = '遊戲時間:0小時0分鐘0秒鐘';
    score.innerHTML = '分數:0';
    level.innerHTML = '等級:1';
    tetris.startTime = new Date();
    tetris.gameTimer = setInterval(function() {
        gameTime(new Date() - tetris.startTime);
    }, 1000);
    tetris.moveTimer = setInterval(function() {
        move(40);
    }, 500);
    tetris.keyDownStatus = false;
    tetris.cell = document.querySelectorAll('.grid__cellbox .grid__cell');
    tetris.nextCell = document.querySelectorAll('.next__cellbox .grid__cell');
    tetris.nextArea = {
        centerPoint: [2,2],
        row: 5
    };
    for (let i = 0; i < tetris.col - 1; i++) {
        tetris.leftWall.push(i * tetris.row);
        tetris.rightWall.push((i + 1) * tetris.row - 1);
    }
    //按鍵事件
    document.addEventListener('keydown', keyDownEvent, false);
    document.addEventListener('keyup', keyUpEvent, false);
    keyboard.forEach(function(element) {
        element.addEventListener('click', keyboardEvent, false);
    });
    new_block();
}
//遊戲時間計算
function gameTime(initTime) {
    let timeDistance = initTime;
    let hourUnit = 3600000;
    let minuteUnit = 60000;
    let secondUnit = 1000;
    let levelUnit = minuteUnit;
    let level = Math.ceil(timeDistance / levelUnit);
    let hour = Math.floor(timeDistance / hourUnit);
    timeDistance = timeDistance % hourUnit;
    let min = Math.floor(timeDistance / minuteUnit);
    timeDistance = timeDistance % minuteUnit;
    let sec = Math.floor(timeDistance / secondUnit);
    time.innerHTML = '遊戲時間:' + hour + '小時' + min + '分鐘' + sec + '秒鐘';
    if (level != tetris.level && level <= 9) {
        level_switch(level);
    }
}
//level切換
function level_switch(newLevel) {
    let speed = 500 - ((newLevel - 1) * 55);
    tetris.level = newLevel;
    clearInterval(tetris.moveTimer);
    tetris.moveTimer = setInterval(function() {
        move(40);
    }, speed);
    level.innerHTML = '等級:' + newLevel;
}
//創建新方塊
function new_block() {
    tetris.centerPoint = [4,0];
    tetris.currentBlock = tetris.nextBlock;
    tetris.currentBlock.shapeIndex = 0;
    let drawBlockArr = coordinateToIndex(tetris.centerPoint, tetris.currentBlock.shape[tetris.currentBlock.shapeIndex],tetris.row);
    let newBlockChecker = new_block_checker();
    if (newBlockChecker) {
        draw_block(drawBlockArr);
        tetris.nextBlock = random();
        nextBlock(tetris.nextBlock);
    } else {
        GG();
    }
};
//下一個方塊
function nextBlock(nextBlock) {
    let nextBlockShape = nextBlock.shape[0];
    let drawNextBlockArr = coordinateToIndex(tetris.nextArea.centerPoint,nextBlockShape,tetris.nextArea.row);
    tetris.nextCell.forEach(function(element, index) {
        if (drawNextBlockArr.indexOf(index) == -1) {
            element.removeAttribute('style');
        } else {
            element.style.backgroundColor = 'red';
        }
    });
};
//將座標系統轉成index系統
function coordinateToIndex(coordinateCenterPoint, coordinateShapeArr, row) {
    let centerPoint = coordinateCenterPoint[0] + coordinateCenterPoint[1] * row;
    let indexArr = [];
    coordinateShapeArr.forEach(function(element) {
        indexArr.push(centerPoint + element[0] + element[1] * row);
    });
    return indexArr;
};
//創建新方塊時 檢查是否game over
function new_block_checker() {
    let new_block_checker_result = true;
    tetris.baseArr.forEach(function(element) {
        if (element >= 3 && element <= 6) {
            new_block_checker_result = false;
            return false;
        }
    });
    return new_block_checker_result;
}
//方塊繪製
function draw_block(drawBlockArr) {
    tetris.blockArr.forEach(function(element) {
         if (element >= 0) {
            tetris.cell[element].removeAttribute('style');
        }
    });
    tetris.blockArr = [];
    drawBlockArr.forEach(function(element) {
        tetris.blockArr.push(element);
        if (element >= 0) {
            tetris.cell[element].style.backgroundColor = 'red';
        }
    });
};
//方塊移動
function move (code) {
    switch (code) {
        case 37:
            (function() {
                let newArr = tetris.blockArr.map(function(element){
                    return element - 1;
                });
                let wallDetection = collision(tetris.blockArr, tetris.leftWall);
                let collisionCheck = collision(newArr, tetris.baseArr);
                if (wallDetection && collisionCheck) {
                    tetris.centerPoint[0] --;
                    let drawBlockArr = coordinateToIndex(tetris.centerPoint,tetris.currentBlock.shape[tetris.currentBlock.shapeIndex],tetris.row);
                    draw_block(drawBlockArr);
                }
            })();
            break;
        case 38:
            block_spin(tetris.currentBlock.shapeIndex);
            tetris.keyDownStatus = true;
            break;
        case 39:
            (function() {
                let newArr = tetris.blockArr.map(function(element){
                    return element + 1;
                });
                let wallDetection = collision(tetris.blockArr, tetris.rightWall);
                let collisionCheck = collision(newArr, tetris.baseArr);
                if (wallDetection && collisionCheck) {
                    tetris.centerPoint[0] ++;
                    let drawBlockArr = coordinateToIndex(tetris.centerPoint,tetris.currentBlock.shape[tetris.currentBlock.shapeIndex],tetris.row);
                    draw_block(drawBlockArr);
                }
            })();
            break;
        case 40:
            (function() {
                let newArr = tetris.blockArr.map(function(element) {
                    return element + 10;
                });
                let collisionCheck = collision(newArr, tetris.baseArr);
                if (collisionCheck) {
                    tetris.centerPoint[1] ++;
                    let drawBlockArr = coordinateToIndex(tetris.centerPoint,tetris.currentBlock.shape[tetris.currentBlock.shapeIndex],tetris.row);
                    draw_block(drawBlockArr);
                    // audio_player('sounds/move_sound.mp3');
                } else {
                    base_stacking(tetris.blockArr);
                }
            })();
            break;
        case 32:
            (function() {
                block_falling();
                tetris.keyDownStatus = true;
            })();
            break;
    }
}
//方塊旋轉
function block_spin(oldShapeIndex) {
    let newShapeIndex = 0;
    if (tetris.currentBlock.shapeIndex != tetris.currentBlock.shape.length - 1) {
         newShapeIndex = tetris.currentBlock.shapeIndex + 1;
    }
    let collisionCheck = collision(coordinateToIndex(tetris.centerPoint,tetris.currentBlock.shape[newShapeIndex],tetris.row), tetris.baseArr);
    let spinCheck = block_spin_checker(tetris.centerPoint,tetris.currentBlock.shape[newShapeIndex]);
    if (collisionCheck && spinCheck) {
        tetris.currentBlock.shapeIndex = newShapeIndex;
        let drawBlockArr = coordinateToIndex(tetris.centerPoint,tetris.currentBlock.shape[tetris.currentBlock.shapeIndex],tetris.row);
        draw_block(drawBlockArr);
        // audio_player('sounds/spin_sound.mp3');
    }
}
//方塊旋轉碰撞檢查
function block_spin_checker(centerPoint, shape) {
    let tetrisX = centerPoint[0];
    let spinResult = true;
    shape.forEach(function(element) {
        if (element[0] + tetrisX < 0 || element[0] + tetrisX > tetris.row - 1) {
            spinResult = false;
            return false;
        }
    });
    return spinResult;
}
//檢查碰撞
function collision(arr, compareArr) {
    let collisionStatus = true;
    arr.forEach(function(element) {
        if (compareArr.indexOf(element) != -1 || element >= tetris.cell.length) {
            collisionStatus = false;
        }
    });
    return collisionStatus;
}
//方塊落下
function block_falling() {
    let newArr = tetris.blockArr.map(function(element) {
        return element + 10;
    });
    let collisionCheck = collision(newArr, tetris.baseArr);
    while (collisionCheck) {
        newArr = newArr.map(function(element) {
            return element + 10;
        });
        collisionCheck = collision(newArr, tetris.baseArr);
    };
    tetris.blockArr.forEach(function(element) {
        if (element >= 0) {
            tetris.cell[element].removeAttribute('style');
        }
    });
    tetris.blockArr = newArr.map(function(element) {
        return element - 10;
    });
    draw_block(tetris.blockArr);
    move(40);
};
//打地基
function base_stacking(stackingArr) {
    stackingArr.forEach(function(element) {
        if (element >= 0) {
            tetris.baseArr.push(element);
            tetris.cell[element].style.backgroundColor = 'black';
        }
    });
    cancellation();
    game_over(tetris.blockArr.concat(tetris.baseArr));
}
//消除方塊
function cancellation() {
    let counter = 0;
    let rowArr = [];
    let topRow = [];
    tetris.blockArr.forEach(function(element) {
        if (element >= 0 && rowArr.indexOf(Math.floor(element / tetris.row)) == -1) {
            rowArr.push(Math.floor(element / tetris.row));
        }
    });
    rowArr.forEach(function(element) {
        let start = element * tetris.row;
        let end = start + tetris.row - 1;
        let cancellationStatus = true;
        let rowBlockArr = [];
        for (let i = start; i <= end; i++) {
            rowBlockArr.push(i);
            if (tetris.baseArr.indexOf(i) == -1) {
                cancellationStatus = false;
            }
        }
        if (cancellationStatus) {
            topRow.push(element);
            counter++;
            rowBlockArr.forEach(function(element) {
                tetris.cell[element].removeAttribute('style');
                tetris.baseArr.splice(tetris.baseArr.indexOf(element),1);
            });
        }
    });
    if (counter > 0) {
        tetris.baseArr.forEach(function(element) {
            tetris.cell[element].removeAttribute('style');
        });
        console.log(topRow);
        let newBaseArr = tetris.baseArr.map(function(element) {
            console.log(Math.floor(element / tetris.row));
            if (Math.floor(element / tetris.row) < topRow[topRow.length - 1]) {
                let newTopRow = topRow.slice();
                newTopRow.push(Math.floor(element / tetris.row));
                newTopRow.sort();
                let rows = newTopRow.length - newTopRow.indexOf(Math.floor(element / tetris.row)) - 1;
                return element + (tetris.row * rows);
            } else {
                return element;
            }
        });
        tetris.baseArr = [];
        newBaseArr.forEach(function (element) {
            tetris.cell[element].style.backgroundColor = 'black';
            tetris.baseArr.push(element);
        });
        puls_score(counter);
    }
}
//計分
function puls_score (counter) {
    switch (counter) {
        case 1:
            tetris.userScore = tetris.userScore + 100;
            break;
        case 2:
            tetris.userScore = tetris.userScore + 200;
            break;
        case 3:
            tetris.userScore = tetris.userScore + 350;
            break;
        case 4:
            tetris.userScore = tetris.userScore + 500;
            break;
    }
    score.innerHTML = '分數:' + tetris.userScore;
}
//檢查是否game over
function game_over(arr) {
    arr.forEach(function(element) {
        if (element < 0) {
            GG();
            return false;
        }
    });
    tetris.blockArr = [];
    new_block();
}
//GG私密達
function GG() {
    reset();
    alert('遊戲結束, 您的分數為:' + tetris.userScore + '分!');
}
//按鍵事件
function keyDownEvent(e) {
    if (!tetris.keyDownStatus) {
        move(e.keyCode);
    }
};
function keyUpEvent() {
    tetris.keyDownStatus = false;
};
function keyboardEvent() {
    const keyCode = this.getAttribute('data-keyCode');
    move(parseInt(keyCode));
};