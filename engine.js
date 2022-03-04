"use strict"

let map = document.querySelector(".container table");
map.style.top = '0px';
map.style.left = '0px';

let moveSpeed = 1;
let updateSpeed = 1000/60;
let moveAction = 0;

function mapLeft() {
    return parseInt(map.style.left.replace('px', ''));
}

function setMapLeft(val) {
    map.style.left = val + 'px';
}

function mapTop() {
    return parseInt(map.style.top.replace('px', ''));
}

function setMapTop(val) {
    map.style.top = val + 'px';
}

function moveAmount(dx, dy)
{
    if(moveAction)
        return;

    let targetX = mapLeft() + dx;
    let targetY = mapTop() + dy;
    let mx = moveSpeed;
    if (targetX < mapLeft())
        mx = -moveSpeed;

    let my = moveSpeed;
    if (targetY < mapTop())
        my = -moveSpeed;

    moveAction = setInterval(function () {
        if ((mx > 0 && mapLeft() >= targetX) || (mx < 0 && mapLeft() <= targetX)) {
            setMapLeft(targetX);
            mx = 0;
        } else if (mx != 0) {
            setMapLeft(mapLeft() + mx);
        }
        if ((my > 0 && mapTop() >= targetY) || (my < 0 && mapTop() <= targetY)) {
            setMapTop(targetY);
            my = 0;
        } else if (my != 0) {
            setMapTop(mapTop() + my);
        }
        if (mx === 0 && my === 0) {
            clearInterval(moveAction);
            moveAction = 0;
        }
    }, updateSpeed);
}

document.querySelector("#move_left").addEventListener("click", function() {
    moveAmount(64, 0);
});

document.querySelector("#move_right").addEventListener("click", function() {
    moveAmount(-64, 0);
});

document.querySelector("#move_up").addEventListener("click", function() {
    moveAmount(0, 64);
});

document.querySelector("#move_down").addEventListener("click", function() {
    moveAmount(0, -64);
});