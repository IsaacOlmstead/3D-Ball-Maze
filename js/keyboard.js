// js/keyboard.js
// Simple keyboard state tracker for movement keys.

export const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

window.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
        case "h":
            keys.left = true;
            break;

        case "arrowright":
        case "d":
        case "l":
            keys.right = true;
            break;

        case "arrowup":
        case "w":
        case "k":
            keys.up = true;
            break;

        case "arrowdown":
        case "s":
        case "j":
            keys.down = true;
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
        case "h":
            keys.left = false;
            break;

        case "arrowright":
        case "d":
        case "l":
            keys.right = false;
            break;

        case "arrowup":
        case "w":
        case "k":
            keys.up = false;
            break;

        case "arrowdown":
        case "s":
        case "j":
            keys.down = false;
            break;
    }
});
