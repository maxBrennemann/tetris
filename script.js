class Canvas {
    constructor(x, y, className) {
        this.canvas = (new CanvasCreation()).createHiDPICanvas(x, y);
        this.sizeX = x;
        this.sizeY = y;

        if (className != null) {
            this.canvas.classList.add(className);
        }

        this.canvasContext = this.canvas.getContext("2d");
    }

    drawCircle(xCoordinate, yCoordinate, radius, fillColor, lineWidth, lineColor) {
        this.canvasContext.beginPath();
        this.canvasContext.arc(xCoordinate, yCoordinate, radius, 0, 2 * Math.PI);
        if (fillColor != "unset") {
            this.canvasContext.fillStyle = fillColor;
            this.canvasContext.fill();
        }
        this.canvasContext.lineWidth = lineWidth;
        this.canvasContext.strokeStyle = lineColor;
        this.canvasContext.stroke();
    }

    drawLine(xStart, yStart, xEnd, yEnd) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(xStart, yStart);
        this.canvasContext.lineTo(xEnd, yEnd);
        this.canvasContext.strokeStyle = "#000000";
        this.canvasContext.stroke();
    }

    drawRectangle(xPos, yPos, xWidth, yHeight, color) {
        this.canvasContext.beginPath();
        this.canvasContext.fillStyle = color;
        this.canvasContext.lineWidth = 0;
        //this.canvasContext.strokeStyle = color;
        this.canvasContext.fillRect(xPos, yPos, xWidth, yHeight);
        this.canvasContext.stroke();
    }

    getMousePos(evt) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    clear() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    attachToPage(anchor) {
        if (anchor == null || anchor == undefined) {
            document.body.appendChild(this.canvas);
        } else {
            document.querySelector(anchor).appendChild(this.canvas);
        }
    }

}

var CanvasCreation = function() {}

/* https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas */
CanvasCreation.prototype.PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

CanvasCreation.prototype.createHiDPICanvas = function(w, h, ratio) {
    if (!ratio) { ratio = this.PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
var getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Game class */
var Game = function(canvas) {
    this.isContinuing = true;
    this.tiles =  [];
    this.canvas = canvas;
    this.tileGroup = new TileGroup(this);
    this.setDropNew = false;
    this.init = function() {
        let width = 10;
        let height = 20;
        let tile_size = 25;
        for (let i = 0; i < width; i++) {
            this.tiles.push([]);
            for (let n = 0; n < height; n++) {
                this.tiles[i].push(new Tile(i * tile_size, n * tile_size, tile_size, this));
            }
        }
    };
}

Game.prototype.startGame = function() {
    this.tileGroup.drop();
    window.requestAnimationFrame(g.loop);
}

Game.prototype.loop = function() {
    if (g.setDropNew) {
        g.tileGroup = new TileGroup(g);
        g.tileGroup.drop();
        g.setDropNew = false;
    }
    switch(keys) {
        case "ArrowLeft":
            g.tileGroup.changeXPos(-1);
        break;
        case "ArrowRight":
            g.tileGroup.changeXPos(+1);
        break; 
    }
    keys = "";

    window.requestAnimationFrame(g.loop);
}

Game.prototype.getRandomTile = function() {

}

var formCodes = [
    [[0,0], [0,1], [-1, 0], [-1, 1]],  // square
    [[0,0], [0,1], [0, 2], [-1, 2]],    // left side L
    [[0,0], [0,1], [0,2], [1, 2]],      // right side L
    [[0,0], [-1, 1], [0, 1], [1, 1]],  // pyramide
    [[0,0], [1, 0], [0, 1], [-1,1]],    // right side Z
    [[0,0], [-1, 0], [0, 1], [1,1]],    // left side Z
    [[0,0], [0,1], [0,2], [0,3]]        // line
];

/* TileGroup class */
var TileGroup = function(parent) {
    this.init = function() {
        var randomFormCode = formCodes[getRandomInt(0, formCodes.length)];
        console.log(randomFormCode);
        return randomFormCode;
    };
    this.formCode = this.init();
    this.yPos = 0;
    this.xPos = 5;
    this.drawBuffer = [];
    this.parent = parent == undefined ? g : parent;
}

TileGroup.prototype.changeXPos = function(num) {
    if (isNaN(num))
        return false;
    let tempPos = this.xPos + num;
    if (this.validatePosition(tempPos)) {
        this.xPos = tempPos;
        this.draw();
    } else
        return false;
}

TileGroup.prototype.changeYPos = function(num) {
    if (isNaN(num))
        return false;
    /*let tempPos = this.yPos + num;
    if (this.validatePosition(this.xPos, tempPos)) {
        this.yPos = tempPos;
        this.draw();
    } else
        return false;*/
    this.yPos += num;
}

/* https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop */
TileGroup.prototype.drop = async function() {
    // Returns a Promise that resolves after "ms" Milliseconds
    function timer(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
    
    // We need to wrap the loop into an async function for this to work
    while(this.validatePosition()) {
        this.draw();
        this.changeYPos(1);
        await timer(500);
    }

    /* wird um eins verringert, weil es zum Zeitpunkt der Schleifenvollendung zu groß ist */
    this.yPos--;
    this.set();
}

TileGroup.prototype.validatePosition = function(x, y) {
    if (x == undefined)
        x = this.xPos;
    if (y == undefined)
        y = this.yPos;
    
    let tempX, tempY
    for (let i = 0; i < this.formCode.length; i++) {
        tempX = this.formCode[i][0] + x;
        tempY = this.formCode[i][1] + y;
        console.log(tempX);
        if (tempX < 0 || tempX >= 10) {
            return false;
        }
        if (tempY < 0 || tempY >= 20) {
            return false;
        }
    }

    /* no need to check for out of bounds, this is done in the upper loop */
    for (let i = 0; i < this.formCode.length; i++) {
        tempX = this.formCode[i][0] + x;
        tempY = this.formCode[i][1] + y;
        if (this.parent.tiles[tempX][tempY].isSet == true)
            return false;
    }

    return true;
}

TileGroup.prototype.isDroppable = function() {
    function hasReachedEnd(context) {
        let isDroppable = true;
        for (let i = 0; i < context.formCode.length; i++) {
            if (context.formCode[i][1] + context.yPos >= 20) {
                isDroppable = false;
            }
        }
        return isDroppable;
    }

    function collides(context) {
        let collides = false;
        for (let i = 0; i < context.formCode.length; i++) {
            let xTile = context.formCode[i][0] + context.xPos;
            let yTile = context.formCode[i][1] + context.yPos;
            if (context.parent.tiles[xTile][yTile].isSet == true) {
                collides = true;
            }
        }
        return collides;
    }

    if (hasReachedEnd(this))
        return !collides(this);
    else
        return false;
}

TileGroup.prototype.set = function() {
    for (let i = 0; i < this.formCode.length; i++) {
        let xTile = this.formCode[i][0] + this.xPos;
        let yTile = this.formCode[i][1] + this.yPos;
        this.parent.tiles[xTile][yTile].isSet = true;
    }
    this.parent.setDropNew = true;
}

TileGroup.prototype.spawn = function() {

}

TileGroup.prototype.draw = function() {
    function bufferIncludes(buffer, element) {
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i][0] == element[0] && buffer[i][1] == element[1]) {
                return true;
            }
        }
        return false;
    }

    let tempbuffer = [];
    let removeBuffer = [];
    for (let i = 0; i < this.formCode.length; i++) {
        let x = this.formCode[i][0] + this.xPos;
        let y = this.formCode[i][1] + this.yPos;
        if (!bufferIncludes(this.drawBuffer, [x, y])) {
            this.parent.tiles[x][y].draw();
        }
        tempbuffer.push([x, y]);
    }

    for (let i = 0; i < this.drawBuffer.length; i++) {
        if (!bufferIncludes(tempbuffer, this.drawBuffer[i])) {
            removeBuffer.push(this.drawBuffer[i]);
        }
    }
    this.drawBuffer = tempbuffer;

    while(removeBuffer.length > 0) {
        this.parent.tiles[removeBuffer[0][0]][removeBuffer[0][1]].draw("white");
        removeBuffer.shift();
    }
}

/* direction 1 rotates 90deg right, direction -1 rotates 90deg left */
TileGroup.prototype.rotate = function(direction) {
    if (direction == 1) {
        for (let i = 0; i < this.formCode.length; i++) {
            let temp = this.formCode[i][1];
            this.formCode[i][1] = this.formCode[i][0];
            this.formCode[i][0] = temp;
        }
    } else if (direction == -1) {

    } else {
        console.log("invalid input");
    }
}

/* Tile class */
var Tile = function(x, y, tile_size, parent) {
    this.x = x;
    this.y = y;
    this.tileSize = tile_size;
    this.parent = parent;
    this.color = "black";
    this.isSet = false;
}

Tile.prototype.draw = function(color) {
    if (color == undefined)
        color = this.color;
    this.parent.canvas.drawRectangle(this.x, this.y, this.tileSize, this.tileSize, color);
}

/* global varaibles and functions in global scope */
var canv = new Canvas(250, 500);
var g;
var keys;

var onPageLoad = function() {
    canv.attachToPage();
    g = new Game(canv);
    g.init();
}

if( document.readyState !== 'loading' ) {
    console.log( 'document is already ready, just execute code here' );
    onPageLoad();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        console.log( 'document was not ready, place code here' );
        onPageLoad();
    });
}

// test
var test = function(formCode) {
    g.canvas.clear();
    var code = formCodes[formCode];
    var tileG = new TileGroup();
    tileG.formCode = code;
    tileG.draw();
}

document.addEventListener("keydown", function(event) {
    event = event || window.event;
    if (event.key) {
        keys = event.key;
        console.log(event.key);
    }
}, false);
