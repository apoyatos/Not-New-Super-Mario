'use strict';
var Mario = require('./Mario.js');
var Enemy = require('./enemy.js');

var player;
var goomba;
var targetExample;

var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 400;
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    
    player = new Mario(this.game, 0, 450, 'spritesMario', 'cappy');
    this.game.camera.follow(player);

    goomba = new Enemy(this.game, this.game.width / 4, this.game.height, 'goomba', 0, 100, 150, 100);
    this.game.world.addChild(goomba);
    goomba.scale.setTo( 2, 2);
    goomba.AddAnimation('walk', [0, 1], 5);

    targetExample = new Enemy(this.game, this.game.width, this.game.height, 'goomba', 0, 0, 0, 0);
    this.game.world.addChild(targetExample);
    targetExample.scale.setTo( 2, 2);
  },
  update: function(){
    //Movimiento
    if(this.teclas.right.isDown)
      player.Move(1);
    else if(this.teclas.left.isDown)
      player.Move(-1);
    else
      player.NotMoving();

    //Salto
    if (this.saltar.isDown)
      player.Jump();
    if(this.teclas.up.isDown)
      player.Tackle();

    //Agacharse
    if(this.teclas.down.isDown)
      player.Crouch();
    if(this.teclas.down.isUp)
      player.NotCrouching();

    //Lanzar Cappy
    if(this.lanzar.isDown)
      player.ThrowCappy();
    else
      player.CappyReleased();

    player.CheckCappy();
    player.CappyCollision();
    player.checkOnFloor();

    goomba.Move();
    goomba.Shoot(targetExample);
  },
  render: function() {
    
  }
};

module.exports = PlayScene;
