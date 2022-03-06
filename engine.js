"use strict"

let mapIndex = [];
let fogIndex = [];

let mapView = document.querySelector("div.map-container");
let map = document.querySelector("div.map");
let mapTable = document.querySelector("div.map table");
map.style.top = '0px';
map.style.left = '0px';

let minimap = document.querySelector("div.minimap canvas").getContext("2d");

let tileDim = 64;
let miniDim = 2;
let mapX = 60.0;
let mapY = 40.0;

let updateSpeed = 1000/60;

let mapMoveSpeed = 6;
let mapMoveAction = 0;

let unitMoveDirectSpeed = 3;
let unitMoveDiagSpeed = 2;
let unitMoveAction = 0;

function getLeft(elem) {
    return parseInt(elem.style.left.replace('px', ''));
}

function setLeft(elem, val) {
    elem.style.left = val + 'px';
}

function getTop(elem) {
    return parseInt(elem.style.top.replace('px', ''));
}

function setTop(elem, val) {
    elem.style.top = val + 'px';
}

function renderMinimap() {
    for (let y = 0; y < mapIndex.length; y++) {
        for (let x = 0; x < mapIndex[y].length; x++) {
            if (fogIndex[y][x])
                minimap.fillStyle = 'black';
            else if (y == unitY && x == unitX) {
                minimap.fillStyle = 'red';
            }
            else
            {
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
            }
            minimap.fillRect(x*miniDim, y*miniDim, miniDim, miniDim);
        }
    }
    minimap.strokeStyle = "white";
    minimap.strokeRect(
        (-getLeft(map)/tileDim)*miniDim,
        (-getTop(map)/tileDim)*miniDim,
        (mapView.clientWidth/tileDim)*miniDim,
        (mapView.clientHeight/tileDim)*miniDim);
}

function createMap() {
    for(let y = 0.0; y < mapY; y++) {
        let tr = document.createElement("tr");
        let mapRow = [];
        let fogRow = [];
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
            td.setAttribute("data-pos", x+","+y);
            td.classList.add("fog-of-war");
            tex.classList.add("fog-of-war");
            td.appendChild(tex);
            tr.appendChild(td);
            fogRow.push(true);
        }
        mapTable.appendChild(tr);
        mapIndex.push(mapRow);
        fogIndex.push(fogRow);
    }

    for(let y = 0; y < mapY; y++) {
        for(let x = 0; x < mapX; x++) {
            let curr = mapIndex[y][x] - 1
            if (curr < 0) curr = 1; // for ocean, to test against land
            let radius = "";
            if (x > 0 && y > 0 && mapIndex[y][x-1] == curr && mapIndex[y-1][x] == curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            if(y > 0 && x < mapX-1 && mapIndex[y-1][x] == curr && mapIndex[y][x+1] == curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            if(x < mapX-1 && y < mapY-1 && mapIndex[y][x+1] == curr && mapIndex[y+1][x] == curr) {
                radius += "16px "
            } else {
                radius += "0 "
            }
            if(y < mapY-1 && x > 0 && mapIndex[y+1][x] == curr && mapIndex[y][x-1] == curr) {
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

function moveAmount(dx, dy)
{
    if(mapMoveAction)
        return;

    let targetX = getLeft(map) + dx;
    let targetY = getTop(map) + dy;

    let mx = mapMoveSpeed;
    if (targetX < getLeft(map))
        mx = -mapMoveSpeed;

    let my = mapMoveSpeed;
    if (targetY < getTop(map))
        my = -mapMoveSpeed;

    mapMoveAction = setInterval(function () {
        if ((mx > 0 && getLeft(map) >= targetX) || (mx < 0 && getLeft(map) <= targetX)) {
            setLeft(map, targetX);
            mx = 0;
        } else if (mx != 0) {
            setLeft(map, getLeft(map) + mx);
        }
        if ((my > 0 && getTop(map) >= targetY) || (my < 0 && getTop(map) <= targetY)) {
            setTop(map, targetY);
            my = 0;
        } else if (my != 0) {
            setTop(map, getTop(map) + my);
        }
        if (mx === 0 && my === 0) {
            clearInterval(mapMoveAction);
            mapMoveAction = 0;
            renderMinimap();
        }
    }, updateSpeed);
}

function moveToCentreOn(pixelX, pixelY) {
    let targetX = (mapView.clientWidth / 2 - tileDim / 2) - pixelX;
    let targetY = (mapView.clientHeight / 2 - tileDim / 2) - pixelY;
    let moveX = targetX - getLeft(map);
    let moveY = targetY - getTop(map);
    moveAmount(moveX, moveY);
}

function centreOnCursor(e) {
    centreOn((e.offsetX / miniDim)*tileDim, (e.offsetY / miniDim)*tileDim);
}

function centreOn(pixelX, pixelY) {
    let targetX = (mapView.clientWidth / 2 - tileDim / 2) - pixelX;
    let targetY = (mapView.clientHeight / 2 - tileDim / 2) - pixelY;
    setLeft(map, targetX);
    setTop(map, targetY);
    renderMinimap();
}

document.querySelector("div.map-container").addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

document.querySelector("div.map table").addEventListener("contextmenu", function(e) {
    e.preventDefault();
    let td = e.target.parentElement;
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

let unitX = 20;
let unitY = 20;

let unit = document.createElement("div");
unit.classList.add("unit", "active-unit");
unit.style.top = (-(mapY*tileDim) + unitY*tileDim) + "px";
unit.style.left = (unitX*tileDim) + "px";
unit.style.zIndex = 2;
map.appendChild(unit);

centreOn(unitX*tileDim, unitY*tileDim);

function removeFogOfWar() {
    for (let dx = unitX - 2; dx <= unitX + 2; dx ++) {
        for (let dy = unitY - 2; dy <= unitY + 2; dy ++) {
            if ((dx == unitX - 2 && dy == unitY - 2)
            || (dx == unitX + 2 && dy == unitY - 2)
            || (dx == unitX - 2 && dy == unitY + 2)
            || (dx == unitX + 2 && dy == unitY + 2))
                continue; // don't unfade corners
            let tile = document.querySelector("[data-pos='"+dx+","+dy+"'] div")
            if (tile) {
                fogIndex[dy][dx] = false;
                tile.classList.remove("fog-of-war");
                tile.parentNode.classList.remove("fog-of-war");
            }
        }
    }
    renderMinimap();
}
removeFogOfWar();

function moveUnitTo(tx, ty) {
    if (unitMoveAction)
        return;

    let moveSpeed = unitMoveDiagSpeed;
    if (tx == unitX || ty == unitY) {
        moveSpeed = unitMoveDirectSpeed;
    }

    let targetX = tx*tileDim;
    let targetY = -(mapY*tileDim) + ty*tileDim;

    let mx = moveSpeed;
    if (targetX < getLeft(unit))
        mx = -moveSpeed;
    let my = moveSpeed;
    if (targetY < getTop(unit))
        my = -moveSpeed;

    unit.classList.remove("active-unit");
    moveToCentreOn(unitX * tileDim, unitY * tileDim);

    unitMoveAction = setInterval(function () {
        let currX = getLeft(unit);
        let currY = getTop(unit);
        if ((mx > 0 && currX >= targetX) || (mx < 0 && currX <= targetX)) {
            setLeft(unit, targetX);
            mx = 0;
        } else if (mx != 0) {
            setLeft(unit, currX + mx);
        }
        if ((my > 0 && currY >= targetY) || (my < 0 && currY <= targetY)) {
            setTop(unit, targetY);
            my = 0;
        } else if (my != 0) {
            setTop(unit, currY + my);
        }
        if (mx === 0 && my === 0) {
            clearInterval(unitMoveAction);
            unitMoveAction = 0;
            unitX = tx;
            unitY = ty;
            renderMinimap();
            removeFogOfWar();
            unit.classList.add("active-unit");
        }
    }, updateSpeed);
}

document.querySelector("div.map table").addEventListener("click", function(e) {
    e.preventDefault();
    let td = e.target.parentElement;
    let pos = td.getAttribute("data-pos");
    if(!pos)
        return;
    let txty = pos.split(',');
    let tx = parseInt(txty[0]);
    let ty = parseInt(txty[1]);
    if (Math.abs(tx - unitX) > 1 || Math.abs(ty - unitY) > 1)
        return;
    moveUnitTo(tx, ty);
});
