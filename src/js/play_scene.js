'use strict';
var Mario=require('./Mario.js');
var Player;
  var PlayScene = {
  create: function () {
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    Player=new Mario(this.game,0,400,'Mario')
    this.game.world.addChild(Player);   
  },
  update: function(){
    if(this.teclas.right.isDown)
    {
      Player.Move(1);
    }
    else if(this.teclas.left.isDown)
    {
      Player.Move(-1);
    }
    else if (this.saltar.isDown)
    {
      Player.Jump();
    }


  },
  render: function()
  {

  }
};

module.exports = PlayScene;
