'use strict';

var Mario = require('./Mario.js');
var Capturable = require('./Capturable.js');

var player;
var goomba, animGoomba;

var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    
    this.enemies = [];
    this.capturables = [];

    player = new Mario(this.game, 0, 450, 'mario');
    this.game.camera.follow(player);
 
    goomba = new Capturable(this.game, this.game.width / 2, this.game.height, 'goomba', 0, 100, 2, 200, 4, 0, 400);
    this.game.world.addChild(goomba);
    goomba.scale.setTo( 2, 2);
    animGoomba = goomba.AddAnimation('walk', [0, 1], 5);

    this.enemies.push(goomba);
    this.capturables.push(goomba);
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
    else if(player.cappy != null)
      player.cappy.Released();

    player.CheckOnFloor();
    player.handleAnimations();

    if(player.cappy != null) {
      player.cappy.Check();
      player.cappy.Collision();
    }
    
    if(goomba.alive)
    {
      goomba.EnemyMove(animGoomba);
      var shot = goomba.EnemyShoot(player);
      if(shot != undefined)
        this.enemies.push(shot);
    }
    // meter todos los enemigos en un grupo y llamar a esta funcion para cada uno
    this.enemies.forEach (
      function(item) {
        player.EnemyCollision(item);
      }
    );
    this.capturables.forEach (
      function(item) {
        if(player.cappy != null)
          player.cappy.Capture(item);
      }
    );
  }
};

module.exports = PlayScene;
