import { Square } from './square.js'
export class Shape {
    constructor(varient, board) {
        this.board = board;
        this.centerPiece = !['I', 'O'].includes(varient); // if the center is one a square
        this.varient = varient;
        this.squares = [];
        let thisShape = this.constructor.shapes()[varient] || []; // get the relations with the squares
        let color = thisShape.shift();
        for(let sq of thisShape) {
            let square = new Square(...sq, color, this);
            this.squares.push(square);
        }
        this.waits = 0; // times waited going down
    }

    start() { // brings it to the board at the top
        this.x = Math.floor(this.board.xMax / 2);
        this.y = this.board.yMax + (this.board.squares.some(s => !s.shape && s.y > this.board.yMax - 4) ? 3 : -2);
        this.squares.forEach(s => s.move(this.x + s.startX, this.y + s.startY));
        this.squares.forEach(square => this.board.squares.push(square));
        return this;
    }

    static get varients() {
        return ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    } // all possible varients

    static shapes(x = 0, y = 0) { // information about the varients
        return {
            I: ['#00FFFF', [x, y + 1], [x, y], [x, y - 1], [x, y - 2]],
            J: ['#0000FF', [x, y + 1], [x, y], [x, y - 1], [x - 1, y - 1]],
            L: ['#FFA500', [x, y + 1], [x, y], [x, y - 1], [x + 1, y - 1]],
            O: ['#FFFF00', [x, y], [x, y - 1], [x - 1, y], [x - 1, y - 1]],
            S: ['#00FF00', [x, y + 1], [x, y], [x + 1, y], [x + 1, y - 1]],
            T: ['#B000B0', [x, y + 1], [x, y], [x, y - 1], [x - 1, y]],
            Z: ['#FF0000', [x, y + 1], [x, y], [x - 1, y], [x - 1, y - 1]]
        };
    }

    canDown() { // check if can move down
        return this.squares.every(s => this.board.canMove(s.x, s.y - 1));
    }

    move(dir) { // move left, right, or down
        let x = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
        let y = dir === 'down' ? -1 : 0;
        if(this.squares.every(s => this.board.canMove(s.x + x, s.y + y))) {
            this.squares.forEach(s => s.move(s.x + x, s.y + y))
            this.x += x;
            this.y += y;
        }
        if(!this.canDown()) {
            this.waits++;
        } else {
            this.waits = 0;
        }
        this.lastMoved = Date.now();
    }

    down() { // go down
        this.move('down');
    }

    rotatePos(square, left) { // figure out where the square would rotate
        return this.centerPiece ? [((square.y - this.y) * (left ? -1 : 1)) + this.x, ((square.x - this.x) * (left ? 1 : -1)) + this.y] : [((square.y - this.y + 0.5) * (left ? -1 : 1)) - 0.5 + this.x, ((square.x - this.x + 0.5) * (left ? 1 : -1)) - 0.5 + this.y];
    }

    rotate(left = true) { // rotate left or right
        this.squares.every(s => this.board.canMove(...this.rotatePos(s, left))) && this.squares.forEach(s => s.move(...this.rotatePos(s, left)));
        
    }

    end() { // drop shape down and release squares
        let y = this.y;
        for(let i = 0; i < y; i++) this.down();
        this.squares.forEach(s => s.end());
        this.board.activeShape = null;
    }

    shaddow(x = this.x) { // get shaddow of the shape at a specific x coord
        let data = {
            x: x,
            y: this.y,
            squares: this.squares.map(s => [x + (s.x - this.x), s.y])
        }
        if(data.squares.some(s => !this.board.canMove(s[0], s[1]))) return null;
        for(let i = 0; i < this.y; i++) {
            if(data.squares.every(s => this.board.canMove(s[0], s[1] - 1))) {
                data.y--;
                data.squares.forEach(s => s[1]--);
            }
        }
        return data;
    }
}