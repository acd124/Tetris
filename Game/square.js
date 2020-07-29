export class Square {
    constructor(x, y, color, shape) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.color = color;
        this.shape = shape;
    }

    move(x, y) { // move shape to a location
        this.x = x;
        this.y = y;
    }
    
    down() { // move down
        this.y -= 1;
    }

    end() { // remove reference to shape
        delete this.shape;
    }
}