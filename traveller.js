var sketchProc = function(processingInstance) {
 with (processingInstance) {
    var XDIMENTION = 800;
    var YDIMENTION = 600;
    var FPS = 60;
    size(XDIMENTION, YDIMENTION);
    frameRate(FPS);
    var SPEED = 2;
    var TURNINGSPEED = 2;
    var ATRITTION = SPEED/FPS;
    var BULLETDELAY = FPS/5;
    var BULLETSPEED = 5;
    var PLAYERSIZE = XDIMENTION /10;
    var CANNOONSIZE = XDIMENTION / 15;
    var BULLETSIZE = PLAYERSIZE/3;

    var EARTHPOSX = 100*XDIMENTION;
    var EARTHPOSY = 20*YDIMENTION;
    var EARTHSIZE = 2*XDIMENTION;
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
    var SCENECOLOR = [0, 102, 204];

    var BEFOREPAUSE = ALIVE;

    var PLAYERIMAGE = loadImage("../img/Traveller/Player.png");
    var BULLETIMAGE = loadImage("../img/Traveller/Bullet.png");
    var CANNONIMAGE = loadImage("../img/Traveller/Cannon.png");
    var EXPLOSION = [loadImage("../img/Traveller/Explosion/EXPL1.png"),
                     loadImage("../img/Traveller/Explosion/EXPL2.png"),
                     loadImage("../img/Traveller/Explosion/EXPL3.png"),
                     loadImage("../img/Traveller/Explosion/EXPL4.png"),
                     loadImage("../img/Traveller/Explosion/EXPL5.png"),
                     loadImage("../img/Traveller/Explosion/EXPL6.png"),
                     loadImage("../img/Traveller/Explosion/EXPL7.png"),
                     loadImage("../img/Traveller/Explosion/EXPL8.png"),
                     loadImage("../img/Traveller/Explosion/EXPL9.png"),
                     loadImage("../img/Traveller/Explosion/EXPL10.png"),
                     loadImage("../img/Traveller/Explosion/EXPL11.png"),
                     loadImage("../img/Traveller/Explosion/EXPL12.png")];

    var COINSC = 1;
    var PARAL = 2
    var CAMERARELATIVEX = 0;
    var CAMERARELATIVEY = 0;
    var bullets = [];
    var obstacles = [];
    var cannons = [];
    var input =[];

    var Bullet = function(x, y, heading){
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.img = BULLETIMAGE;
        this.isDrawn;
    };

    Bullet.prototype.draw = function(){
        image(this.img, this.x, this.y, BULLETSIZE, BULLETSIZE);
        if(this.x>XDIMENTION*(4/3) || this.x<-(1/3)*XDIMENTION ||this.y>YDIMENTION*(4/3) || this.y<-(1/3)*YDIMENTION){
            this.isDrawn = false;
        }
        this.isDrawn = true;
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
        this.i = 0;
    };
    Player.prototype.draw = function(){
        this.x += this.xSpeed;
        this.y -= this.ySpeed;
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
    Player.prototype.explode = function(){
        image(EXPLOSION[this.index], this.x, this.y, PLAYERSIZE, PLAYERSIZE);
        this.index+=1;
        if(this.index>=12){
            PLAYERSTATE = DEAD;
        }
    };
    var player = new Player(XDIMENTION/2,YDIMENTION/2);

    var Cannon = function(x, y){
        this.x = x;
        this.y = y;
        this.img = CANNONIMAGE;
        this.heading = 90;
        this.readyToShoot = true;
        this.delay = 0;
        this.isDrawn = false;
        this.state = ALIVE;
        this.index = 0;
    };

    Cannon.prototype.draw = function(){
        if(this.state === DEAD){
            this.explode();
        }
        else{
            image(this.img, this.x, this.y);
            this.isDrawn = true;
            if(this.delay>0){
                this.delay -=1;
            }
            if(this.delay <=0){
                this.readyToShoot = true;
            }
        }
    };
    Cannon.prototype.shoot = function(){
        if(this.isDrawn && this.readyToShoot){
            this.readyToShoot = false;
            this.delay = BULLETDELAY;
            var bullet = new Bullet(this.x, this.y, this.heading);
            bullets[bullets.length] = bullet;
        }
    };

    Cannon.prototype.explode = function(){
      image(EXPLOSION[this.index], this.x, this.y, PLAYERSIZE, PLAYERSIZE);
      this.index+=1;
    };

    var solveSystem(line1, line2){
        /*
        ax + b = y
        cx + d = y

        ax+b = cx+d
        (a-c)x = d-b
        x = (d-b)/(a-c);

        y = a(d-b)/(a-c) + b
        */
        if(line1[0] === line2[0]){
            if(line1[1] === line2[1]){
                return COINSC;
            }
            else{
                return PARAL;
            }
        }
        var x = (line2[1] - line1[1]) / (line1[0]-line2[0]);
        var y = line1[0]*x + line1[1];
        return [x, y];
    }
    var Obstacle = function(x1, y1, x2, y2, x3, y3, x4, y4){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.x4 = x4;
        this.y4 = y4;
        this.x = [x1, x2, x3, x4];
        this.y = [y1, y2, y3, y4];
        this.isDrawn = false;
        this.equations = [[(y2-y1)/(x2-x1),y1-(x1*(y2-y1)/(x2-x1))],
                          [(y3-y2)/(x3-x2),y2-(x2*(y3-y2)/(x3-x2))],
                          [(y4-y3)/(x4-x3),y3-(x3*(y4-y3)/(x4-x3))],
                          [(y1-y4)/(x1-x4),y4-(x4*(y1-y4)/(x1-x4))]];
    };
    Obstacle.prototype.draw = function(){02*1/
        this.isDrawn = true;
        quad(x1, y1, x2, y2, x3, y3, x4, y4);
    };

    Obstacle.prototype.isOn = function(x, y){
        var toPoint = [[(y-y1)/(x-x1),y1-(x1*(y-y1)/(x-x1))],
                       [(y-y2)/(x-x2),y2-(x2*(y-y2)/(x-x2))],
                       [(y-y3)/(x-x3),y3-(x3*(y-y3)/(x-x3))],
                       [(y-y4)/(x-x4),y4-(x4*(y-y4)/(x-x4))]];

        for(var i = 0; i<toPoint.length; i++){
            for(var j = 0; j<this.equations.length; j++){
                var intersection = solveSystem(toPoint[i], this.equation[j]);
                if(intersection!== PARAL && intersection!== COINSC){
                    if(intersection[0] >= x && intersection[0]<=this.x[i] && intersection[1] >= x && intersection[1]<=this.y[i]||
                       intersection[0] >= x && intersection[0]<=this.x[i] && intersection[1] <= x && intersection[1]>=this.y[i]||
                       intersection[0] <= x && intersection[0]>=this.x[i] && intersection[1] >= x && intersection[1]<=this.y[i]||
                       intersection[0] <= x && intersection[0]>=this.x[i] && intersection[1] <= x && intersection[1]>=this.y[i]){
                          return false;
                     }
                 }
            }
        }
        return true;
    }
    Obstacle.prototype.playerColide = function(){
        if((player.x> ))
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
        background(SCENECOLOR[0],SCENECOLOR[1],SCENECOLOR[2]);
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
        background(SCENECOLOR[0],SCENECOLOR[1],SCENECOLOR[2]);

        BEFOREPAUSE = PLAYERSTATE;

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
      background(SCENECOLOR[0], SCENECOLOR[1], SCENECOLOR[2])
			CONTINUEBUTTON.draw();

			fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
			textSize(2*MESSAGESIZE);
			textAlign(CENTER, CENTER);
			text("YOU WON", XDIMENTION/2, YDIMENTION/3);

    };

    var startGame = function(){
        CAMERARELATIVEY = 0;
        CAMERARELATIVEX = 0;
        PLAYERSTATE = ALIVE;
    };

    var disableAllButtons = function(){
      for(var i = 0; i<BUTTONS.length; i++){
        BUTTONS[i].isDrawn = false;
      }
    };

    var move = function(){
        player.xSpeed = SPEED * cos(player.direction);
        player.ySpeed = SPEED * sin(player.direction);

    };

    var turn = function(dir){
        if(dir === "Right"){
            player.direction = (360 + (player.direction - TURNINGSPEED))%360;
        }
        else if(dir === "Left"){
            player.direction = (player.direction + TURNINGSPEED)%360;
        }

    };

    var checkFinal = function(){
        if(Math.sqrt((player.x-EARTHPOSX)*(player.x-EARTHPOSX) + (player.y-EARTHPOSY)*(player.y-EARTHPOSY))<=EARTHSIZE/2){
            PLAYERSTATE = WINNER;
        }
    }

    var checkColision = function(){
        for(var obst = 0; obst<obstacles.length; obst++){
            if(obstacles[obst].playerColide()){
                PLAYERSTATE = KILLED;
            }
            for(var bul = 0; bul<bullets.length; bul++){
                if(obstacle[obst].bulletColide(bul)){
                    bullet[bul].destroy();
                }
            }
        }
    };

    var checkHits = function(){
        for(var bul = 0; bul<bullets.length; bul++){
            if(bullets[bul].hitPlayer()){
                PLAYERSTATE = KILLED;
            }
            for(var can = 0; can< cannons.length; can++){
                if(bullets[bul].hitCannon(can)){
                    cannon[can].explode();
                }
            }
        }
    };

    var gameRunning = function(){
        drawField();
        player.draw();
        PAUSE.draw();

        if(input[UP]){
            move();
        }
        if(input[RIGHT]){
            turn("Right");
        }
        if(input[LEFT]){
            turn("Left");
        }
        if(input[CONTROL]){
            player.shoot();
        }

        checkHits();
        checkColision();
        checkFinal();
    }
    //pre-defined function called always that the user press a key
		keyPressed = function(){
			input[keyCode] = true;
		};
		//pre-defined function called always that the user release a key
		keyReleased = function(){
			input[keyCode] = false;
		};

		//per-defined function called always that the used click with the mouse
		mouseClicked = function(){
			for(var i = 0; i<BUTTONS.length; i++){
				if(BUTTONS[i].isDrawn && BUTTONS[i].isOver(mouseX, mouseY)){
					if(i === 0){//pause
						BEFOREPAUSE = PLAYERSTATE;
						PLAYERSTATE = PAUSED;
					}
					else if(i === 1){//continue from pause
						PLAYERSTATE = BEFOREPAUSE;

					}
					else if(i===2){//restart from pause
						startGame();
					}
					else if(i === 3){//quit from pause
						PLAYERSTATE = GAMEOVER;
					}
					else if(i===4){//again
						startGame();

					}
					else if(i===5){//quit
						PLAYERSTATE = GAMEOVER;
					}
					else if(i===6){//start
						startGame();
					}
					else if(i===7){//continue
						PLAYERSTATE = WAITTING;
					}

					disableAllButtons();

					}
			}
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
