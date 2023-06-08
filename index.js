const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var score = 0,
    game_over = false,
    pause = false;

const MAX_HEALTH = 100,
    HEALTH_BAR_LENGTH = 250,
    HEALTH_BAR_WIDTH = 25,
    health_damage = 5;
var current_health_length = HEALTH_BAR_LENGTH,
    HEALTH = MAX_HEALTH,
    health_bar_color = "green";

const bulletsArray = [],
    BULLET_SPEED = 10,
    BULLET_SIZE = 10;

const enemyArray = [],
    ENEMY_SPEED = 1,
    ENEMY_SIZE = 25;

const COLLISION_DIST = 20,
    PLAYER_MOVE_DIST = 10;


//scoring and health system
function health_bar() {
    if (HEALTH < 25) {
        health_bar_color = "red";
    } else if (HEALTH < 50) {
        health_bar_color = "yellow";
    }
    ctx.fillStyle = health_bar_color;
    ctx.fillRect(8, 8, current_health_length, HEALTH_BAR_WIDTH);

    ctx.strokeStyle = "white";
    ctx.font = "15px Arial";
    ctx.textAlign = "left";
    ctx.strokeText("HEALTH", 10, 25);
}

function write_score() {
    ctx.strokeStyle = "white";
    ctx.font = "15px Arial";
    ctx.strokeText("Score: " + score.toString(), 17.5
        * parseFloat(canvas.width) / 20, 25);
}

// adding a pause button
const pause_button = document.getElementById("pause");
pause_button.style.marginLeft = (parseFloat(canvas.width) / 2).toString() + "px";
pause_button.style.marginTop = "25px";
var word = "pause";
document.addEventListener("keypress", function (e) {
    if (e.key === "p") {
        pause = !pause;
    }
});
function draw_pause_button() {
    if (!pause) {
        word = "pause";
    } else {
        word = "play";
    }
    ctx.strokeStyle = "white";
    ctx.font = "15px Arial";
    ctx.strokeText(word, parseFloat(pause_button.style.marginLeft), parseFloat(pause_button.style.marginTop));
}

function top_screen() {
    draw_pause_button();
    write_score();
    health_bar();
}

// initializing the position of home
const HOME = document.getElementById("home");

HOME.style.marginTop = (window.innerHeight * 15 / 20).toString() + "px";
HOME.style.marginLeft = (window.innerWidth / 2).toString() + "px";
const HOME_X = parseFloat(HOME.style.marginLeft),
    HOME_Y = parseFloat(HOME.style.marginTop),
    HOME_WIDTH = 100,
    HOME_HEIGHT = 105;

function draw_home() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(HOME_X, HOME_Y, HOME_WIDTH, HOME_HEIGHT);

    ctx.strokeStyle = "black";
    ctx.font = "15px Arial";
    ctx.textAlign = "center";
    ctx.strokeText("HOME", HOME_X + HOME_WIDTH / 2, HOME_Y + HOME_HEIGHT / 2);
}


// initializing the position of player
const player = document.getElementById("player");
player.style.marginLeft = (window.innerWidth / 2 + 10).toString() + "px";
player.style.marginTop = (window.innerHeight * 19 / 20).toString() + "px";

function draw_player() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(parseFloat(player.style.marginLeft), parseFloat(player.style.marginTop), 20, 0, Math.PI * 2);
    ctx.fill();
}


// to make the player move along x-axis
document.addEventListener("keydown", function (e) {
    var x_cor = parseFloat(player.style.marginLeft);
    if (e.key === 'a') {
        if (x_cor - PLAYER_MOVE_DIST > 0)
            player.style.marginLeft = (x_cor - PLAYER_MOVE_DIST).toString() + "px";
    } else if (e.key === 'd') {
        if (x_cor + PLAYER_MOVE_DIST < window.innerWidth)
            player.style.marginLeft = (x_cor + PLAYER_MOVE_DIST).toString() + "px";
    }
});

class Bullet {
    constructor(slope, speed) {
        this.size = BULLET_SIZE;
        this.x = parseFloat(player.style.marginLeft);
        this.y = parseFloat(player.style.marginTop);
        this.slope = slope;
        this.speed = speed;
    }
    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    move() {
        if (this.slope === null) {
            this.y += this.speed;
        } else {
            var t = Math.sqrt(1 + (this.slope ** 2)); // this t is to ensure that speed of bullet is same in all directions
            this.x -= this.speed / t;
            this.y -= this.slope * this.speed / t;
        }
    }
}

// shooting the bullets
document.addEventListener("click", function (e) {
    if (!pause && !game_over) {
        var mouse_x = e.x,
            mouse_y = e.y,
            dx = mouse_x - parseFloat(player.style.marginLeft),
            dy = mouse_y - parseFloat(player.style.marginTop),
            slope = dx === 0 ? null : dy / dx,
            speed = BULLET_SPEED * (slope > 0 ? 1 : -1);
        bulletsArray.push(new Bullet(slope, speed));
    }
});

// a function to move
function manage_bullets() {
    for (let i = 0; i < bulletsArray.length; i++) {
        bulletsArray[i].move();
    }
}
function draw_bullets() {
    for (let i = 0; i < bulletsArray.length; i++) {
        bulletsArray[i].draw();
    }
}


class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    move() {
        this.y += ENEMY_SPEED;
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, ENEMY_SIZE, ENEMY_SIZE);
    }
}



// to create enemies
function create_enemies() {
    enemyArray.push(new Enemy((Math.random()) * canvas.width, 0));
}

// a fucntion to move all the enemies
function manage_enemies() {
    if (Math.random() * 50 < 2) create_enemies(); // determing the probability of enemy being created... change this such that probabilty increase with score
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].move();
    }
}
function draw_enemies() {
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].draw();
    }
}

// checking if the enemy hit home or the player
function hit_home_player() {
    for (let k = 0; k < enemyArray.length; k++) {
        var enemy_x = enemyArray[k].x,
            enemy_y = enemyArray[k].y,
            collision_with_home = enemy_y >= HOME_Y - BULLET_SIZE && enemy_x >= HOME_X - BULLET_SIZE && enemy_x <= HOME_X + HOME_WIDTH,
            dx_player = enemy_x - parseFloat(player.style.marginLeft),
            dy_player = enemy_y - parseFloat(player.style.marginTop),
            dist_player = Math.sqrt(dx_player ** 2 + dy_player ** 2);
        if (collision_with_home || dist_player < COLLISION_DIST) {
            HEALTH -= health_damage;
            current_health_length -= health_damage * HEALTH_BAR_LENGTH / MAX_HEALTH;
            enemyArray.splice(k, 1);
            k--;
        }
    }
}

// checking if bullet hit the enemy or not
function hit_enemies() {
    for (let i = 0; i < bulletsArray.length; i++) {
        var bullet_x = bulletsArray[i].x,
            bullet_y = bulletsArray[i].y;
        for (let j = 0; j < enemyArray.length; j++) {
            var dx = bullet_x - enemyArray[j].x,
                dy = bullet_y - enemyArray[j].y,
                distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < COLLISION_DIST) {
                enemyArray.splice(j, 1);
                score++;
                bulletsArray.splice(i, 1);
                i--;
                break;
            }
        }
    }
}

// checking if any hit occured
function check_hit() {
    // add somehting to make the collision look more game like
    hit_enemies();
    hit_home_player();
    if (HEALTH === 0) {
        game_over = true;
    }
}

function draw_game() {
    draw_home();
    draw_bullets();
    draw_player();
    draw_enemies();
    top_screen();
}

function game_over_screen() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Game Over", parseFloat(window.innerWidth) / 2 - 15, parseFloat(window.innerHeight) / 2);
}


// the game loop
function game() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!pause) {
        manage_enemies();
        manage_bullets();
        check_hit();
    }
    if (!game_over) requestAnimationFrame(game);
    else game_over_screen();
    draw_game();
}
game();
