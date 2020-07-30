export class Bot {
    constructor(display) {
        this.display = display;
        this.board = display.board;
        this.moveTimeout = null;
    }

    makeMove() {
        if(this.board.paused || this.board.ended || !this.display.bot) return;
        const firstMoves = this.findMoves();
        this.display.hold();
        const otherMoves = this.findMoves();
        const first = firstMoves.reduce((a, c) => a[0] < c[0] ? c : a, [0]);
        const other = otherMoves.reduce((a, c) => a[0] < c[0] ? c : a, [0]);
        const move = first[0] < other[0] ? other : first;
        if(move.length > 1) {
            if(move === first) this.display.hold();
            for(let i = 0; i < move[1]; i++) this.display.rRight();
            let distance = Math.abs(move[2] - this.board.activeShape.x);
            for(let i = 0; i < distance; i++) this.board.activeShape.x > move[2] ? this.display.left() : this.display.right();
            this.display.drop();
        }
        setTimeout(() => this.makeMove(), 10);
    }

    wait() {
        clearTimeout(this.moveTimeout);
    }

    findMoves() {
        let moves = [];
        if(!this.board.activeShape) return moves;
        for(let j = 0; j < 4; j++) {
            for(let k = 0; k < j; k++) this.display.rRight();
            for(let i = 0; i < this.board.xMax; i++) {
                let shape = this.board.activeShape.shaddow(i);
                if(!shape) continue;
                if(moves.every(m => m[3].squares.some(s => !shape.squares.some(sq => sq[0] === s[0] && sq[1] === s[1])))) moves.push([this.scoreMove(shape), j, i, shape]);
            }
            for(let k = 0; k < j; k++) this.display.rLeft();
        }
        return moves;
    }

    scoreMove(shaddow) {
        let holes = shaddow.squares.reduce((a, c) => c[1] > 0 && !shaddow.squares.some(s => s[0] === c[0] && s[1] === c[1] - 1) && !this.board.squares.some(s => s.x === c[0] && s.y === c[1] - 1) ? a + 1 : a, 0);
        let pillars = 0;
        for(let i = 0; i < this.board.xMax; i++) {
            let empty = 0;
            for(let j = 0; j < this.board.yMax; j++) {
                if(this.board.squares.some(s => s.x === i && s.y === j)) {
                    empty = 0;
                    continue;
                } else {
                    if((i - 1 < 0 || this.board.squares.some(s => s.x === i - 1 && s.y === j)) && (i + 1 >= this.board.xMax || this.board.squares.some(s => s.x === i + 1 && s.y === j))) empty++;
                    if(empty > 3) pillars++;
                }
            }
        }
        let height = shaddow.squares.reduce((a, c) => c[1] < a ? c[1] : a, 40);
        let score = this.potentialScore(shaddow);
        let high = shaddow.squares.reduce((a, c) => c[1] > a[1] ? c : a, 0);
        let alone = (high[0] - 1 < 0 || !this.board.squares.some(s =>)
        return ((this.board.yMax + 4 - height) / (10 * (pillars + holes + 1))) + (Math.sqrt(score) / 10) + ;
    }

    potentialScore(shaddow) {
        let cleared = 0;
        for(let i = 0; i < this.board.yMax; i++) {
            if([...this.board.squares.filter(s => !s.shape && s.y === i), ...shaddow.squares.filter(s => s[1] === i)].length === this.board.xMax) cleared++;
        }
        return this.board.getScore(cleared);
    }
}