'use strict';

var Mario = require('./Mario.js');
var Goomba = require('./Goomba.js');
var Spiny = require('./Spiny.js');
var Planta = require('./PlantaPiraña.js');
var Chomp = require('./Chomp.js');

var Bandera = require('./Bandera.js');
var Moneda = require('./Moneda.js');
var Luna = require('./Luna.js');
var Bloque = require('./Bloque.js');
var Corazon = require('./Corazon.js');
var Boss = require('./Boss.js');

var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Sonido nivel 1
    this.level1Sound = this.game.add.audio('level1');
    this.level1Sound.play();
    this.level1Sound.loop = true;
    //Teclas para input
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.pausar = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
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
    //Objetos del mapa
    this.collectibles = this.game.add.group();
    this.map.createFromObjects('Monedas', 11, 'coins', 0, true, false, this.collectibles, Moneda);
    this.map.createFromObjects('Lunas', 1269, 'moon', 0, true, false, this.collectibles, Luna);
    this.map.createFromObjects('Checkpoints', 1255, 'checkpoint', 0, true, false, this.collectibles, Bandera);
    //this.map.createFromObjects('Enemigos', 1263, 'goomba', 0, true, false, this.goombas, Goomba);
    //this.map.createFromObjects('Enemigos', 1262, 'chomp', 0, true, false, this.chomps, Chomp);
    //this.map.createFromObjects('Enemigos', 1276, 'planta', 0, true, false, this.plants, Planta);
    //this.map.createFromObjects('Enemigos', 1268, 'spiny', 0, true, false, this.spinys, Spiny);
    //Colisiones del mapa
    this.collisions = this.map.createLayer('Colisiones');
    this.map.setCollisionByExclusion([], true, 'Colisiones');
    this.floor = this.map.createLayer('Suelo');
    this.map.setCollisionByExclusion([], true, 'Suelo');
    this.deathZone = this.map.createLayer('Muerte');
    this.map.setCollisionByExclusion([], true, 'Muerte');
    this.blocks = this.map.createLayer('Bloques');
    this.map.setCollisionByExclusion([], true, 'Bloques');
    this.eBlocks1 = this.map.createLayer('BloquesENormales');
    this.map.setCollisionByExclusion([], true, 'BloquesENormales');
    this.eBlocks2 = this.map.createLayer('BloquesECorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesECorazones');
    this.eBlocks3 = this.map.createLayer('BloquesESuperCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesESuperCorazones');
    //Grupos

    this.goombas = this.game.add.group();
    this.plants = this.game.add.group();
    this.chomps = this.game.add.group();
    this.spinys = this.game.add.group();
    this.capturables = this.game.add.group();
    this.shots = this.game.add.group();
    //Arrays
    this.enemies = [];
    this.capturables = [];
    //Objetos: jugador y enemigos
    //Mario
    this.player = new Mario(this.game, 4200, 150, 'mario', 5, this);
    this.game.camera.follow(this.player);
    //Boss
    this.boss = new Boss(this.game, 4300, 0, 'plant', 0, 'chomp', 50, 3, this.player);
    //Enemigos
    this.goombas.add(new Goomba(this.game, 1150, 0, 'goomba', 0, 100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1500, 0, 'goomba', 0, -100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1800, 0, 'goomba', 0, -100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1600, 0, 'goomba', 0, 100, 2, this.player));
    this.chomps.add(new Chomp(this.game, 3800, 0, 'chomp', 0, 50, 150, 300, 1));
    this.chomps.add(this.boss.chomp);
    this.spinys.add(new Spiny(this.game, 4900, 0, 'spiny', 0, 100, 2));
    this.plants.add(new Planta(this.game, 2600, 0, 'plant', 5, 300, 5));
    //Bloques
    this.blocksHandler = new Bloque(this.game, 'coin', 'heart', 'superHeart');
    //Interfaz
    this.vidas = this.game.add.sprite(this.game.width, 0, 'life', 0);
    this.vidas.anchor.setTo(1.5, -0.2);
    this.vidas.fixedToCamera = true;
    this.coins = this.game.add.sprite(0, 0, 'coin', 0);
    this.coins.anchor.setTo(-0.5, -0.5);
    this.coins.fixedToCamera = true;
    this.textCoins = this.game.add.text(0, 0, this.player.coins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textCoins.anchor.setTo(-3.5, -0.3);
    this.textCoins.fixedToCamera = true;
    this.superCoins = this.game.add.sprite(0, 0, 'superCoin', 0);
    this.superCoins.anchor.setTo(-4, -0.5);
    this.superCoins.fixedToCamera = true;
    this.textSuperCoins = this.game.add.text(0, 0, this.player.superCoins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textSuperCoins.anchor.setTo(-9, -0.3);
    this.textSuperCoins.fixedToCamera = true;
    //Pausa
    this.pause = false;
    this.pauseButton = false;
    this.pauseMenuOpen = false;

    this.pauseBackground = this.game.add.sprite(0, 0, 'pause');
    this.pauseBackground.visible = false;

    this.buttonContinue = this.game.add.button(0, 0, 'continue', Continue, this, 0, 2, 1);
    this.buttonContinue.scale.setTo(2, 2);
    this.buttonContinue.anchor.setTo(-0.6, -4);
    this.buttonContinue.visible = false;

    function Continue() {
      this.pauseButton = false;
      this.pauseMenuOpen = false;
      this.level1Sound.resume();
    }

    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(2, 2);
    this.buttonExit.anchor.setTo(-0.6, -5.2);
    this.buttonExit.visible = false;

    function Exit() {
      //En desarrollo
    }
    //Array enemies
    this.enemies.push(this.goombas);
    this.enemies.push(this.chomps);
    this.enemies.push(this.plants);
    this.enemies.push(this.spinys);
    //Array capturables
    this.capturables.push(this.goombas);
    this.capturables.push(this.chomps);
  },
  update: function () {
    //Menu pausa
    this.pausar.onDown.add(PauseMenu, this);
    function PauseMenu() {
      if (!this.pause && !this.pauseButton) {
        this.pauseButton = true;
        this.pauseMenuOpen = true;
      }
    }
    if (this.pauseMenuOpen) {
      this.pauseBackground.visible = true;
      this.buttonContinue.visible = true;
      this.buttonExit.visible = true;
      this.level1Sound.pause();
    }
    else {
      this.pauseBackground.visible = false;
      this.buttonContinue.visible = false;
      this.buttonExit.visible = false;
    }
    //Interfaz
    this.vidas.frame = this.player.life - 1;
    this.textCoins.setText(this.player.coins);
    this.textSuperCoins.setText(this.player.superCoins);
    //Colisiones de Mario con el mapa
    this.game.physics.arcade.collide(this.player, this.floor);
    this.game.physics.arcade.collide(this.player, this.collisions);
    this.game.physics.arcade.collide(this.player, this.deathZone, function (player) { player.Die(); });
    //Colisiones de Mario con los bloques
    this.game.physics.arcade.collide(this.player, this.blocks, function (player, tile) { player.scene.blocksHandler.HitBlock(player, tile); });
    this.game.physics.arcade.collide(this.player, this.eBlocks1, function (player, tile) { player.scene.blocksHandler.HitEBlock(player, tile, 'coin'); });
    this.game.physics.arcade.collide(this.player, this.eBlocks2, function (player, tile) { player.scene.blocksHandler.HitEBlock(player, tile, 'heart'); });
    this.game.physics.arcade.collide(this.player, this.eBlocks3, function (player, tile) { player.scene.blocksHandler.HitEBlock(player, tile, 'superHeart'); });
    //Colisiones de Cappy con el mapa
    this.game.physics.arcade.collide(this.player.cappy, this.collisions);
    //colisiones objetos con el mapa
    this.game.physics.arcade.collide(this.floor, this.collectibles);
    this.game.physics.arcade.collide(this.eBlocks2, this.collectibles);
    this.game.physics.arcade.collide(this.eBlocks3, this.collectibles);
    //Colisiones de enemigos con el mapa y los bloques
    this.enemies.forEach(
      function (item) {
        item.forEach(
          function (item) {
            this.game.physics.arcade.collide(item, this.floor);
            this.game.physics.arcade.collide(item, this.collisions, function (enemy) { enemy.ChangeDir(); });
            this.game.physics.arcade.collide(item, this.blocks);
            this.game.physics.arcade.collide(item, this.eBlocks1);
            this.game.physics.arcade.collide(item, this.eBlocks2);
            this.game.physics.arcade.collide(item, this.eBlocks3);
          }, this);
      }, this);

    this.game.physics.arcade.collide(this.boss, this.floor);
    this.game.physics.arcade.collide(this.boss, this.collisions, function (enemy) { enemy.ChangeDir(); });
    this.game.physics.arcade.collide(this.boss, this.blocks);
    this.game.physics.arcade.collide(this.boss, this.eBlocks1);
    this.game.physics.arcade.collide(this.boss, this.eBlocks2);
    this.game.physics.arcade.collide(this.boss, this.eBlocks3);
    //Pausa
    if (!this.pause && !this.pauseButton) {
      //boss
      if (this.boss.alive) {
        this.boss.Move();
        this.boss.Hurt();
      }
      //Andar
      if (this.teclas.right.isDown)
        this.player.Move(1);
      else if (this.teclas.left.isDown)
        this.player.Move(-1);
      else
        this.player.NotMoving();
      //Correr y rodar
      if (this.correr.isDown)
        this.player.running = true;
      else
        this.player.running = false;
      //Salto e impulso aereo
      if (this.saltar.isDown)
        this.player.Jump();
      if (this.teclas.up.isDown)
        this.player.Tackle();
      //Agacharse y salto bomba
      if (this.teclas.down.isDown) {
        this.player.Crouch();
        this.player.JumpBomb();
      }
      if (this.teclas.down.isUp)
        this.player.NotCrouching();
      //Lanzar a Cappy
      if (this.lanzar.isDown)
        this.player.ThrowCappy();
      else if (this.player.cappy != null)
        this.player.cappy.cappyHold = false;
      //Control de eventos de Mario
      this.player.body.gravity.y = 500;
      this.player.CheckOnFloor();
      this.player.handleAnimations();
      //Control de eventos de Cappy
      if (this.player.cappy != null) {
        this.player.cappy.Check();
        this.player.cappy.Collision();
      }
      //Goombas
      this.goombas.forEach(
        function (item) {
          if (item.alive) {
            item.Move();
            item.Die();
          }
        });
      //Chomps
      this.chomps.forEach(
        function (item) {
          if (item.alive) {
            item.Move();
            item.Attack(this.player);
          }
        }, this);
      //Spinys
      this.spinys.forEach(
        function (item) {
          if (item.alive) {
            item.Move();
          }
        });
      //Plantas
      this.plants.forEach(
        function (item) {
          if (item.alive && item.inCamera) {
            var shot = item.Shoot(this.player);
            if (shot != undefined)
              this.shots.add(shot);
          }
        }, this);
      //Colisiones de Mario con objetos
      this.collectibles.forEach(
        function (item) {
          this.player.CollectibleCollision(item, this);
        }, this);
      //Colisiones de Mario con enemigos
      this.enemies.forEach(
        function (item) {
          item.forEach(
            function (item) {
              this.player.EnemyCollision(item);
              if (this.player.cappy != null)
                this.player.cappy.Stunn(item);
            }, this);
        }, this);
      //Colisiones de Mario con disparos
      this.shots.forEach(
        function (item) {
          if (item.body.velocity.x == 0 && this.planta != undefined) {
            item.body.velocity.x = this.planta.shootingSpeed * item.posX;
            item.animations.play(item.sprite);
          }
          if (this.player.EnemyCollision(item)) {
            item.destroy();
          }
          if (item.alive)
            item.RemoveShot();
        }, this);
      //Colisiones de Cappy con enemigos
      this.capturables.forEach(
        function (item) {
          item.forEach(
            function (item) {
              if (this.player.cappy != null)
                this.player.cappy.Capture(item, this);
            }, this);
        }, this);
    }
    else {
      //Mario
      this.player.body.gravity.y = 0;
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;
      this.player.animations.stop();
      //Cappy
      if (this.player.cappy != null) {
        this.player.cappy.body.velocity.x = 0;
        this.player.cappy.animations.stop();
      }
      //Goombas
      this.goombas.forEach(
        function (item) {
          if (item.alive) {
            item.body.velocity.x = 0;
            item.animations.stop();
          }
        }, this);
      //Chomps
      this.chomps.forEach(
        function (item) {
          if (item.alive) {
            item.body.velocity.x = 0;
            item.animations.stop();
          }
        }, this);
      //Spinys
      this.spinys.forEach(
        function (item) {
          if (item.alive) {
            item.body.velocity.x = 0;
            item.animations.stop();
          }
        });
      //Disparos
      this.shots.forEach(
        function (item) {
          if (item.body.velocity < 0)
            item.posX = 1;
          else
            item.posX = -1;
          item.body.velocity.x = 0;
          item.animations.stop();
        }, this);
    }
  }
};

module.exports = PlayScene;
