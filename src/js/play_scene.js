'use strict';
var Mario=require('./Mario.js');

var player;
  var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y=400;
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    player=new Mario(this.game,0,450,'spritesMario');
    player.scale.setTo(2,2);
    player.body.collideWorldBounds = true;
    this.game.world.addChild(player);  
  },
  update: function(){
    //Movimiento
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
      player.Swim();
    }
    if(this.teclas.up.isDown)
    {
      player.BombJump();
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

  },
  render: function()
  {

  }
};

module.exports = PlayScene;
