import { Shape } from './shape.js'

export class Board {
    constructor(display) {
        this.display = display; // back reference
        this.ctx = this.display.context; // drawing tool, board does all drawings for things in game
        this.width = 350; // 14 grid spaces left right
        this.height = 500; // 20 grid spaces up down
        this.xOffset = (this.display.width - this.width) / 2; // distance from left right
        this.yOffset = (this.display.height - this.height) / 2; // distance from top or bottom
        this.gridSize = 25; // size of squares
        this.xMax = this.width / this.gridSize; // furthest right squares can go
        this.yMax = this.height / this.gridSize; // furthest up squares can show
        this.squares = []; // contain all active squares
        this.nextShapes = Shape.varients.sort(() => Math.random() - 0.5); // shapes bag
        this.nextShape = new Shape(this.nextShapes.shift(), this, false);
        this.activeShape = null; // for holding the current dropping shape
        this.heldShape = null; // storate for shape
        this.cleared = 0; // score for cleared rows
        this.rowsCleared = 0;
        this.ended = false; // if game over
        this.paused = false; // if paused
    }
    
    draw() { // should draw grid and all squares on board
        this.ctx.beginPath();
        this.ctx.rect(this.xOffset, this.yOffset, this.width, this.height);
        this.ctx.strokeMany();
        this.ctx.strokeStyle = '#A0A0A0';
        this.ctx.beginPath();
        for(let i = this.gridSize; i < this.height; i += this.gridSize) {
            this.ctx.moveTo(this.xOffset, this.yOffset + i);
            this.ctx.lineTo(this.xOffset + this.width, this.yOffset + i);
        }
        for(let i = this.gridSize; i < this.width; i += this.gridSize) {
            this.ctx.moveTo(this.xOffset + i, this.yOffset);
            this.ctx.lineTo(this.xOffset + i, this.yOffset + this.height);
        }
        this.ctx.stroke();
        this.ctx.strokeStyle = '#000000';

        if(this.activeShape) {
            let shape = this.activeShape.shaddow();
            if(shape) { // draw shaddow
                for(let square of shape.squares.filter(s => s[1] < this.yMax)) {
                    this.ctx.beginPath();
                    this.ctx.rect(this.xOffset + (square[0] * this.gridSize), this.yOffset + this.height - (square[1] * this.gridSize), this.gridSize, -this.gridSize);
                    this.ctx.strokeMany();

                    this.ctx.fillStyle = '#EEEEEE';
                    this.ctx.fillRect(this.xOffset + (square[0] * this.gridSize) + 1, this.yOffset + this.height - (square[1] * this.gridSize) - 1, this.gridSize - 2, -(this.gridSize - 2));
                }
            }
        }

        this.squares.filter(square => square.y < this.yMax).forEach(this.drawSquare.bind(this)); // draw each square
    }

    next() { // moves the active shape, and spawns a new one if needed
        if(this.activeShape) {
            this.activeShape.down();
            if(!this.activeShape.canDown() && (this.activeShape.lastMoved + 300 > Date.now() || this.activeShape.waits > 5)) { // leniency for if you want to keeo moving
                let shape = this.activeShape;
                setTimeout(() => this.activeShape === shape && !shape.canDown() && shape.end(), Math.min(400, this.display.rate));
            }
        } else {
            this.clear();
            this.newShape();
        }
        if(this.squares.some(s => !s.shape && s.y > this.yMax)) this.ended = true; // end game
    }

    drawSquare(square) { // draw outline, draw colored square
        this.ctx.beginPath();
        this.ctx.rect(this.xOffset + (square.x * this.gridSize), this.yOffset + this.height - (square.y * this.gridSize), this.gridSize, -this.gridSize);
        this.ctx.strokeMany();

        this.ctx.fillStyle = square.color;
        this.ctx.fillRect(this.xOffset + (square.x * this.gridSize) + 1, this.yOffset + this.height - (square.y * this.gridSize) - 1, this.gridSize - 2, -(this.gridSize - 2));
    }

    canMove(x, y) { // check for potential overlap and limit all sides except top
        return x >= 0 && x < this.xMax && y >= 0 && this.squares.every(s => s.shape || s.x !== x || s.y !== y);
    }

    newShape() { // spawn new shape
        this.activeShape = this.nextShape.start();
        if(!this.nextShapes.length) this.nextShapes = Shape.varients.sort(() => Math.random() - 0.5);
        this.nextShape = new Shape(this.nextShapes.shift(), this);
    }

    clear() { // clears any rows that are full and moves everything above down
        let clearedRows = []
        for(let i = 0; i < this.yMax; i++) {
            if(this.squares.filter(s => !s.shape && s.y === i).length === this.xMax) {
                clearedRows.push(i);
                this.squares = this.squares.filter(s => !s.shape && s.y !== i);
            }
        }
        let shapesToMove = [];
        clearedRows.forEach(row => this.squares.filter(s => !s.shape && s.y > row).forEach(s => shapesToMove.push(s)));
        this.cleared += this.getScore(clearedRows.length);
        this.rowsCleared += clearedRows.length;
        console.log(this.rowsCleared);
        shapesToMove.forEach(s => s.down());
    }

    getScore(rows) {
        return Math.round(((1100 - this.display.rate) / 100) * (rows * rows) * 100);
    }

    hold() { // place active shape in hold, bring held shape back into active, can only hold once per drop
        if(!this.activeShape || this.activeShape.goDown) return;
        this.activeShape.squares.forEach(s => this.squares.splice(this.squares.indexOf(s), 1));
        let temp = this.heldShape;
        this.heldShape = this.activeShape;
        if(temp) this.activeShape = temp.start();
        else this.newShape();
        this.activeShape.goDown = true;
    }

    botHold() { // hold but don't limit number of times you can hold
        if(!this.activeShape) return;
        this.activeShape.squares.forEach(s => this.squares.splice(this.squares.indexOf(s), 1));
        let temp = this.heldShape;
        this.heldShape = this.activeShape;
        if(temp) this.activeShape = temp.start();
        else this.newShape();
    }

    reset() { // clean slate
        this.squares = [];
        this.activeShape?.squares.forEach(s => s.end());
        this.heldShape?.squares.forEach(s => s.end());
        this.nextShape?.squares.forEach(s => s.end());
        this.nextShapes = Shape.varients.sort(() => Math.random() - 0.5);
        this.nextShape = new Shape(this.nextShapes.shift(), this, false);
        this.activeShape = null;
        this.heldShape = null;
        this.cleared = 0;
        this.rowsCleared = 0;
        this.ended = false;
        this.paused = false;
    }
}