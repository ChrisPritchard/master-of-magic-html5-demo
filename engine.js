"use strict"

let mapIndex = [];

let mapView = document.querySelector("div.map-container");
let map = document.querySelector("table.map");
map.style.top = '0px';
map.style.left = '0px';

let minimap = document.querySelector("div.minimap canvas").getContext("2d");

let tileDim = 64;
let miniDim = 2;

let moveSpeed = 6;
let updateSpeed = 1000/60;
let moveAction = 0;

function renderMinimap() {
    for (let y = 0; y < mapIndex.length; y++) {
        for (let x = 0; x < mapIndex[y].length; x++) {
            let tid = mapIndex[y][x];
            if (tid === 0) {
                minimap.fillStyle = 'darkblue';
            } else if (tid == 1) {
                minimap.fillStyle = 'green';
            } else if (tid == 2) {
                minimap.fillStyle = 'darkgreen';
            } else {
                minimap.fillStyle = 'grey';
            }
            minimap.fillRect(x*miniDim, y*miniDim, miniDim, miniDim);
        }
    }
    minimap.strokeStyle = "white";
    minimap.strokeRect(
        (-mapLeft()/tileDim)*miniDim,
        (-mapTop()/tileDim)*miniDim,
        (mapView.clientWidth/tileDim)*miniDim,
        (mapView.clientHeight/tileDim)*miniDim);
}

function createMap() {
    let mapX = 60.0;
    let mapY = 40.0;

    for(let y = 0.0; y < mapY; y++) {
        let tr = document.createElement("tr");
        let mapRow = [];
        for(let x = 0.0; x < mapX; x++) {
            let td = document.createElement("td");
            let tex = document.createElement("div");
            let noise = (perlin.get(x/mapX*10.0, y/mapY*10.0)+1.0)*0.5;
            if (noise < 0.5) {
                td.classList.add("terrain-grass");
                tex.classList.add("terrain-ocean");
                mapRow.push(0);
            } else if (noise < 0.7) {
                td.classList.add("terrain-ocean");
                tex.classList.add("terrain-grass");
                mapRow.push(1);
            } else if (noise < 0.8) {
                td.classList.add("terrain-grass");
                tex.classList.add("terrain-forest");
                mapRow.push(2);
            } else {
                td.classList.add("terrain-forest");
                tex.classList.add("terrain-mountains");
                mapRow.push(3);
            }
            td.setAttribute("data-pos", x+","+y)
            td.appendChild(tex);
            tr.appendChild(td);
        }
        map.appendChild(tr);
        mapIndex.push(mapRow);

        // issues:
        // water diagonally opposite water: should curve land but not water
        // land against trees: should underlay trees not water
        // other odd corner combos
    }

    for(let y = 0; y < mapY; y++) {
        for(let x = 0; x < mapX; x++) {
            let curr = mapIndex[y][x]
            let radius = "";
            if (x > 0 && y > 0 && mapIndex[y][x-1] !== curr && mapIndex[y-1][x] !== curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            if(y > 0 && x < mapX-1 && mapIndex[y-1][x] !== curr && mapIndex[y][x+1] !== curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            if(x < mapX-1 && y < mapY-1 && mapIndex[y][x+1] !== curr && mapIndex[y+1][x] !== curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            if(y < mapY-1 && x > 0 && mapIndex[y+1][x] !== curr && mapIndex[y][x-1] !== curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            let cell = document.querySelector("[data-pos='"+x+","+y+"'] div")
            cell.style.borderRadius = radius;
        }
    }

    renderMinimap();
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
            renderMinimap();
        }
    }, updateSpeed);
}

function moveToCentreOn(tx, ty) {
    let targetX = (mapView.clientWidth / 2 - tileDim / 2) - tx;
    let targetY = (mapView.clientHeight / 2 - tileDim / 2) - ty;
    let moveX = targetX - mapLeft();
    let moveY = targetY - mapTop();
    moveAmount(moveX, moveY);
}

function centreOnCursor(e) {
    let targetX = (mapView.clientWidth / 2 - tileDim / 2) - (e.offsetX / miniDim)*tileDim;
    let targetY = (mapView.clientHeight / 2 - tileDim / 2) - (e.offsetY / miniDim)*tileDim;
    setMapLeft(targetX);
    setMapTop(targetY);
    renderMinimap();
}

document.querySelector("div.map-container").addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

document.querySelector("table.map").addEventListener("contextmenu", function(e) {
    e.preventDefault();
    let td = e.target;
    moveToCentreOn(td.offsetLeft, td.offsetTop);
});

document.querySelector("div.minimap canvas").addEventListener("click", centreOnCursor);
document.querySelector("div.minimap canvas").addEventListener("contextmenu", function(e) {
    e.preventDefault();
    centreOnCursor(e);
});

let textureCanvas = document.createElement("canvas");
textureCanvas.width = 50;
textureCanvas.height = 50;
let textureContext = textureCanvas.getContext("2d");
for (let x = 0; x < textureCanvas.width; x++) {
    for (let y = 0; y < textureCanvas.height; y++) {
        let xv = Math.floor(x/5)/textureCanvas.width*25;
        let yv = Math.floor(y/5)/textureCanvas.height*25;
        let noise = (perlin.get(xv,yv)+1)/2;
        let val = parseInt(noise*20)*13;
        textureContext.fillStyle = `rgba(${val},${val},${val})`;
        textureContext.fillRect(x, y, 1, 1);
    }
}
let background = `url(${textureCanvas.toDataURL()})`;

let computed = document.createElement("style");
computed.innerText = `table.main-container { background-image: ${background}; }\nbutton { background-image: ${background}; }`
document.body.appendChild(computed);