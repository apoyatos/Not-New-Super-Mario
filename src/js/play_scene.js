'use strict';

var Mario = require('./Mario.js');
var Goomba = require('./Goomba.js');
var Spiny = require('./Spiny.js');
var Planta = require('./PlantaPiraña.js');
var Monedas = require('./Monedas.js');
var Lunas = require('./Lunas.js');
var Banderas = require('./Checkpoints.js');
var Bloques = require('./Bloques.js');
var Chomp = require('./Chomp.js');

var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Teclas para input
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.correr = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    //Mapa
    this.game.stage.backgroundColor = '#787878';
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('tiles3G', 'tiles3');
    this.map.addTilesetImage('tiles1G', 'tiles1');
    this.map.addTilesetImage('tiles2G', 'tiles2');
    this.layer = this.map.createLayer('World1');
    this.layer.resizeWorld();

    //Colisiones
    this.collisions = this.map.createLayer('Colisiones');
    this.map.setCollisionByExclusion([], true, 'Colisiones');
    this.floor = this.map.createLayer('Suelo');
    this.map.setCollisionByExclusion([], true, 'Suelo');
    this.deathZone = this.map.createLayer('Muerte');
    this.map.setCollisionByExclusion([], true, 'Muerte');
    this.eBlocks = this.map.createLayer('BloquesENormales');
    this.map.setCollisionByExclusion([], true, 'BloquesENormales');
    this.blocks = this.map.createLayer('Bloques');
    this.map.setCollisionByExclusion([], true, 'Bloques');

    //Arrays
    this.collectibles = this.game.add.group();
    this.goombas = this.game.add.group();
    this.capturables = this.game.add.group();
    this.shots = this.game.add.group();

    this.enemies = [];
    this.capturables = [];
    this.blocksHandler = new Bloques(this.game, 'block', 'block');
    //Objetos: jugador y enemigos
    this.player = new Mario(this.game, 2300, 0, 'mario', 5, this);
    this.game.camera.follow(this.player);

    this.map.createFromObjects('Monedas', 11, 'coins', 0, true, false, this.collectibles, Monedas);
    this.map.createFromObjects('Lunas', 1269, 'moon', 0, true, false, this.collectibles, Lunas);
    this.map.createFromObjects('Checkpoints', 1255, 'flag', 0, true, false, this.collectibles, Banderas);

    this.goombas = this.game.add.group();
    this.plants = this.game.add.group();
    this.chomps = this.game.add.group();
    this.spinys = this.game.add.group();

    //this.map.createFromObjects('Enemigos', 1263, 'goomba', 0, true, false, this.goombas, Goomba);
    //this.map.createFromObjects('Enemigos', 1262, 'chomp', 0, true, false, this.chomps, Chomp);
    //this.map.createFromObjects('Enemigos', 1276, 'planta', 0, true, false, this.plants, Planta);
    //this.map.createFromObjects('Enemigos', 1268, 'spiny', 0, true, false, this.spinys, Spiny);

    this.goombas.add(new Goomba(this.game, 1150, 0, 'goomba', 0, 100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1500, 0, 'goomba', 0, -100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1800, 0, 'goomba', 0, -100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1600, 0, 'goomba', 0, 100, 2, this.player));
    this.chomps.add(new Chomp(this.game, 3800, 0, 'chomp', 0, 50, 150, 300, 1));
    this.spinys.add(new Spiny(this.game, 4900, 0, 'spiny', 0, 100, 2));
    this.plants.add(new Planta(this.game, 2600, 0, 'planta', 5, 300, 5));
    this.vidas = this.game.add.sprite(this.game.width - 110, 27, 'vidas', 0);
    this.vidas.scale.setTo(1.5, 1.5);
    this.vidas.fixedToCamera = true;
    //Array enemigo
    this.enemies.push(this.goombas);
    this.enemies.push(this.chomps);
    this.enemies.push(this.plants);
    this.enemies.push(this.spinys);
    //Array capturables
    this.capturables.push(this.goombas);
    this.capturables.push(this.chomps);
  },
  update: function () {
    this.vidas.frame = this.player.life - 1
    console.log(this.shots);
    //Colisiones del mapa respectos a los objetos del juego
    this.game.physics.arcade.collide(this.player, this.floor);
    this.game.physics.arcade.collide(this.player, this.collisions);
    this.game.physics.arcade.collide(this.player, this.deathZone, function (player) { player.Die(); });

    this.game.physics.arcade.collide(this.player, this.blocks, function (player, tile) { player.scene.blocksHandler.HitBlock(player, tile); });
    this.game.physics.arcade.collide(this.player, this.eBlocks, function (player, tile) { player.scene.blocksHandler.HitEBlock(player, tile, 'coin'); });

    this.enemies.forEach(
      function (item) {
        item.forEach(
          function (item) {
            this.game.physics.arcade.collide(item, this.floor);
            this.game.physics.arcade.collide(item, this.collisions, function (enemy) { enemy.ChangeDir(); });
            this.game.physics.arcade.collide(item, this.blocks);
            this.game.physics.arcade.collide(item, this.eBlocks);
          }, this);
      }, this);

    this.game.physics.arcade.collide(this.player.cappy, this.collisions);
    //Correr
    if (this.correr.isDown)
      this.player.running = true;
    else
      this.player.running = false;
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
    //Goomba
    this.goombas.forEach(
      function (item) {
        if (item.alive) {
          item.Move();
          item.Die();
        }
      });
    this.chomps.forEach(
      function (item) {
        if (item.alive) {
          item.Move();
          item.Attack(this.player);
        }
      }, this);
    this.spinys.forEach(
      function (item) {
        if (item.alive) {
          item.Move();
        }
      });
    this.plants.forEach(
      function (item) {
        if (item.alive && item.inCamera) {
          var shot = item.Shoot(this.player);
          if (shot != undefined)
            this.shots.add(shot);
        }
      }, this);
    //colisiones con Objetos
    this.collectibles.forEach(
      function (item) {
        this.player.CollectibleCollision(item);
      }, this);
    //Colisiones con enemigos
    this.enemies.forEach(
      function (item) {
        item.forEach(
          function (item) {
            this.player.EnemyCollision(item);
            if (this.player.cappy != null)
              this.player.cappy.Stunn(item);
          }, this);
      }, this);
    //Colisiones con disparos
    this.shots.forEach(
      function (item) {
        if (this.player.EnemyCollision(item)) {
          item.destroy();
        }
        if (item.alive)
          item.RemoveShot();
      }, this);

    //Enemigos capturados/no capturados
    this.capturables.forEach(
      function (item) {
        item.forEach(
          function (item) {
            if (this.player.cappy != null)
              this.player.cappy.Capture(item);
          }, this);
      }, this);
  }
};



module.exports = PlayScene;
