
//Globals

var canvas;
var ctx;
var FPS = 40;

//game Vars
var game = {
  start : false,
  paused : false
};


//Game Objects
var ball = {
  x : 150,
  y : 150,
  h : 5, //for simpel collision detection
  w : 5,
  r : 10,
  dx : 2,
  dy : 4,
  draw : function(){
    ctx.drawImage(this.image, this.x, this.y);
  },
  init: function(){
    this.image = new Image();
    this.image.src = 'images/ball.png';
    this.h = this.image.height;
    this.w = this.image.width;
    this.x = 150;
    this.y = 150;
  }
};

var paddle = {
  x : 0,
  y : 0,
  h : 10,
  w : 75,
  draw : function(){
    this.ip();
    drawBox(this.x, this.y, this.w, this.h);
  },
  ip: function(){

    switch(this.move){
      case 'right' :
        if(this.x < (canvas.width - this.w))
          this.x += 5;
        break;
        
      case 'left' :
        if(this.x > 0)
          this.x -= 5;
        break;
      default :
        break;
    }

  },
  init : function(){
    paddle.x = canvas.width/2;
    paddle.y = canvas.height - paddle.h;
  }
}

var brick = {
  init: function(){
    this.rows = 5;
    this.cols = 10;
    this.padding = 1;//pace between bricks
    this.width = (canvas.width / this.cols) - 1;
    this.height = 15;
    this.bricks = new Array(this.rows);
    //Create Bricks
    //TODO: need to move it out and use patterns
    //Need to remove elements once broken
    for (i = 0; i < this.rows ; i++){
      this.bricks[i] = new Array(this.cols);
      for (j = 0; j < this.cols ; j++)
        this.bricks[i][j] = 1;
    }
  },
  draw: function(){
    for (i=0; i < this.rows; i++) {
      for (j=0; j < this.cols; j++) {
        if (this.bricks[i][j] == 1) {
          drawBox(
            (j * (this.width + this.padding)) + this.padding, //Horizontal
            (i * (this.height + this.padding)) + this.padding, //Vertica;
            this.width,
            this.height
            );
        }
      }
    }
  }
  
};

//User actions
var input = {
  keydown: function(e){
    switch(e.keyCode){
      case 39:
        //Move Right
        paddle.move = 'right';
        break;
      case 37:
        paddle.move = 'left';
        break;
      default:
        e = null;
    }
  },
  keyup: function(e){
    paddle.move = false;
  },
  mouse: function(e){
    if(e.pageX > canvas.offset.left && e.pageX < (canvas.offset.left + canvas.width)){
      if(e.pageX - canvas.offset.left < paddle.x)
        paddle.move = 'left';
      else if(e.pageX - canvas.offset.left > paddle.x)
        paddle.move = 'right';
      else
        paddle.move = false;
    }
  },
  init: function(){
    window.onkeydown = input.keydown;
    window.onkeyup = input.keyup;
  //window.onmousemove = input.mouse;
  }
};




//Canvas Drawing function
var drawBox = function(x, y, w, h){
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.closePath();
  ctx.fill();
}


//init
var init = function(){
  if(!game.start){ //Start
    canvas = document.getElementById('screen');
    canvas.offset = $('#screen').offset();
    ctx = canvas.getContext("2d");


    brick.init();
    ball.init();
    paddle.init();
    input.init();

    game.play = setInterval(draw, 1000/FPS);
    game.start = true;

    
  }
  else{//Stop
    game.start = false;
    clearInterval(game.play);
  }
}




var clear = function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var draw = function(){
  clear();

  

  //Break them Bricks
  //Nasty technique, Get the possible position of the ball w.r.t the bricks
  hitRow = Math.floor(ball.y / (brick.height + brick.padding));
  hitCol = Math.floor(ball.x / (brick.width + brick.padding));
  if(
    ball.y < (brick.rows * brick.height) && //if Ball is below the bricks, excluded the padding
    hitRow > 0 && //Ball has reached a row of bricks
    hitCol > 0 && //Ball has reached a column of bricks
    (brick.bricks[hitRow][hitCol] == 1) //There is a brick at this position
  ){
    brick.bricks[hitRow][hitCol] = 0; //Remove the Brick
    ball.dy = -ball.dy;
  }

  //Bounce
  if(ball.x + ball.w >= canvas.width || ball.x  < 0)
    ball.dx = -ball.dx;

  if(ball.y < 0)
    ball.dy = -ball.dy;
  else if( ball.y + ball.h > canvas.height - paddle.h){
    if(ball.x > paddle.x && ball.x < (paddle.x + paddle.w))
      ball.dy = -ball.dy;
    else{
      game.start = false;
      clearInterval(game.play);
      clear();
      //alert('Game Over');
      return false;
    }
  }

  //Update Ball Position
  ball.x += ball.dx;
  ball.y += ball.dy;

  ball.draw();
  paddle.draw();
  brick.draw();
}

function collider(a, b){
  return a.x < b.x + b.w && a.x
}