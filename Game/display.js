import { Board } from './board.js'
import { Box } from './box.js'

export class Display {
    constructor(canvas) {
        this.canvas = canvas; // canvas
        this.width = canvas.width; // easier access
        this.height = canvas.height; // easier access
        this.context = canvas.getContext('2d'); // context to be used by elements

        this.context.strokeMany = function(times = 5) { // draw darker lines around things
            for(let i = 0; i < times; i++) this.stroke();
        };
        this.context.textAlign = 'center'; // sets text to be centered

        this.board = new Board(this); // board with the game
        this.pauseButton = new Box('Paused', this.width / 2, this.height / 3, this, 'text', () => "esc to resume", () => this.board.paused); // pause button
        this.endButton = new Box('Game Over', this.width / 2, this.height / 2, this, 'text', () => "R to restart", () => this.board.ended); // button to show
        this.scoreBoard = new Box("Score", this.board.xOffset / 2, this.board.yOffset + 25, this, 'text', () => `${this.board.rowsCleared} - ${this.board.cleared}`); // box to show score
        this.nextBox = new Box("Next", (this.board.xOffset * 1.5) + this.board.width, this.board.yOffset + 75, this, 'image', () => this.board.nextShape); // box to show next shape
        this.holdBox = new Box("Held", this.board.xOffset / 2, this.board.yOffset + 150, this, 'image', () => this.board.heldShape); // show currently held shape
        this.elements = [this.board, this.pauseButton, this.endButton, this.scoreBoard, this.nextBox, this.holdBox]; // relevant elements
        this.rate = 1000 // speed
        this.playTimeout = null; // next tick timeout for clearing when pausing or ending
        this.bot = null;
    }

    reset(bot = null) { // should reset the whole game, needs to clear board etc
        this.board.ended = true; // end game and prevent user input
        clearTimeout(this.playTimeout); // stop playing
        this.bot?.wait();
        this.rate = 1000; // reset speed
        this.board.reset(); // reset board
        this.play(); //starty playing again
        this.bot = bot;
        this.bot?.makeMove();
    }

    update() { // redraw everything
        this.context.clearRect(0, 0, this.width, this.height);
        this.elements.forEach(e => e.draw());
    }

    play() { // repeatedly called to keep moving forward in time
        this.update();
        if(this.board.ended || this.board.paused) return;
        this.board.next();
        this.update();

        if(!this.board.ended && !this.board.paused) this.playTimeout = setTimeout(() => this.play(), this.rate); // set next play cycle
        if(this.rate > 150) this.rate--; // make it speed up
    }

    left() { // attempt to move left
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.move('left');
        this.update();
    }

    right() { // attempt to move right
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.move('right');
        this.update();
    }

    down() { // attempt to move down
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.move('down');
        this.update();
    }

    rLeft() { // attempt to rotate left
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.rotate(true);
        this.update();
    }

    rRight() { // attempt to rotate right
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.rotate(false);
        this.update();
    }

    drop() { // drop the shape to the bottom and get a new one
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.end();
        this.board.next();
        this.update();
    }

    hold() { // attempt to swap with held shape
        if(this.board.paused || this.board.ended) return;
        this.bot ? this.board.botHold() : this.board.hold();
        this.update();
    }

    pause() { // pause game
        if(this.board.ended) return;
        clearTimeout(this.playTimeout);
        this.bot?.wait();
        this.board.paused = !this.board.paused;
        if(!this.board.paused) {
            this.play();
            this.bot?.makeMove();
        }
        this.update();
    }
}