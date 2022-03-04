"use strict"

let mapView = document.querySelector("div.map-container");
let map = document.querySelector("table.map");
map.style.top = '0px';
map.style.left = '0px';

let tileDim = 64;

let moveSpeed = 6;
let updateSpeed = 1000/60;
let moveAction = 0;

function createMap() {
    let mapX = 60.0;
    let mapY = 40.0;

    for(var y = 0.0; y < mapY; y++) {
        let tr = document.createElement("tr");
        for(var x = 0.0; x < mapX; x++) {
            let td = document.createElement("td");
            let noise = (perlin.get(x/mapX*10.0, y/mapY*10.0)+1.0)*0.5;
            if (noise < 0.5) {
                td.classList.add("terrain-ocean");
            } else if (noise < 0.7) {
                td.classList.add("terrain-grass");
            } else if (noise < 0.8) {
                td.classList.add("terrain-forest");
            } else {
                td.classList.add("terrain-mountains");
            }
            tr.appendChild(td);
        }
        map.appendChild(tr);
    }
}
createMap();

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

document.querySelector("div.map-container").addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

document.querySelector("table.map").addEventListener("contextmenu", function(e) {
    e.preventDefault();
    let td = e.target;
    centreOn(td.offsetLeft, td.offsetTop);
});