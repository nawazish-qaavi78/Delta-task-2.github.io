// play again

const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var time_delay = 3000;

const SHOOT_SOUND = new Audio("sounds/laser-gun.mp3"),
    CRASH_SOUND = new Audio("sounds/mixkit-cartoon-punch-2149.wav");

const lettering_size = 15,
    big_lettering = 30;

var powerUpArray = [];
const FRUIT_SIZE = 20;

var high_score = localStorage.getItem("highscore") ? localStorage.getItem("highscore") : 0;

var score = 0,
    level = 1,
    game_over = false,
    pause = false,
    leveling_up = false;

const MAX_HEALTH = 100,
    HEALTH_BAR_LENGTH = 250,
    HEALTH_BAR_WIDTH = 25,
    health_damage = 5;
var current_health_length = HEALTH_BAR_LENGTH,
    HEALTH = MAX_HEALTH,
    health_bar_color = "green";

var bulletsArray = [],
    playerBullets = [];
const BULLET_SPEED = 10,
    BULLET_SIZE = 10;

var enemyArray = [],
    specialEnemyArray = [];
const ENEMY_SPEED = 1,
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
    ctx.font = lettering_size + "px Arial";
    ctx.textAlign = "left";
    ctx.strokeText("HEALTH", 10, 25);
}

function write_score() {
    ctx.strokeStyle = "white";
    ctx.font = lettering_size + "px Arial";
    ctx.strokeText("Score: " + score.toString(), 17.5
        * parseFloat(canvas.width) / 20, 25);
}




// pause system
const pause_button = document.getElementById("pause");
pause_button.style.marginLeft = (parseFloat(canvas.width) / 2).toString() + "px";
pause_button.style.marginTop = "25px";
var word = "pause";
document.addEventListener("keypress", function (e) {
    if (e.key === "p") {
        if (pause === false) {
            clearInterval(enemy_shooting);
            clearInterval(power_up_generator);
        } else {
            enemy_shooting = setInterval(enemy_shooting, time_delay);
            enemy_shooting = setInterval(power_up_generator, time_delay);
        }
        pause = !pause;
    }
});

document.getElementById("canvas").addEventListener("click", function (e) {
    var x_ok = e.x >= parseFloat(pause_button.style.marginLeft) && e.x <= parseFloat(pause_button.style.marginLeft) + word.length * lettering_size;
    var y_ok = e.y >= parseFloat(pause_button.style.marginTop) && e.y <= parseFloat(pause_button.style.marginTop) + lettering_size;
    if (x_ok && y_ok) {
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
    ctx.font = lettering_size + "px Arial";
    ctx.strokeText(word, parseFloat(pause_button.style.marginLeft), parseFloat(pause_button.style.marginTop));
}
ctx.fillStyle = "yellow";
ctx.beginPath();
ctx.fillRect(parseFloat(pause_button.style.marginLeft), parseFloat(pause_button.style.marginTop), word.length, lettering_size);




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
    ctx.font = lettering_size + "px Arial";
    ctx.textAlign = "center";
    ctx.strokeText("HOME", HOME_X + HOME_WIDTH / 2, HOME_Y + HOME_HEIGHT / 2);
}


// player properties

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

// to make the player move
document.addEventListener("keydown", function (e) {
    var x_cor = parseFloat(player.style.marginLeft),
        y_cor = parseFloat(player.style.marginTop);
    if (e.key === 'a') {
        if (x_cor - PLAYER_MOVE_DIST > 0)
            player.style.marginLeft = (x_cor - PLAYER_MOVE_DIST).toString() + "px";
    } else if (e.key === 'd') {
        if (x_cor + PLAYER_MOVE_DIST < window.innerWidth)
            player.style.marginLeft = (x_cor + PLAYER_MOVE_DIST).toString() + "px";
    } else if (e.key === "w") {
        if (y_cor - PLAYER_MOVE_DIST > 0)
            player.style.marginTop = (y_cor - PLAYER_MOVE_DIST).toString() + "px";
    } else if (e.key === "s") {
        if (y_cor + PLAYER_MOVE_DIST < window.innerHeight)
            player.style.marginTop = (y_cor + PLAYER_MOVE_DIST).toString() + "px";
    }
});




class Bullet {
    constructor(x, y, slope, direction) {
        this.size = BULLET_SIZE;
        this.x = x;
        this.y = y;
        this.slope = slope;
        this.direction = direction;
    }
    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    move() {
        if (this.slope === null) {
            this.y += this.direction * PLAYER_MOVE_DIST
        } else {
            var t = Math.sqrt(1 + (this.slope ** 2)); // this t is to ensure that speed of bullet is same in all directions
            this.x += this.direction * PLAYER_MOVE_DIST / t;
            this.y += this.direction * this.slope * PLAYER_MOVE_DIST / t;
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
            slope = dx === 0 ? null : (dy / dx),
            direction = dx > 0 ? 1 : -1,
            new_bullet = new Bullet(parseFloat(player.style.marginLeft), parseFloat(player.style.marginTop), slope, direction);
        bulletsArray.push(new_bullet);
        playerBullets.push(new_bullet);
        SHOOT_SOUND.play();
    }
});

// a function to move and draw all the bullets
function manage_bullets() {
    for (let i = 0; i < bulletsArray.length; i++) {
        bulletsArray[i].move();
        // to remove the bullets out of the screen
        if (bulletsArray[i].x < 0 || bulletsArray[i].x > window.innerWidth || bulletsArray[i].y > window.innerHeight || bulletsArray[i].y < 0) {
            if (playerBullets.includes(bulletsArray[i])) playerBullets.splice(playerBullets.indexOf(bulletsArray[i]), 1);
            bulletsArray.splice(i, 1);
            i--;
        }
    }
}
function draw_bullets() {
    for (let i = 0; i < bulletsArray.length; i++) {
        bulletsArray[i].draw();
    }
}



class Enemy {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.color = "red";
    }
    move() {
        this.y += ENEMY_SPEED;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, ENEMY_SIZE, ENEMY_SIZE);
    }
}

class SpecialEnemy extends Enemy {
    constructor() {
        super();
        this.color = "blue";
    }
    shoot() {
        var dx = HOME_X - this.x,
            dy = HOME_Y - this.y,
            slope = dx === 0 ? null : (dy / dx),
            direction = dx > 0 ? 1 : -1;
        bulletsArray.push(new Bullet(this.x, this.y, slope, direction));
    }
}

// to create enemies
function create_enemies() {
    enemyArray.push(new Enemy());
    // after level 5 special enemies must form
    if (Math.random() * (10 - level * 2) < 1) { // this if statement increases the probability of special enemies being created along with increase in level
        var enemy = new SpecialEnemy();
        enemyArray.push(enemy);
        specialEnemyArray.push(enemy);
    }
}

// a fucntion to move all the enemies
function manage_enemies() {
    if (Math.random() * (190 - level) < 2) create_enemies(); // this also ensure that probability of enemies spawing increases with level
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].move();
    }
}
function draw_enemies() {
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].draw();
    }
}

// this function will make the enemies shoot after particular interval of time
function enemies_shoot() {
    for (let i = 0; i < specialEnemyArray.length; i++) {
        specialEnemyArray[i].shoot();
    }
}
var enemy_shooting = setInterval(enemies_shoot, time_delay);




function hit_home_player() {
    // this loop checks if any bullet collided with the home (even the bullet shot by the player)
    for (let i = 0; i < bulletsArray.length; i++) {
        var bullet_x = bulletsArray[i].x,
            bullet_y = bulletsArray[i].y,
            collision_with_home = bullet_y >= HOME_Y - BULLET_SIZE && bullet_y <= HOME_Y + HOME_HEIGHT && bullet_x >= HOME_X - BULLET_SIZE && bullet_x <= HOME_X + HOME_WIDTH;
        if (collision_with_home) {
            HEALTH -= health_damage;
            current_health_length -= health_damage * HEALTH_BAR_LENGTH / MAX_HEALTH;
            CRASH_SOUND.play();
            if (playerBullets.includes(bulletsArray[i])) playerBullets.splice(playerBullets.indexOf(bulletsArray[i]), 1);
            bulletsArray.splice(i, 1);
            i--;
        }
    }

    // this loop checks if the enemies collided with the home
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
            CRASH_SOUND.play();
            if (specialEnemyArray.includes(enemyArray[k])) specialEnemyArray.splice(specialEnemyArray.indexOf(enemyArray[k]), 1);
            enemyArray.splice(k, 1);
            k--;
        }
    }
}

function enemies_dead() {
    // this part will check if any bullet hit them
    for (let i = 0; i < playerBullets.length; i++) { // this will ensure that the bullets hit by the enemies don't hurt the enemies... i.e all bullets hurt the home but only players bullets hurt the enemies
        var bullet_x = playerBullets[i].x,
            bullet_y = playerBullets[i].y;
        for (let j = 0; j < enemyArray.length; j++) {
            var dx = bullet_x - enemyArray[j].x,
                dy = bullet_y - enemyArray[j].y,
                distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < COLLISION_DIST) {
                if (specialEnemyArray.includes(enemyArray[j])) specialEnemyArray.splice(specialEnemyArray.indexOf(enemyArray[i]), 1);
                enemyArray.splice(j, 1);
                score++;
                var prev_lvl = level;
                level = Math.floor(score / 10) + 1;
                if (prev_lvl < level) {
                    level_up_benefits();
                }

                bulletsArray.splice(bulletsArray.indexOf(playerBullets[i]), 1);
                playerBullets.splice(i, 1);
                i--;
                break;
            }
        }
    }

    // this part will remove the enemies if they cross the window length
    for (let i = 0; i < enemyArray.length; i++) {
        if (enemyArray[i].y > window.innerHeight) {
            if (specialEnemyArray.includes(enemyArray[i])) zspecialEnemyArray.splice(specialEnemyArray.indexOf(enemyArray[i]), 1);
            enemyArray.splice(i, 1);
            i--;
        }
    }
}



// level up functions
function level_up_benefits() {
    leveling_up = true;
    time_delay -= 5; // making the frequency with which the enemies shoot increase
    if (HEALTH + health_damage <= 100) { // giving the player more health on leveling up
        HEALTH += health_damage;
        current_health_length += health_damage * HEALTH_BAR_LENGTH / MAX_HEALTH;
    } else {
        HEALTH = 100;
        current_health_length = HEALTH_BAR_LENGTH;
    }
}
function draw_level_up() {
    ctx.fillStyle = "black";
    ctx.font = big_lettering + "px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Level Up", parseFloat(window.innerWidth) / 2 - 15, parseFloat(window.innerHeight) / 2);
    setTimeout(function () {
        leveling_up = false;
        game();
    }, 1000);
}


class PowerUp {
    constructor() {
        // this.x = Math.random() *canvas.width;
        // this.y = Math.random() * canvas.height;
        this.x = 80;
        this.y = 80;
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, FRUIT_SIZE, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function draw_powerUps() {
    for (let i = 0; i < powerUpArray.length; i++) {
        powerUpArray[i].draw();
    }
}
function eaten_powerup() {
    for (let i = 0; i < powerUpArray.length; i++) {
        var dx_player = powerUpArray[i].x - parseFloat(player.style.marginLeft),
            dy_player = powerUpArray[i].y - parseFloat(player.style.marginTop);
        if (Math.sqrt(dx_player ** 2 + dy_player ** 2) < COLLISION_DIST) {
            time_delay -= 5;
            powerUpArray.splice(i, 1);
            i--;
        }
    }
}

// to randomly generate powerups 
function generate_fruits() {
    if (!game_over && !pause && powerUpArray.length < 2 && Math.random() * (300 - level) < 1) { // keeping max powers up on screen at once =2;
        powerUpArray.push(new PowerUp());
    }
}
var power_up_generator = setInterval(generate_fruits, time_delay);


// checking if the bullet collided with any enemies or enemies collided with home or player
function collisions() {
    enemies_dead();
    hit_home_player();
    eaten_powerup();
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
    draw_powerUps();
}

function move() {
    manage_enemies();
    manage_bullets();
}

function game_over_screen() {
    ctx.fillStyle = "black";
    ctx.font = big_lettering + "px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Game Over", parseFloat(window.innerWidth) / 2 - 15, parseFloat(window.innerHeight) / 2);
    if (score > high_score)
        localStorage.setItem("highscore", score);
    ctx.fillText("High Score: " + high_score, parseFloat(window.innerWidth) / 2 - 15, parseFloat(window.innerHeight) / 2 + big_lettering);
}


// the game loop
function game() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!pause) {
        move();
        collisions();
    }
    if (!game_over && !leveling_up) requestAnimationFrame(game);
    else if (game_over) game_over_screen();
    else draw_level_up();
    draw_game();
}
game();
