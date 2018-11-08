'use strict';
var Mario=require('./Mario.js');

var player;
  var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y=400;
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.lanzar=this.game.input.keyboard.addKey(Phaser.Keyboard.Z);


    player=new Mario(this.game,0,450,'spritesMario','cappy');

    this.game.camera.follow(player);
  },
  update: function(){
    //Movimientoz
    if(this.teclas.right.isDown)
    {
      player.Move(1);
    }
    else if(this.teclas.left.isDown)
    {
      player.Move(-1);
    }
    else
    {
      player.NotMoving();
    }

    //Salto
    if (this.saltar.isDown)
    {
      player.Jump();
    }
    if(this.teclas.up.isDown)
    {
      player.Tackle();
    }

    //Agacharse
    if(this.teclas.down.isDown)
    {
      player.Crouch();
    }
    if(this.teclas.down.isUp)
    {
      player.NotCrouching();
    }

    //Lanzar Cappy
    if(this.lanzar.isDown)
    {
      player.ThrowCappy();
    }
    else
      player.CappyReleased();

    player.CheckCappy();
    player.CappyCollision();
    player.checkOnFloor();
  },
  render: function()
  {

  }
};

module.exports = PlayScene;
