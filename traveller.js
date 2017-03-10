/**
	The traveller: minigame by WWV

	Thanks for visiting the source code, any doubt comment or suggestion please contact me
	sending an e-mail to:
		wwvargas2011@hotmail.com

	Feel free to reuse codes found here, if you do so and desire to refer please add a link
	to the site: www.wwv.com.

	The source code is developed using Processing.js.

	The objective of this game is escape of the hostile ambient arriving on the finish line
  be cautions, barrers can easily tear you down and there also is cannons looking straight
  to your spaceship.

	Controls:

		UP -> Move Forward
		LEFT -> Turn left
		RIGHT -> Turn right
		CONTROL -> Shoot

*/

//Processig Instance
var sketchProc = function(processingInstance) {
 with (processingInstance) {
    //Essential variables defining screen size and the frames per second rate
    var XDIMENTION = 800;
    var YDIMENTION = 600;
    var FPS = 60;
    //size and frames persecond definitions
    size(XDIMENTION, YDIMENTION);
    frameRate(FPS);
    //movement related variables
    var SPEED = 3;
    var TURNINGSPEED = 1/20;
    var ATRITTION = SPEED/FPS;
    var BULLETDELAY = FPS/2;
    var BULLETSPEED = 10;
    var CANNONBULLETSPEED = BULLETSPEED/2;
    var CANNONDELAY = BULLETDELAY/2;

    //Objects default size definitions
    var PLAYERSIZE = XDIMENTION /10;
    var CANNONSIZE = XDIMENTION / 15;
    var BULLETSIZE = PLAYERSIZE/10;

    //auxiliar variable to track the frame and control when some verification is made
    var CURRENTFRAME = 0;

    //Possible states within the game
    var DEAD = 0;
    var ALIVE = 1;
    var KILLED = 2;
    var PAUSED = 3;
    var WINNER = 4;
    var GAMEOVER = 5;
    var WAITTING = 6;
    var PLAYERSTATE = WAITTING;

    //Cannon state to be removed when the explosion animation is over
    var REMOVECANNON = 42;

    //game difficults
    var EASY = 0;
    var NORMAL = 1;
    var HARD = 2;
    var MODE = NORMAL;

    //message default size
    var MESSAGESIZE = 24;

    //buttons default size
    var BUTTONWIDTH = XDIMENTION/4;
    var BUTTONHEIGHT = YDIMENTION/8;

    //colors definitions
    var BACKGROUNDCOLOR = [133, 51, 181];
    var OBSTACLECOLOR = [30, 30, 30];
    var BUTTONCOLOR = [72, 0, 114];
    var BUTTONLABEL = [204, 204, 255];
    var MESSAGECOLOR = [255, 255, 255];
    var SCENECOLOR = [0, 102, 204];

    //Images definitions
    var PLAYERIMAGE = loadImage("./img/Traveller/Player.png");
    var BULLETIMAGE = loadImage("./img/Traveller/Bullet.png");
    var CANNONIMAGE = loadImage("./img/Traveller/Cannon.png");
    var EXPLOSION = [loadImage("./img/Traveller/Explosion/EXPL1.png"),
                     loadImage("./img/Traveller/Explosion/EXPL2.png"),
                     loadImage("./img/Traveller/Explosion/EXPL3.png"),
                     loadImage("./img/Traveller/Explosion/EXPL4.png"),
                     loadImage("./img/Traveller/Explosion/EXPL5.png"),
                     loadImage("./img/Traveller/Explosion/EXPL6.png"),
                     loadImage("./img/Traveller/Explosion/EXPL7.png"),
                     loadImage("./img/Traveller/Explosion/EXPL8.png"),
                     loadImage("./img/Traveller/Explosion/EXPL9.png"),
                     loadImage("./img/Traveller/Explosion/EXPL10.png"),
                     loadImage("./img/Traveller/Explosion/EXPL11.png"),
                     loadImage("./img/Traveller/Explosion/EXPL12.png")];

    //relative position variables to allow wider movements
    var CAMERARELATIVEX = 0;
    var CAMERARELATIVEY = 0;

    //finish line position related variables, defined at generateField function
    var FINISHLINETLX;
    var FINISHLINETLY;
    var FINISHLINEBRX;
    var FINISHLINEBRY;

    //arrays of used objects
    var bullets = [];
    var obstacles = [];
    var cannons = [];

    //store boolean values to keys to determine whether one is pressed
    var input =[];

    //Bullet Object definition
    var Bullet = function(x, y, heading, cannon){
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.img = BULLETIMAGE;
        this.isDrawn = true;
        this.cannon = cannon;
    };
    //draw and update the position of the bullet due to its speed
    Bullet.prototype.draw = function(){
        if(this.cannon === false){
            this.x-=BULLETSPEED * cos(this.heading);
            this.y-=BULLETSPEED * sin(this.heading);
        }
        else{
            this.x-=(CANNONBULLETSPEED) * cos(this.heading);
            this.y-=(CANNONBULLETSPEED) * sin(this.heading);
        }

        image(this.img, this.x-CAMERARELATIVEX, this.y-CAMERARELATIVEY, BULLETSIZE, BULLETSIZE);

    };
    /*verify if the bullet may or may not be drawn due to its position compared with the
    camera relatives variables
    */
    Bullet.prototype.mayDraw = function(index){
      var x = this.x-CAMERARELATIVEX;
      var y = this.y-CAMERARELATIVEY;
        if(x<=(4/3)*XDIMENTION && x>=-(1/3)*XDIMENTION && y<=(4/3)*YDIMENTION && y>=-(1/3)*YDIMENTION){
            this.isDraw = true;
         }
         else{
            this.isDraw = false;
            removeItem(bullets, index);
         }
    };
    //player object definitions
    var Player = function(x, y){
        this.x = x;
        this.y = y;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.img = PLAYERIMAGE;
        this.readyToShoot = true;
        this.delay = 0;
        //represent the angle headed by the Player
        this.heading = Math.PI/2;
        this.index = 0;
        this.bulletOutput=[this.x+(PLAYERSIZE/2) - PLAYERSIZE*(4/5)*cos(this.heading), (this.y+PLAYERSIZE/2) - PLAYERSIZE*(4/5)*sin(this.heading)];
    };

    //draw and update the position of the player
    Player.prototype.draw = function(){
        this.x -= this.xSpeed;
        this.y -= this.ySpeed;
        CAMERARELATIVEY-=this.ySpeed;
        CAMERARELATIVEX-=this.xSpeed;
        pushMatrix();
        translate(this.x- CAMERARELATIVEX + PLAYERSIZE/2, this.y- CAMERARELATIVEY+ PLAYERSIZE/2);
        rotate(this.heading);


        image(this.img, -PLAYERSIZE/2, -PLAYERSIZE/2, PLAYERSIZE, PLAYERSIZE);

        popMatrix();

        this.bulletOutput=[this.x+(PLAYERSIZE/2) - PLAYERSIZE*(4/5)*cos(this.heading), (this.y+PLAYERSIZE/2) - PLAYERSIZE*(4/5)*sin(this.heading)];
        if(!this.readyToShoot){
            this.delay -= 1;
            if(this.delay <=0){
              this.readyToShoot = true;
            }
        }

    };
    //generate a bullet in front of the player and with the same direction
    Player.prototype.shoot = function(){
        if(this.readyToShoot){
            this.readyToShoot = false;
            this.delay = BULLETDELAY;
            var bullet = new Bullet(this.bulletOutput[0], this.bulletOutput[1], this.heading, false);
            bullets.push(bullet)

        }

    };
    //start the explosions animation
    Player.prototype.explode = function(){
        image(EXPLOSION[this.index], this.x-CAMERARELATIVEX, this.y-CAMERARELATIVEY, PLAYERSIZE, PLAYERSIZE);
        this.index+=1;
        if(this.index>=12){
            PLAYERSTATE = DEAD;
            this.index = 0;
        }
    };

    //global variable of the player used througout the game
    var player = new Player(XDIMENTION/2,YDIMENTION/2);

    //defined here to have a definition of player
    //determine if a bullet hitted the player
    Bullet.prototype.hitPlayer = function(){
          return(this.x>=player.x && this.x<=player.x+PLAYERSIZE && this.y>=player.y && this.y<=player.y+PLAYERSIZE);
    }
    //determine if a bullet hitted a cannon
    Bullet.prototype.hitCannon = function(index){
            return(this.x>=cannons[index].x && this.x<=cannons[index].x+CANNONSIZE && this.y>=cannons[index].y && this.y<=cannons[index].y+CANNONSIZE);
    }

    //cannon object definition
    var Cannon = function(x, y){
        this.x = x;
        this.y = y;
        this.img = CANNONIMAGE;
        this.heading = 90;
        this.readyToShoot = true;
        this.delay = 0;
        this.isDrawn = true;
        this.state = ALIVE;
        this.index = 0;
        this.bulletOutput=[this.x+(CANNONSIZE/2) + CANNONSIZE*(4/5)*cos(this.heading), (this.y+CANNONSIZE/2) + CANNONSIZE*(4/5)*sin(this.heading)];

    };

    //draw and update cannon's direction of heading
    Cannon.prototype.draw = function(){

        if(this.state === DEAD){
            this.explode();

        }
        else{
            var dx = this.x - (player.x + PLAYERSIZE/2);
            var dy = this.y - (player.y + PLAYERSIZE/2);
            var tan = dy/dx;

            this.heading = atan(tan);
            if(dx>0){
                this.heading = (this.heading + Math.PI) % (2*Math.PI);
            }
            pushMatrix();
            translate(this.x + CANNONSIZE/2 - CAMERARELATIVEX, this.y +CANNONSIZE/2 - CAMERARELATIVEY);
            rotate(this.heading);
            image(this.img, -CANNONSIZE/2, -CANNONSIZE/2, CANNONSIZE, CANNONSIZE);
            popMatrix();
            this.isDrawn = true;
            if(this.delay>0){
                this.delay -=1;
            }
            this.bulletOutput=[this.x+(CANNONSIZE/2) + CANNONSIZE*(4/5)*cos(this.heading), (this.y+CANNONSIZE/2) + CANNONSIZE*(4/5)*sin(this.heading)];

            var distance = Math.sqrt(((this.x + CANNONSIZE/2) - (player.x+PLAYERSIZE/2)) * ((this.x + CANNONSIZE/2) - (player.x+PLAYERSIZE/2)) +
                                     ((this.y + CANNONSIZE/2) - (player.y+PLAYERSIZE/2)) * ((this.y + CANNONSIZE/2) - (player.y+PLAYERSIZE/2)));
            if(this.delay <=0 && distance<YDIMENTION/2){

                this.readyToShoot = true;

                this.shoot();
            }
        }
    };

    //generate a bullet in front of the cannon with the same pointing direction
    Cannon.prototype.shoot = function(){
        if(this.isDrawn && this.readyToShoot){
            this.readyToShoot = false;
            this.delay = CANNONDELAY;
            var bullet = new Bullet(this.bulletOutput[0], this.bulletOutput[1], Math.PI + this.heading, true);
            bullets.push(bullet);
        }
    };

    //start explosion animation at this cannon
    Cannon.prototype.explode = function(){
      this.state = DEAD;
      image(EXPLOSION[this.index], this.x-CAMERARELATIVEX, this.y-CAMERARELATIVEY, PLAYERSIZE, PLAYERSIZE);
      this.index+=1;
      if(this.index>=EXPLOSION.length){
          this.state = REMOVECANNON;
      }
    };

    //verify if the cannon may be drawn
    Cannon.prototype.mayDraw = function(){
      var x = this.x-CAMERARELATIVEX;
      var y = this.y-CAMERARELATIVEY;

        if((x<=(4/3)*XDIMENTION && x>=-(1/3)*XDIMENTION && y<=(4/3)*YDIMENTION && y>=-(1/3)*YDIMENTION)||
           (x+CANNONSIZE<=(4/3)*XDIMENTION && x+CANNONSIZE>=-(1/3)*XDIMENTION && y<=(4/3)*XDIMENTION && y>=-(1/3)*YDIMENTION)||
           (x<=(4/3)*XDIMENTION && x>=-(1/3)*XDIMENTION && y+CANNONSIZE<=(4/3)*XDIMENTION && y+CANNONSIZE>=-(1/3)*YDIMENTION)||
           (x+CANNONSIZE<=(4/3)*XDIMENTION && x+CANNONSIZE>=-(1/3)*XDIMENTION && y+CANNONSIZE<=(4/3)*XDIMENTION && y+CANNONSIZE>=-(1/3)*YDIMENTION)
         ){
            this.isDraw = true;
         }
         else{
            this.isDraw = false;
         }
    };

    //Obstacle object definition
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
        this.isDrawn = true;
        this.equations = [[(y2-y1)/(x2-x1),y1-(x1*(y2-y1)/(x2-x1))],
                          [(y3-y2)/(x3-x2),y2-(x2*(y3-y2)/(x3-x2))],
                          [(y4-y3)/(x4-x3),y3-(x3*(y4-y3)/(x4-x3))],
                          [(y1-y4)/(x1-x4),y4-(x4*(y1-y4)/(x1-x4))]];
    };

    //draw the obstacle
    Obstacle.prototype.draw = function(){

        fill(OBSTACLECOLOR[0], OBSTACLECOLOR[1], OBSTACLECOLOR[2]);
        stroke(OBSTACLECOLOR[0], OBSTACLECOLOR[1], OBSTACLECOLOR[2]);
        quad(this.x1 - CAMERARELATIVEX, this.y1 - CAMERARELATIVEY, this.x2 - CAMERARELATIVEX, this.y2 - CAMERARELATIVEY,
             this.x3 - CAMERARELATIVEX, this.y3 - CAMERARELATIVEY, this.x4 - CAMERARELATIVEX, this.y4 - CAMERARELATIVEY);
    };

    /*verify if a point is on the obstacle

      it uses a loop with two controll variables i and j that will represent vertex
      of the obstacle, this two variables are organized such a way that they represent
      adjacent vertex forming a line.

      The general idea them is like counting the time that a line from outside the
      polygon to a point intercepts its sides, if the number is odd the point is
      inside the polygon if is even no. So the algorithm bellow changes the boolean
      value of answer on each interception

    */
    Obstacle.prototype.isOn = function(x, y){

        var on = false;
        var j = 3;
        for(var i = 0; i<4; j = i++){
            if(((this.y[i]>y) !== (this.y[j]>y)) &&
            (x < (this.x[j] - this.x[i]) * (y - this.y[i]) / (this.y[j] - this.y[i]) + this.x[i])){
                 on = !on;
            }
        }
        return on;

    };
    //determine if the player colided with tthis obstacle
    Obstacle.prototype.playerColide = function(){
        if((this.isOn(player.x+(PLAYERSIZE/4), player.y+(PLAYERSIZE/4)) || this.isOn(player.x+(3/4)*PLAYERSIZE, player.y+(PLAYERSIZE/4))||
             this.isOn(player.x+(PLAYERSIZE/4), player.y+(3/4)*PLAYERSIZE)||this.isOn(player.x+(3/4)*PLAYERSIZE, player.y+(3/4)*PLAYERSIZE))){
                  return true;
             }
        else{
            return false;
        }
    };
    //determine if a bullet colided with this obstacle and remove it if so
    Obstacle.prototype.bulletColide = function(index){
        if(this.isOn(bullets[index].x + BULLETSIZE/2, bullets[index].y + BULLETSIZE/2)){
            removeItem(bullets, index);
        }


    };

    //determine if an obstacle may be drawn on the screen
    Obstacle.prototype.mayDraw = function(){
        for(var i = 0; i<this.x.length; i++){
            if(this.x[i]-CAMERARELATIVEX<=2*XDIMENTION && this.x[i]-CAMERARELATIVEX>=-2*XDIMENTION &&
               this.y[i]-CAMERARELATIVEY<=2*YDIMENTION && this.y[i]-CAMERARELATIVEY>=-2*YDIMENTION){
                  this.isDrawn = true;
                  return;
               }
        }
        this.isDrawn = false;
    };

    //Button object definitions
    var Button = function(x, y, label, bWidth, bHeight){
          this.x = x;
          this.y = y;
          this.label = label;
          this.width = bWidth;
          this.height = bHeight;
          this.isDrawn = false;
    };

    //draw the button
    Button.prototype.draw = function(){
        fill(BUTTONCOLOR[0], BUTTONCOLOR[1], BUTTONCOLOR[2]);
        rect(this.x, this.y, this.width, this.height);
        noStroke();
        fill(BUTTONLABEL[0], BUTTONLABEL[1], BUTTONLABEL[2]);
        textAlign(CENTER, CENTER);
        textSize(MESSAGESIZE);
        text(this.label, this.x + this.width/2, this.y + this.height/2);
        this.isDrawn = true;
    };

    //determine if a point is on the button
    Button.prototype.isOver = function(x, y){
        return (x>=this.x && x<=this.x+this.width && y>=this.y && y<=this.y+this.height);
    };

    //pause button definition
    var PauseButton = function(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDrawn = false;
    };

    //draw the pause button
    PauseButton.prototype.draw = function() {
			fill(153, 153, 255);
      noStroke();
			ellipse(this.x, this.y, this.width, this.height);
			fill(51, 0, 102);
			rect(this.x-this.width/4, this.y - this.height/4, this.width/8, (1/2)*this.height);
			rect(this.x+this.width/8, this.y - this.height/4, this.width/8, (1/2)*this.height);
			this.isDrawn = true;
		};

    //determine if a point s on the pause button
		PauseButton.prototype.isOver = function(x, y){
			return(Math.sqrt((x-this.x)*(x-this.x) + (y - this.y)*(y-this.y))<=this.width/2);
		};

    //instances of buttons used in the game
		var PAUSE = new PauseButton(XDIMENTION * (3/4), BUTTONHEIGHT, BUTTONHEIGHT, BUTTONHEIGHT);
		var PAUSECONTBUTTON = new Button(1*BUTTONWIDTH, (7/2)*BUTTONHEIGHT, "CONTINUE", BUTTONWIDTH*2, BUTTONHEIGHT);
		var PAUSERESTBUTTON = new Button(1*BUTTONWIDTH, 5*BUTTONHEIGHT, "RESTART", BUTTONWIDTH*2, BUTTONHEIGHT);
		var PAUSEQUITBUTTON = new Button(1*BUTTONWIDTH, (13/2)*BUTTONHEIGHT, "QUIT", BUTTONWIDTH*2, BUTTONHEIGHT);
		var AGAINBUTTON = new Button(0.5*BUTTONWIDTH, 6*BUTTONHEIGHT, "TRY AGAIN", BUTTONWIDTH*(3/2), BUTTONHEIGHT);
		var QUITBUTTON = new Button(2.5*BUTTONWIDTH, 6*BUTTONHEIGHT, "QUIT", BUTTONWIDTH, BUTTONHEIGHT);
		var STARTBUTTON = new Button(1*BUTTONWIDTH, 2*BUTTONHEIGHT, "EASY MODE", BUTTONWIDTH*(3/2), BUTTONHEIGHT);
    var NORMALBUTTON = new Button(1*BUTTONWIDTH, 3.5*BUTTONHEIGHT, "NORMAL MODE", BUTTONWIDTH*(3/2), BUTTONHEIGHT);
    var HARDBUTTON = new Button(1*BUTTONWIDTH, 5*BUTTONHEIGHT, "HARCORE", BUTTONWIDTH*(3/2), BUTTONHEIGHT);
		var CONTINUEBUTTON = new Button(2*BUTTONWIDTH, 6*BUTTONHEIGHT, "CONTINUE", (3/2)*BUTTONWIDTH, BUTTONHEIGHT);


		var BUTTONS = [PAUSE, PAUSECONTBUTTON, PAUSERESTBUTTON, PAUSEQUITBUTTON, AGAINBUTTON, QUITBUTTON, STARTBUTTON, CONTINUEBUTTON, NORMALBUTTON, HARDBUTTON];

    /*
        Configurate the field adding the obstacles and cannons definitions to the
        correspondent array
    */
    var generateField = function(){

        var u = XDIMENTION/8; // -> u: default unity

        obstacles = [new Obstacle(-5*u, YDIMENTION - 3*u, 3*u, YDIMENTION - 3*u, 2*u, YDIMENTION - 0*u, -5*u, YDIMENTION - 0*u),
                     new Obstacle(-5*u, YDIMENTION - 6*u, 2*u, YDIMENTION - 6*u, 3*u, YDIMENTION - 3*u, -5*u, YDIMENTION - 3*u),
                     new Obstacle(6*u, YDIMENTION - 7*u, 10*u, YDIMENTION - 8.5*u, 10*u, YDIMENTION - 0*u, 5*u, YDIMENTION - 0*u),
                     new Obstacle(-5*u, YDIMENTION - 10*u, 5*u, YDIMENTION - 10*u, 2*u, YDIMENTION - 6*u, -5*u, YDIMENTION - 6*u),
                     new Obstacle(-1*u, YDIMENTION - 15*u, 15*u, YDIMENTION - 15*u, 16*u, YDIMENTION - 10*u, -1*u, YDIMENTION - 10*u),
                     new Obstacle(10*u, YDIMENTION - 8.5*u, 14*u, YDIMENTION - 7*u, 14*u, YDIMENTION - 0*u, 10*u, YDIMENTION - 0*u),
                     new Obstacle(14*u, YDIMENTION - 7*u, 20*u, YDIMENTION - 7*u, 20*u, YDIMENTION - 0*u, 14*u, YDIMENTION - 0*u),
                     new Obstacle(15*u, YDIMENTION - 15*u, 19*u, YDIMENTION - 12*u, 18*u, YDIMENTION - 9*u, 16*u, YDIMENTION - 10*u),
                     new Obstacle(20*u, YDIMENTION - 7*u, 23*u, YDIMENTION - 10*u, 23*u, YDIMENTION - 0*u, 20*u, YDIMENTION - 0*u),
                     new Obstacle(23*u, YDIMENTION - 10*u, 25*u, YDIMENTION - 14*u, 25*u, YDIMENTION - 0*u, 23*u, YDIMENTION - 0*u),
                     new Obstacle(25*u, YDIMENTION - 14*u, 30*u, YDIMENTION - 14*u, 30*u, YDIMENTION - 0*u, 25*u, YDIMENTION - 0*u),
                     new Obstacle(24*u, YDIMENTION - 22*u, 30*u, YDIMENTION - 22*u, 30*u, YDIMENTION - 14*u, 25*u, YDIMENTION - 14*u),
                     new Obstacle(0*u, YDIMENTION - 18*u, 14*u, YDIMENTION - 18*u, 15*u, YDIMENTION - 15*u, 0*u, YDIMENTION - 15*u),
                     new Obstacle(0*u, YDIMENTION - 20*u, 10*u, YDIMENTION - 20*u, 14*u, YDIMENTION - 18*u, 0*u, YDIMENTION - 18*u),
                     new Obstacle(17*u, YDIMENTION - 29*u, 30*u, YDIMENTION - 29*u, 30*u, YDIMENTION - 22*u, 15*u, YDIMENTION - 22*u),
                     new Obstacle(9*u, YDIMENTION - 29*u, 17*u, YDIMENTION - 29*u, 15*u, YDIMENTION - 22*u, 8.5*u, YDIMENTION - 26*u),
                     new Obstacle(6*u, YDIMENTION - 25*u, 8*u, YDIMENTION - 25*u, 10*u, YDIMENTION - 20*u, 4*u, YDIMENTION - 20*u),
                     new Obstacle(1*u, YDIMENTION - 21*u, 5*u, YDIMENTION - 21*u, 4*u, YDIMENTION - 20*u, 1*u, YDIMENTION - 20*u),
                     new Obstacle(0*u, YDIMENTION - 24*u, 1*u, YDIMENTION - 21*u, 1*u, YDIMENTION - 20*u, 0*u, YDIMENTION - 20*u),
                     new Obstacle(8*u, YDIMENTION - 34*u, 9*u, YDIMENTION - 29*u, 8.5*u, YDIMENTION - 26*u, 6*u, YDIMENTION - 30*u),
                     new Obstacle(5*u, YDIMENTION - 34*u, 8*u, YDIMENTION - 34*u, 6*u, YDIMENTION - 30*u, 4*u, YDIMENTION - 30*u),
                     new Obstacle(0*u, YDIMENTION - 42*u, 4*u, YDIMENTION - 42*u, 4*u, YDIMENTION - 36*u, 0*u, YDIMENTION - 30*u),
                     new Obstacle(4*u, YDIMENTION - 42*u, 11*u, YDIMENTION - 42*u, 11*u, YDIMENTION - 36*u, 4*u, YDIMENTION - 36*u),
                     new Obstacle(11*u, YDIMENTION - 42*u, 16*u, YDIMENTION - 42*u, 16*u, YDIMENTION - 38*u, 11*u, YDIMENTION - 38*u),
                     new Obstacle(11*u, YDIMENTION - 36*u, 15*u, YDIMENTION - 35*u, 14*u, YDIMENTION - 32*u, 12*u, YDIMENTION - 32*u),
                     new Obstacle(11*u, YDIMENTION - 38*u, 16*u, YDIMENTION - 38*u, 15*u, YDIMENTION - 35*u, 11*u, YDIMENTION - 36*u),
                     new Obstacle(21*u, YDIMENTION - 38*u, 23*u, YDIMENTION - 39*u, 23*u, YDIMENTION - 29*u, 19*u, YDIMENTION - 29*u),
                     new Obstacle(16*u, YDIMENTION - 46*u, 23*u, YDIMENTION - 46*u, 23*u, YDIMENTION - 40*u, 16*u, YDIMENTION - 38*u),
                     new Obstacle(23*u, YDIMENTION - 46*u, 30*u, YDIMENTION - 46*u, 30*u, YDIMENTION - 40*u, 23*u, YDIMENTION - 40*u),
                     new Obstacle(23*u, YDIMENTION - 39*u, 30*u, YDIMENTION - 39*u, 30*u, YDIMENTION - 29*u, 23*u, YDIMENTION - 29*u),
                     //frontiers
                     new Obstacle(-5*u, YDIMENTION - 0*u, 10*u, YDIMENTION - 0*u, 10*u, YDIMENTION - (-5)*u, 0*u, YDIMENTION - (-5)*u),
                     new Obstacle(-5*u, YDIMENTION - 30*u, 0*u, YDIMENTION - 30*u, 0*u, YDIMENTION - 24*u, -5*u, YDIMENTION - 24*u),
                     new Obstacle(-5*u, YDIMENTION - 42*u, 0*u, YDIMENTION - 42*u, 0*u, YDIMENTION - 30*u, -5*u, YDIMENTION - 30*u),
                     new Obstacle(-5*u, YDIMENTION - 24*u, 0*u, YDIMENTION - 24*u, 0*u, YDIMENTION - 19*u, -5*u, YDIMENTION - 19*u),

                   ];

        cannons = [new Cannon(5*u, YDIMENTION - (10*u)),
                   new Cannon(18.5*u, YDIMENTION - (10.5*u)),
                   new Cannon(22*u- CANNONSIZE, YDIMENTION - (9*u)),
                   new Cannon(15*u, YDIMENTION - (15*u+CANNONSIZE)),
                   new Cannon(14*u, YDIMENTION - (17.8*u)),
                   new Cannon(17*u, YDIMENTION - (22*u)),
                   new Cannon(18*u, YDIMENTION - (22*u)),
                   new Cannon(19*u, YDIMENTION - (22*u)),
                   new Cannon(20*u, YDIMENTION - (22*u)),
                   new Cannon(21*u, YDIMENTION - (22*u)),
                   new Cannon(22*u, YDIMENTION - (22*u)),
                   new Cannon(1*u, YDIMENTION - (21*u+CANNONSIZE)),
                   new Cannon(0.5*u, YDIMENTION - (23*u)),
                   new Cannon(6*u-CANNONSIZE, YDIMENTION - (30*u)),
                   new Cannon(1*u, YDIMENTION - (32*u)),
                   new Cannon(2.3*u, YDIMENTION - (34*u)),
                   new Cannon(11*u, YDIMENTION - (35*u)),
                   new Cannon(14*u, YDIMENTION - (33*u)),
                   new Cannon(14.7*u, YDIMENTION - (35*u)),
                   new Cannon(15.4*u, YDIMENTION - (37*u)),
                   new Cannon(18*u, YDIMENTION - (39*u)),
                   new Cannon(20*u, YDIMENTION - (39.3*u)),
                   new Cannon(20.5*u , YDIMENTION - (37*u)),
                   new Cannon(20*u, YDIMENTION - (35*u)),
                   new Cannon(19.5*u, YDIMENTION - (33*u)),
                   new Cannon(15*u, YDIMENTION - (29*u + CANNONSIZE))];
        //starts the bullet storer as empty
        bullets =[];

        //definitions of the finish line position
        FINISHLINETLX = 22 *u;
        FINISHLINETLY = YDIMENTION - 40*u;
        FINISHLINEBRX = 22.5 * u;
        FINISHLINEBRY = YDIMENTION - 38*u - YDIMENTION/20;
    };

    //Start scene definitions
    var startScene = function(){
        background(SCENECOLOR[0],SCENECOLOR[1],SCENECOLOR[2]);
        STARTBUTTON.draw();
        NORMALBUTTON.draw();
        HARDBUTTON.draw();

        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
        textAlign(CENTER, CENTER);
        textSize(2*MESSAGESIZE);
        text("THE TRAVELLER", XDIMENTION/2, YDIMENTION/8);

        image(PLAYERIMAGE, XDIMENTION * (3/4), YDIMENTION*(2/3), 2*PLAYERSIZE, 2*PLAYERSIZE);
        image(BULLETIMAGE, XDIMENTION * (3/4) - PLAYERSIZE, YDIMENTION*(2/3) + PLAYERSIZE, BULLETSIZE*2, BULLETSIZE*2);
        image(BULLETIMAGE, XDIMENTION * (3/4) - 3*PLAYERSIZE, YDIMENTION*(2/3) + PLAYERSIZE, BULLETSIZE*2, BULLETSIZE*2);
        image(BULLETIMAGE, XDIMENTION * (3/4) - 5*PLAYERSIZE, YDIMENTION*(2/3) + PLAYERSIZE, BULLETSIZE*2, BULLETSIZE*2);
        image(BULLETIMAGE, XDIMENTION * (3/4) - 7*PLAYERSIZE, YDIMENTION*(2/3) + PLAYERSIZE, BULLETSIZE*2, BULLETSIZE*2);
    };
    //Dead scene definitions
    var deadScene = function(){
        background(0);
        AGAINBUTTON.draw();
        QUITBUTTON.draw();

        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
        textAlign(CENTER, CENTER);
        textSize((3/2)*MESSAGESIZE);
        text("YOU DEAD!!", XDIMENTION/2, YDIMENTION/2);
    };

    //pause scene definitions
    var pauseScene = function(){
        background(SCENECOLOR[0],SCENECOLOR[1],SCENECOLOR[2]);
;

        PAUSECONTBUTTON.draw();
        PAUSERESTBUTTON.draw();
        PAUSEQUITBUTTON.draw();

        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
  			textSize(2*MESSAGESIZE);
  			textAlign(CENTER, CENTER);
  			text("PAUSE", XDIMENTION/2, (3/2)*BUTTONHEIGHT);
    };

    //game over scene definitions
    var gameOverScene = function(){
        background(0);
        CONTINUEBUTTON.draw();

        fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
  			textSize(2*MESSAGESIZE);
  			textAlign(CENTER, CENTER);
  			text("GAME OVER!", XDIMENTION/2, YDIMENTION/3);

    };

    //winner scene definitions
    var winnerScene = function(){
      background(SCENECOLOR[0], SCENECOLOR[1], SCENECOLOR[2])
			CONTINUEBUTTON.draw();

			fill(MESSAGECOLOR[0], MESSAGECOLOR[1], MESSAGECOLOR[2]);
			textSize(2*MESSAGESIZE);
			textAlign(CENTER, CENTER);
			text("YOU WON", XDIMENTION/2, YDIMENTION/3);

    };


    //configurate the control variables to start a new game
    var startGame = function(){
        CAMERARELATIVEY = 0;
        CAMERARELATIVEX = 0;
        generateField();
        player.x = XDIMENTION/2;
        player.y = YDIMENTION/2;
        player.xSpeed = 0;
        player.ySpeed = 0;
        player.heading = Math.PI/2;
        PLAYERSTATE = ALIVE;
    };

    //remove a item given its index from its list
    var removeItem = function(list, index){
        list.splice(index, 1);
    };

    //check which objects from a list may be drawn due to the camera relative
    //position on the screen

    var checkDrawables = function(list, bullet){
        if(bullet){
          for(var i = 0; i<list.length; i++){
              list[i].mayDraw(i);
          }
        }
        else{
            for(var i = 0; i<list.length; i++){
                list[i].mayDraw();
            }
        }
    };

    //configurate the control variables to each difficulty
    var configDifficult = function(){
        if(MODE === EASY){
            CANNONDELAY = BULLETDELAY*4;
            CANNONBULLETSPEED=BULLETSPEED/4;
        }
        else if(MODE === NORMAL){
            CANNONDELAY = BULLETDELAY*2;
            CANNONBULLETSPEED=BULLETSPEED/2;
        }
        else if(MODE === HARD){
            CANNONDELAY = BULLETDELAY;
            CANNONBULLETSPEED=BULLETSPEED;
        }
    };

    //disable all buttons, called when a scene is changed
    var disableAllButtons = function(){
      for(var i = 0; i<BUTTONS.length; i++){
        BUTTONS[i].isDrawn = false;
      }
    };

    //update player speed when the user hits the up arrow
    var move = function(){
        player.xSpeed = SPEED * cos(player.heading);
        player.ySpeed = SPEED * sin(player.heading);

    };

    //rotate the player when the user hits right or left arrows
    var turn = function(dir){
        if(dir === "Right"){
            player.heading = (player.heading + TURNINGSPEED)%(2*Math.PI);
        }
        else if(dir === "Left"){
            player.heading = (2*Math.PI + (player.heading - TURNINGSPEED))%(2*Math.PI);
        }

    };

    //check any collision (player or bullet) with an obstacle
    var checkColision = function(){
        for(var obst = 0; obst<obstacles.length; obst++){
            if(obstacles[obst].playerColide()){
                PLAYERSTATE = KILLED;
            }
            for(var bul = 0; bul<bullets.length; bul++){
                //check and handle bullet collision eith an obstacle
                obstacles[obst].bulletColide(bul);
            }
        }
    };

    //check if a bullet hitted something that explodes (player and cannon)
    var checkHits = function(){
        var hitted = false;
        for(var bul = 0; bul<bullets.length; bul++){
            if(bullets[bul].hitPlayer()){
                PLAYERSTATE = KILLED;
                removeItem(bullets, bul);
            }

            else{
               for(var can = 0; can< cannons.length && !hitted; can++){
                    if(bullets[bul].hitCannon(can)){
                        cannons[can].explode();
                        removeItem(bullets, bul);
                        hitted = true;
                    }
              }
            }
        }
    };

    //draw the finish line
    var drawFinishLine = function(){
            noStroke();
            fill(255, 255, 255);
            var width = FINISHLINEBRX - FINISHLINETLX;
            var height = FINISHLINEBRY - FINISHLINETLY;
            rect(FINISHLINETLX -CAMERARELATIVEX, FINISHLINETLY - CAMERARELATIVEY, width, height);
            fill(0, 0, 0);
            rect(FINISHLINETLX - CAMERARELATIVEX, FINISHLINETLY - CAMERARELATIVEY, width/2, height/5);
            rect(FINISHLINETLX + width/2 - CAMERARELATIVEX, FINISHLINETLY+height/5 - CAMERARELATIVEY, width/2, height/5);
            rect(FINISHLINETLX - CAMERARELATIVEX, FINISHLINETLY+height*(2/5) - CAMERARELATIVEY, width/2, height/5);
            rect(FINISHLINETLX + width/2 - CAMERARELATIVEX, FINISHLINETLY+height*(3/5) - CAMERARELATIVEY, width/2, height/5);
            rect(FINISHLINETLX - CAMERARELATIVEX, FINISHLINETLY+height*(4/5) - CAMERARELATIVEY, width/2, height/5);
    };

    //draw all objects marked to draw on a list
    var drawAllObjects = function(list, cannon){
        if(cannon === false){
            for(var i = 0; i<list.length; i++){
                if(list[i].isDrawn){
                    list[i].draw();
                }
            }
        }
        else{
          for(var i = 0; i<list.length; i++){
              if(list[i].state === REMOVECANNON){
                  removeItem(cannons, i);
              }
              else if(list[i].isDrawn){
                  list[i].draw();
              }
          }
        }

    };

    //draw all the field objects except the player
    var drawField = function(){
          drawFinishLine();
          drawAllObjects(obstacles);
          drawAllObjects(cannons);
          drawAllObjects(bullets);

    };

    //check if the player hittedthe finish line
    var testWin = function(){

        if((player.x > FINISHLINETLX && player.x<FINISHLINEBRX && player.y > FINISHLINETLY && player.y<FINISHLINEBRY)||
           (player.x + PLAYERSIZE> FINISHLINETLX && player.x + PLAYERSIZE<FINISHLINEBRX && player.y > FINISHLINETLY && player.y<FINISHLINEBRY)||
           (player.x > FINISHLINETLX && player.x<FINISHLINEBRX && player.y + PLAYERSIZE> FINISHLINETLY && player.y + PLAYERSIZE<FINISHLINEBRY)||
           (player.x + PLAYERSIZE> FINISHLINETLX && player.x + PLAYERSIZE<FINISHLINEBRX && player.y + PLAYERSIZE> FINISHLINETLY && player.y + PLAYERSIZE<FINISHLINEBRY)){
            return true;
        }
        return false;
    };

    //control the game flow when the PLAYERSTATE is ALIVE
    var gameRunning = function(){
        background(BACKGROUNDCOLOR[0], BACKGROUNDCOLOR[0], BACKGROUNDCOLOR[0]);

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

        if(!input[UP]){
            var currentSpeed = Math.sqrt((player.xSpeed)*(player.xSpeed) + (player.ySpeed)*(player.ySpeed));
            if(currentSpeed!=0){
                var cossine = player.xSpeed/currentSpeed;
                var sine = player.ySpeed/currentSpeed;
                if(player.xSpeed!=0){
                    if(Math.abs(player.xSpeed)<ATRITTION){
                        player.xSpeed = 0;
                    }
                    if(player.xSpeed>0){
                        player.xSpeed -= ATRITTION * Math.abs(cossine);
                    }
                    else if (player.xSpeed<0){
                        player.xSpeed += ATRITTION * Math.abs(cossine);
                    }
                }

                if(player.ySpeed!=0){
                    if(Math.abs(player.ySpeed)<ATRITTION){
                        player.ySpeed = 0;
                    }
                    if(player.ySpeed>0){
                        player.ySpeed -= ATRITTION * Math.abs(sine);
                    }
                    else if (player.ySpeed<0){
                        player.ySpeed += ATRITTION * Math.abs(sine);
                    }
                }
            }
        }
        checkHits();
        checkColision();
        if(testWin()){
            PLAYERSTATE = WINNER;
        }
        CURRENTFRAME++;
        if(CURRENTFRAME >= FPS){
            checkDrawables(cannons, false);
            checkDrawables(obstacles, false);
            checkDrawables(bullets, true);
            CURRENTFRAME = 0;
        }
    }
    //pre-defined function called always that the user press a key
    //used here to mark the key that was pressed
		keyPressed = function(){
			input[keyCode] = true;
		};
		//pre-defined function called always that the user release a key
    //used here to unmark the key that was released
		keyReleased = function(){
			input[keyCode] = false;
		};

		//pre-defined function called always that the used click with the mouse
    //used here to determine if the user click on some button
    mouseClicked = function(){
			for(var i = 0; i<BUTTONS.length; i++){
				if(BUTTONS[i].isDrawn && BUTTONS[i].isOver(mouseX, mouseY)){
					if(i === 0){//pause
						PLAYERSTATE = PAUSED;
					}
					else if(i === 1){//continue from pause
						PLAYERSTATE = ALIVE;

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
					else if(i===6){//start easy mode
            MODE = EASY;
            configDifficult();
            startGame();
					}
					else if(i===7){//continue
						PLAYERSTATE = WAITTING;
					}
          else if(i===8){//start normal mode
            MODE = NORMAL;
            configDifficult();
            startGame();
          }

          else if(i===9){
              MODE = HARD;
              configDifficult();
              startGame();
          }
					disableAllButtons();

					}
			}
		};

    //pre-defined function called FPS times a second
    //used here to control and pass away the game flow

    draw = function(){
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
