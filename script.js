import { Display } from './Game/display.js'

document.write('hi');

let d = new Display(document.getElementById("boardCanvas"));
window.myTetrisGame = d;

window.addEventListener('keydown', e => {
    switch(e.keyCode) { // listen to key presses
        case 37:
        return d.left();
        case 39:
        return d.right();
        case 40:
        return d.down();
        case 88:
        return d.rLeft();
        case 67:
        return d.rRight();
        case 32:
        return d.drop();
        case 90:
        return d.hold();
        case 27:
        return d.pause();
        case 82:
        return d.reset();
    }
});

d.play();