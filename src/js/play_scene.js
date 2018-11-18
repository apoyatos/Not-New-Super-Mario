'use strict';

var Mario = require('./Mario.js');
var Goomba = require('./Goomba.js');

var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);

    this.game.stage.backgroundColor = '#787878';
    this.map = this.game.add.tilemap('mario');
    this.map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');

    this.layer=this.map.createLayer('World1');
    this.layer.setScale(2.5,2.5)
    this.layer.resizeWorld();

    this.collisions=this.map.createLayer('Colisiones');
    this.collisions.setScale(2.5,2.5);
    this.map.setCollisionBetween(1,999,true,'Colisiones')

    this.enemies = [];
    this.capturables = [];

    this.player = new Mario(this.game, 0, 450, 'mario', 5);
    this.goomba = new Goomba(this.game, this.game.width, this.game.height, 'goomba', 0, 100, 2, this.player);
    this.game.camera.follow(this.player);

    this.enemies.push(this.goomba);
    this.capturables.push(this.goomba);
  },
  update: function () {
    this.game.physics.arcade.collide(this.player,this.collisions);

    //Movimiento
    if (this.teclas.right.isDown)
      this.player.Move(1);
    else if (this.teclas.left.isDown)
      this.player.Move(-1);
    else
      this.player.NotMoving();
    //Salto
    if (this.saltar.isDown)
      this.player.Jump();
    if (this.teclas.up.isDown)
      this.player.Tackle();
    //Agacharse
    if (this.teclas.down.isDown)
      this.player.Crouch();
    if (this.teclas.down.isUp)
      this.player.NotCrouching();
    //Lanzar a Cappy
    if (this.lanzar.isDown)
      this.player.ThrowCappy();
    else if (this.player.cappy != null)
      this.player.cappy.cappyHold = false;
    //Manejo de eventos
    this.player.CheckOnFloor();
    this.player.handleAnimations();

    if (this.player.cappy != null) {
      this.player.cappy.Check();
      this.player.cappy.Collision();
    }

    if (this.goomba.alive) {
      this.goomba.Move();
      /*
      var shot = this.goomba.EnemyShoot(this.player);
      if (shot != undefined)
        this.enemies.push(shot);
        */
    }

    this.player.EnemyCollision(this.goomba);
    if (this.player.cappy != null)
      this.player.cappy.Capture(this.goomba);
    /*
    //Meter todos los enemigos en un grupo y llamar a esta funcion para cada uno
    this.enemies.forEach(
      function (item) {
        this.player.EnemyCollision(this.item);
      }
    );
    this.capturables.forEach(
      function (item) {
        if (this.player.cappy != null)
          this.player.cappy.Capture(this.item);
      }
    );
    */
  }
};

module.exports = PlayScene;
