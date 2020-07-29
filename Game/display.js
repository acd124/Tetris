import { Board } from './board.js'
import { Box } from './box.js'

export class Display {
    constructor(canvas) {
        this.canvas = canvas; // canvas
        this.width = canvas.width; // easier access
        this.height = canvas.height; // easier access
        this.context = canvas.getContext('2d'); // context to be used by elements

        this.context.strokeMany = (times = 5) => { // draw darker lines around things
            for(let i = 0; i < times; i++) this.context.stroke();
        };
        this.context.textAlign = 'center'; // sets text to be centered

        this.board = new Board(this); // board with the game
        this.pauseButton = new Box('Paused', this.width / 2, this.height / 3, this, 'text', () => "esc to resume", () => this.board.paused); // pause button
        this.endButton = new Box('Game Over', this.width / 2, this.height / 2, this, 'text', () => "R to restart", () => this.board.ended); // button to show
        this.scoreBoard = new Box("Score", this.board.xOffset / 2, this.board.yOffset + 25, this, 'text', () => this.board.cleared); // box to show score
        this.nextBox = new Box("Next", (this.board.xOffset * 1.5) + this.board.width, this.board.yOffset + 75, this, 'image', () => this.board.nextShape); // box to show next shape
        this.holdBox = new Box("Held", this.board.xOffset / 2, this.board.yOffset + 150, this, 'image', () => this.board.heldShape); // show currently held shape
        this.elements = [this.board, this.pauseButton, this.endButton, this.scoreBoard, this.nextBox, this.holdBox]; // relevant elements
        this.rate = 1000 // speed
        this.resetAlready = false; // prevent multiple resets
    }

    reset() { // should reset the whole game, needs to clear board etc
        if(this.resetAlready) return; // no if already reseting
        this.board.ended = true; // end game and prevent user input
        this.resetAlready = true; // say am resetting
        setTimeout(() => {
            this.rate = 1000; // reset speed
            this.board.reset(); // reset board
            this.resetAlready = false;
            this.play(); //starty playing again
        }, 1000);
    }

    update() { // redraw everything
        this.context.clearRect(0, 0, this.width, this.height);
        this.elements.forEach(e => e.draw());
    }

    play() { // repeatedly called to keep moving forward in time
        this.update();
        if(this.board.ended || this.board.paused || this.resetAlready) return;
        this.board.next();
        this.update();

        !this.board.ended && !this.board.paused && setTimeout(() => this.play(), this.rate); // set next play cycle
        if(this.rate > 200) this.rate--; // make it speed up
    }

    left() {
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.move('left');
        this.update();
    }

    right() {
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.move('right');
        this.update();
    }

    down() {
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.move('down');
        this.update();
    }

    rLeft() {
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.rotate(true);
        this.update();
    }

    rRight() {
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.rotate(false);
        this.update();
    }

    drop() {
        if(this.board.paused || this.board.ended) return;
        this.board.activeShape?.end();
        this.board.next();
        this.update();
    }

    hold() {
        if(this.board.paused || this.board.ended) return;
        this.board.hold();
        this.update();
    }

    pause() {
        if(this.board.ended) return;
        this.board.paused = !this.board.paused;
        this.board.paused || this.play();
        this.update();
    }
}