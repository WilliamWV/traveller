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
    var PLAYERSIZE = XDIMENTION /10;
    var CANNOONSIZE = XDIMENTION / 15;
    var BULLETSIZE = PLAYERSIZE/3;
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

    var BACKGROUNDCOLOR = [133, 51, 181];
    var OBSTACLECOLOR = [30, 30, 30];
    var BUTTONCOLOR = [72, 0, 114];
    var BUTTONLABEL = [204, 204, 255];
    var MESSAGECOLOR = [255, 255, 255];
    var SCENECOLLOR = [0, 102, 204];


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
        image(this.img, this.x, this.y, BULLETSIZE, BULLETSIZE);
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
        image(this.img, this.x, this.y, PLAYERSIZE, PLAYERSIZE);
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

    var Button = function(x, y, label, widht, height){
          this.x = x;
          this.y = y;
          this.label = label;
          this.width = width;
          this.height = height;
          this.isDrawn = false;
    };
    Button.prototype.draw = function(){
        fill(BUTTONCOLOR[0], BUTTONCOLOR[1], BUTTONCOLOR[2]);
        rect(this.x, this.y, this.width. this.height);
        noStroke();
        fill(BUTTONLABEL[0], BUTTONLABEL[1], BUTTONLABEL[2]);
        textAlign(CENTER, CENTER);
        textSize(MESSAGESIZE);
        text(this.label, this.x + this.width/2, this.y + this.height/2);
        this.isDrawn = true;
    };

    Button.prototype.isOver = function(x, y){
        return (x>=this.x && x<=this.x+this.width && y>=this.y && y<=this.y+this.height);
    };

    var PauseButton = function(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDrawn = false;
    };
    pauseButton.prototype.draw = function() {
			fill(153, 153, 255);
			ellipse(this.x, this.y, this.width, this.height);
			fill(51, 0, 102);
			noStroke();
			rect(this.x-this.width/4, this.y - this.height/4, this.width/8, (1/2)*this.height);
			rect(this.x+this.width/8, this.y - this.height/4, this.width/8, (1/2)*this.height);
			this.isDrawn = true;
		};
		pauseButton.prototype.isOver = function(x, y){
			return(Math.sqrt((x-this.x)*(x-this.x) + (y - this.y)*(x-this.x))<=this.width/2);
		};

    //instances of buttons used in the game
		var PAUSE = new pauseButton(XDIMENTION * (3/4), BUTTONHEIGHT, BUTTONHEIGHT, BUTTONHEIGHT);
		var PAUSECONTBUTTON = new Button(2*BUTTONWIDTH, (7/2)*BUTTONHEIGHT, "CONTINUE", BUTTONWIDTH*2, BUTTONHEIGHT);
		var PAUSERESTBUTTON = new Button(2*BUTTONWIDTH, 5*BUTTONHEIGHT, "RESTART", BUTTONWIDTH*2, BUTTONHEIGHT);
		var PAUSEQUITBUTTON = new Button(2*BUTTONWIDTH, (13/2)*BUTTONHEIGHT, "QUIT", BUTTONWIDTH*2, BUTTONHEIGHT);
		var AGAINBUTTON = new Button(BUTTONWIDTH, 6*BUTTONHEIGHT, "TRY AGAIN", BUTTONWIDTH*(3/2), BUTTONHEIGHT);
		var QUITBUTTON = new Button(3*BUTTONWIDTH, 6*BUTTONHEIGHT, "QUIT", BUTTONWIDTH, BUTTONHEIGHT);
		var STARTBUTTON = new Button(2*BUTTONWIDTH, 4*BUTTONHEIGHT, "START", BUTTONWIDTH*(3/2), BUTTONHEIGHT*(3/2));
		var CONTINUEBUTTON = new Button(2*BUTTONWIDTH, 6*BUTTONHEIGHT, "CONTINUE", (3/2)*BUTTONWIDTH, BUTTONHEIGHT);

		var BUTTONS = [PAUSE, PAUSECONTBUTTON, PAUSERESTBUTTON, PAUSEQUITBUTTON, AGAINBUTTON, QUITBUTTON, STARTBUTTON, CONTINUEBUTTON];


    var startScene = function(){
        background(SCENECOLLOR[0],SCENECOLLOR[1],SCENECOLLOR[2]);
        STARTBUTTON.draw();
        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
        textAlign(CENTER, CENTER);
        textSize(2*MESSAGESIZE);
        text("THE TRAVELLER", XDIMENTION/2, YDIMENTION/3);

        image(PLAYERIMAGE, XDIMENTION * (3/4), YDIMENTION*(2/3), 2*PLAYERSIZE, 2*PLAYERSIZE);
    };

    var deadScene = function(){
        background(0);
        AGAINBUTTON.draw();
        QUITBUTTON.draw();
        textAlign(CENTER, CENTER);
        textSize((3/2)*MESSAGESIZE);
        text("YOU DEAD!!");
    };

    var pauseScene = function(){
        background(SCENECOLLOR[0],SCENECOLLOR[1],SCENECOLLOR[2]);

        PAUSECONTBUTTON.draw();
        PAUSERESTBUTTON.draw();
        PAUSEQUITBUTTON.draw();

        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
  			textSize(2*MESSAGESIZE);
  			textAlign(CENTER, CENTER);
  			text("PAUSE", XDIMENTION/2, (3/2)*BUTTONHEIGHT);
    };

    var gameOverScene = function(){
        background(0);
        CONTINUEBUTTON.draw();

        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
  			textSize(2*MESSAGESIZE);
  			textAlign(CENTER, CENTER);
  			text("GAME OVER!", XDIMENTION/2, YDIMENTION/3);

    };

    var winnerScene = function(){
      background(SCENECOLLOR[0], SCENECOLLOR[1], SCENECOLLOR[2])
			CONTINUEBUTTON.draw();

			fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
			textSize(2*MESSAGESIZE);
			textAlign(CENTER, CENTER);
			text("YOU WON", XDIMENTION/2, YDIMENTION/3);
			
    };

    draw = function{
        if(PLAYERSTATE === ALIVE){
            gameRunning();
        }
        else if(PLAYERSTATE === DEAD){
            deadScene();
        }
        else if(PLAYERSTATE === WAITTING){
            startScene();
        }
        else if(PLAYERSTATE === KILLED){
            player.explode();
        }
        else if(PLAYERSTATE === PAUSED){
            pauseScene();

        }
        else if(PLAYERSTATE === WINNER){
            winnerScene();
        }
        else if(PLAYERSTATE === GAMEOVER){
            gameOverScene();
        }
        else {
          PLAYERSTATE = WAITTING;
        }

    };



}};

// Get the canvas that Processing-js will use
var canvas = document.getElementById("traveller");
// Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
var processingInstance = new Processing(canvas, sketchProc);
