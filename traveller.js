var sketchProc = function(processingInstance) {
 with (processingInstance) {
    var XDIMENTION = 800;
    var YDIMENTION = 600;
    var FPS = 60;
    size(XDIMENTION, YDIMENTION);
    frameRate(FPS);
    var SPEED = 2;
    var ATRITTION = SPEED/FPS;
    var BULLETDELAY = FPS/5;
    var BULLETSPEED = 5;
    //Possible states within the game
    var DEAD = 0;
    var ALIVE = 1;
    var KILLED = 2;
    var PAUSED = 3;
    var WINNER = 4;
    var GAMEOVER = 5;
    var WAITTING = 6;
    var PLAYERSTATE = WAITTING;

    var MESSAGESIZE = 24;
    var BUTTONWIDTH = XDIMENTION/4;
    var BUTTONHEIGHT = YDIMENTION/8;

    var PLAYERIMAGE = loadImage("../img/Traveller/Player.png");
    var BULLETIMAGE = loadImage("../img/Traveller/Bullet.png");
    var CANNONIMAGE = loadImage("../img/Traveller/Cannon.png");

    var bullets = [];
    var input =[];

    var Bullet = function(x, y, heading){
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.img = BULLETIMAGE;
    };

    Bullet.prototype.draw = function(){
        image(this.img, this.x, this.y);
    }

    var Player = function(x, y){
        this.x = x;
        this.y = y;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.img = PLAYERIMAGE;
        this.readyToShoot = true;
        this.delay = 0;
        //represent the angle headed by the Player
        this.heading = 90;
    };
    Player.prototype.draw = function(){
        image(this.img, this.x, this.y);
        if(!this.readyToShoot){
            this.delay -= 1;
            if(this.delay <=0){
              this.readyToShoot = true;
            }
        }

    };
    Player.prototype.shoot = function(){
        if(this.readyToShoot){
            this.readyToShoot = false;
            this.delay = BULLETDELAY;
            var bullet = new Bullet(this.x, this.y, this.heading);
            bullets[bullets.length] = bullet;
        }

    };



}};

// Get the canvas that Processing-js will use
var canvas = document.getElementById("traveller");
// Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
var processingInstance = new Processing(canvas, sketchProc);
