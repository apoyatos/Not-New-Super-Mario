'use strict';
var Mario=require('./Mario.js');

var player;
  var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y=300;
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    player=new Mario(this.game,0,400,'Mario')
    player.body.collideWorldBounds = true
    this.game.world.addChild(player);  
    this.game.camera.follow(player);
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
      player.body.velocity.x=0;
    }
    //salto
    if (this.saltar.isDown)
    {
      player.Jump();
    }


  },
  render: function()
  {

  }
};

module.exports = PlayScene;
