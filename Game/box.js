export class Box {
    constructor(name, x, y, display, type, access, filter = () => true) {
        this.name = name;
        this.type = type;
        this.width = 100;
        this.height = type === 'text' ? 50 : 150;
        this.xOffset = x - this.width / 2;
        this.yOffset = y - this.height / 2;
        this.display = display
        this.access = access; // function to get data
        this.filter = filter; // function to see if box should show
        this.ctx = display.context;
    }

    draw() {
        if(!this.filter()) return;
        this.ctx.beginPath();
        this.ctx.rect(this.xOffset, this.yOffset, this.width, this.height); // outline of box
        this.ctx.strokeMany();

        this.ctx.fillStyle = this.name === 'Game over' ? '#DF6BFF' : '#808080';
        this.ctx.fillRect(this.xOffset, this.yOffset, this.width, this.height); // background of box

        this.ctx.fillStyle = '#000000';
        this.ctx.font = '24px sans-serif'; // Title
        this.ctx.fillText(this.name, this.xOffset + (this.width / 2), this.yOffset + 25, this.width);
        this.ctx.font = '14px sans-serif';
        if(this.type === 'text') {
            this.ctx.fillText(this.access(), this.xOffset + (this.width / 2), this.yOffset + (4 * this.height / 5), this.width); // explanation text
        } else if(this.type === 'image') {
            this.ctx.beginPath();
            this.ctx.rect(this.xOffset + ((this.width * (1 / 5)) / 2), this.yOffset + (this.width / 3), this.width * 4 / 5, this.height * 11 / 15); // mini canvas border
            this.ctx.strokeMany();
            this.ctx.fillStyle = '#A0A0A0';
            this.ctx.fillRect(this.xOffset + ((this.width * (1 / 5)) / 2) + 1, this.yOffset + (this.width / 3) + 1, (this.width * 4 / 5) - 2, (this.height * 11 / 15) - 2); // mini canvas background

            let shape = this.access();
            if(!shape) return; // empty box
            let x = this.xOffset + (this.width / 2);
            let y = this.yOffset + (this.width / 5) + (this.height * 7 / 15);
            let size = this.display.board.gridSize;

            for(let square of shape.squares) {
                this.ctx.beginPath();
                this.ctx.rect(x + ((square.startX - (['L', 'S'].includes(shape.varient) ? 1 : 'I' === shape.varient ? 0.5 : 0)) * size), y - ((square.startY - (!shape.centerPiece ? 0 : 0.5)) * size), size, -size);
                this.ctx.strokeMany(); // shift squares around so shape is centered

                this.ctx.fillStyle = square.color;
                this.ctx.fillRect(x + ((square.startX  - (['L', 'S'].includes(shape.varient) ? 1 : 'I' === shape.varient ? 0.5 : 0)) * size) + 1, y - ((square.startY - (!shape.centerPiece ? 0 : 0.5)) * size) - 1, size - 2, -(size - 2)); // shift squares around so shape is centered
            }
        }
    }
}