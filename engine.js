"use strict"

let mapView = document.querySelector("div.container");
let map = document.querySelector("div.container table");
map.style.top = '0px';
map.style.left = '0px';

let tileDim = 64;

let moveSpeed = 6;
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

function centreOn(tx, ty) {
    let targetX = (mapView.clientWidth / 2 - tileDim / 2) - tx;
    let targetY = (mapView.clientHeight / 2 - tileDim / 2) - ty;
    let moveX = targetX - mapLeft();
    let moveY = targetY - mapTop();
    moveAmount(moveX, moveY);
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

document.querySelector("div.container table").addEventListener("contextmenu", function(e) {
    e.preventDefault();
    let td = e.target;
    centreOn(td.offsetLeft, td.offsetTop);
});