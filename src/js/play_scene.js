'use strict';

var Mario = require('./Mario.js');
var Goomba = require('./Goomba.js');
var Spiny = require('./Spiny.js');
var Planta = require('./PlantaPiraña.js');
var Chomp = require('./Chomp.js');
var Boss = require('./Boss.js');
var TRex = require('./T-Rex.js');

var Bandera = require('./Bandera.js');
var Moneda = require('./Moneda.js');
var SuperMoneda = require('./SuperMoneda.js');
var Luna = require('./Luna.js');
var Blocks = require('./BlockHandler.js');
var HeartSpawner = require('./HeartSpawner.js');
var CoinSpawner = require('./CoinSpawner.js');

var PlayScene = {
  create: function () {
    //Físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Sonido botón
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Sonido nivel 1
    this.levelSound = this.game.add.audio('level');
    this.battleSound = this.game.add.audio('battle');
    this.winSound = this.game.add.audio('win');
    this.winSound.volume = 1;
    this.levelSound.play();
    this.levelSound.loop = true;
    //Final del nivel 1
    this.win = false;
    //Teclas para input
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.rodar = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.pausar = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
    //Mapa
    this.map = this.game.add.tilemap('tilemap');
    this.map.addTilesetImage('Tiles1', 'tiles1');
    this.map.addTilesetImage('Tiles2', 'tiles2');
    this.layer = this.map.createLayer(1);
    this.layer.resizeWorld();
    //Objetos del mapa
    this.objects = this.game.add.group();
    this.map.createFromObjects('Banderas', 481, 'checkpoint', 0, true, false, this.objects, Bandera);
    this.map.createFromObjects('Monedas', 481, 'coin', 0, true, false, this.objects, Moneda);
    this.map.createFromObjects('SuperMonedas', 481, 'superCoin', 0, true, false, this.objects, SuperMoneda);
    this.map.createFromObjects('Lunas', 481, 'moon', 0, true, false, this.objects, Luna);
    //Colisiones del mapa
    this.collisions = this.map.createLayer('Colisiones');
    this.map.setCollisionByExclusion([], true, 'Colisiones');
    this.deathZone = this.map.createLayer('Muerte');
    this.map.setCollisionByExclusion([], true, 'Muerte');
    this.blocks = this.map.createLayer('Bloques');
    this.map.setCollisionByExclusion([], true, 'Bloques');
    this.coinBlocks = this.map.createLayer('BloquesMonedas');
    this.map.setCollisionByExclusion([], true, 'BloquesMonedas');
    this.heartBlocks = this.map.createLayer('BloquesCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesCorazones');
    this.superheartBlocks = this.map.createLayer('BloquesSuperCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesSuperCorazones');
    //Grupos
    this.enemies = this.game.add.group();
    this.shots = this.game.add.group();
    //Mario
    this.player = new Mario(this.game, 128, 2716, 'mario', 5, this);
    this.game.camera.follow(this.player);
    this.maxMoons = 10;
    this.minMoons = 5;
    //Enemigos:
    //Boss
    this.boss = new Boss(this.game, 5470, 446, 'boss', 0, 'chompBoss', 30, 3, this.player, this);
    this.enemies.add(this.boss);
    //T-Rex
    this.enemies.add(new TRex(this.game, 1408, 2080, 't-rex', 0, this.player));
    //Goombas
    this.enemies.add(new Goomba(this.game, 960, 2816, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 1890, 2688, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 2018, 2688, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 2146, 2688, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 2274, 2688, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 4864, 2848, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 5088, 2848, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 4706, 2112, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 4992, 2112, 'goomba', 0, 100, this.player));
    //Spinys
    this.enemies.add(new Spiny(this.game, 4576, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 4704, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 4832, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 4960, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 5088, 2432, 'spiny', 0, -100));
    //Plantas
    this.enemies.add(new Planta(this.game, 2434, 1568, 'plant', 5, 100, 5));
    this.enemies.add(new Planta(this.game, 3936, 1216, 'plant', 5, 100, 5));
    this.enemies.add(new Planta(this.game, 4736, 2688, 'plant', 5, 100, 5));
    this.enemies.add(new Planta(this.game, 5184, 1120, 'plant', 5, 100, 5));
    //Chomps
    this.enemies.add(new Chomp(this.game, 2912, 2848, 'chomp', 0, 50, 120, 300, 1, this.player, 150));
    this.enemies.add(new Chomp(this.game, 3968, 2382, 'chomp', 0, 50, 120, 300, 1, this.player, 150));
    this.enemies.add(new Chomp(this.game, 4960, 1312, 'chomp', 0, 50, 100, 300, 1, this.player, 150));
    this.enemies.add(this.boss.chomp);
    //Bloques y objetos
    this.blocksHandler = new Blocks(this.game);
    this.coinSpawner = new CoinSpawner(this.game, 'coin');
    this.heartSpawner = new HeartSpawner(this.game, 'heart', 3);
    this.superHeartSpawner = new HeartSpawner(this.game, 'superHeart', 6);
    //Vidas
    this.vidas = this.game.add.sprite(this.game.width, 0, 'life', this.player.life - 1);
    this.vidas.anchor.setTo(1.5, -0.2);
    this.vidas.fixedToCamera = true;
    //Monedas
    this.coins = this.game.add.sprite(0, 0, 'coin', 0);
    this.coins.anchor.setTo(-0.5, -0.5);
    this.coins.fixedToCamera = true;
    this.textCoins = this.game.add.text(this.coins.right + 20, 0, this.player.coins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textCoins.anchor.setTo(0, -0.3);
    this.textCoins.fixedToCamera = true;
    //Super monedas
    this.superCoins = this.game.add.sprite(0, 0, 'superCoin', 0);
    this.superCoins.anchor.setTo(-4, -0.5);
    this.superCoins.fixedToCamera = true;
    this.textSuperCoins = this.game.add.text(this.superCoins.right + 20, 0, this.player.superCoins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textSuperCoins.anchor.setTo(0, -0.3);
    this.textSuperCoins.fixedToCamera = true;
    //Lunas
    this.moonsHUD = [];
    for (var i = 0; i < this.maxMoons; i++) {
      this.moonsHUD[i] = this.game.add.sprite(25 * i, 22, 'moonsHUD', 1);
      this.moonsHUD[i].anchor.setTo(0, -0.5);
      this.moonsHUD[i].fixedToCamera = true;
    }
    //Pausa
    this.pause = false;
    this.pauseButton = false;
    this.pauseMenuOpen = false;
    //Fondo del menu
    this.pauseBackground = this.game.add.sprite(0, 0, 'pause');
    this.pauseBackground.visible = false;
    this.pauseBackground.fixedToCamera = true;
    //Botón Continue
    this.buttonContinue = this.game.add.button(0, 0, 'continue', Continue, this, 0, 2, 1);
    this.buttonContinue.scale.setTo(2, 2);
    this.buttonContinue.anchor.setTo(-0.6, -4);
    this.buttonContinue.visible = false;
    this.buttonContinue.fixedToCamera = true;

    function Continue() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.pauseButton = false;
          this.pauseMenuOpen = false;
          this.levelSound.resume();
        }, this);
      }
      this.clicked = false;
    }
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(2, 2);
    this.buttonExit.anchor.setTo(-0.6, -5.2);
    this.buttonExit.visible = false;
    this.buttonExit.fixedToCamera = true;

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.levelSound.stop();
          this.game.state.start('menu');
        }, this);
      }
      this.clicked = false;
    }
  },
  update: function () {
    //Comprueba si se ha ganado
    if (this.win)
      this.game.state.start('win');
    else {
      //Menu pausa
      this.pausar.onDown.add(PauseMenu, this);
      function PauseMenu() {
        if (!this.pause && !this.pauseButton) {
          this.pauseButton = true;
          this.pauseMenuOpen = true;
        }
      }
      if (this.pauseMenuOpen) //Visible, sin sonido del nivel
      {
        this.pauseBackground.visible = true;
        this.buttonContinue.visible = true;
        this.buttonExit.visible = true;
        this.levelSound.pause();
      }
      else //Desaparece y continua la música
      {
        this.pauseBackground.visible = false;
        this.buttonContinue.visible = false;
        this.buttonExit.visible = false;
      }
      //Colisiones de Mario con el mapa y los bloques
      if (this.player.alive) {
        this.game.physics.arcade.collide(this.player, this.collisions);
        this.game.physics.arcade.collide(this.player, this.deathZone, function (player) { player.Die(); });
        this.game.physics.arcade.collide(this.player, this.blocks, function (player, tile) { player.scene.blocksHandler.HitBlock(player, tile); });
        this.game.physics.arcade.collide(this.player, this.coinBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, player.scene.coinSpawner); });
        this.game.physics.arcade.collide(this.player, this.heartBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, player.scene.heartSpawner); });
        this.game.physics.arcade.collide(this.player, this.superheartBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, player.scene.superHeartSpawner); });
        //Colisiones de Cappy con el mapa
        if (this.player.cappy != null) {
          this.game.physics.arcade.collide(this.player.cappy, this.collisions);
          this.game.physics.arcade.collide(this.player.cappy, this.blocks);
          this.game.physics.arcade.collide(this.player.cappy, this.coinBlocks);
          this.game.physics.arcade.collide(this.player.cappy, this.heartBlocks);
          this.game.physics.arcade.collide(this.player.cappy, this.superheartBlocks);
        }
      }
      //Colisiones de objetos
      this.objects.forEach(
        function (item) {
          if (item.alive) {
            //Colisiones de Mario con objetos
            this.player.ObjectCollision(item);
            //Colisiones con el mapa
            this.game.physics.arcade.collide(item, this.collisions);
            this.game.physics.arcade.collide(item, this.blocks);
            this.game.physics.arcade.collide(item, this.coinBlocks);
            this.game.physics.arcade.collide(item, this.heartBlocks);
            this.game.physics.arcade.collide(item, this.superheartBlocks);
          }
        }, this);
      //Colisiones de enemigos 
      this.enemies.forEach(
        function (item) {
          if (item.alive) {
            //Colisiones
            this.game.physics.arcade.collide(item, this.collisions);
            this.game.physics.arcade.collide(item, this.deathZone, function (enemy) { enemy.Die(); });
            this.game.physics.arcade.collide(item, this.blocks, function (enemy, tile) { enemy.BlockCollision(enemy.player, tile); });
            this.game.physics.arcade.collide(item, this.coinBlocks, function (enemy, tile) { enemy.EspecialBlockCollision(tile, enemy.player.scene.coinSpawner); });
            this.game.physics.arcade.collide(item, this.heartBlocks, function (enemy, tile) { enemy.EspecialBlockCollision(tile, enemy.player.scene.heartSpawner); });
            this.game.physics.arcade.collide(item, this.superheartBlocks, function (enemy, tile) { enemy.EspecialBlockCollision(tile, enemy.player.scene.superHeartSpawner); });
            //Comportamiento de los enemigos
            item.Move();
            item.ChangeDir();
            item.Attack(this.player);
            item.Hurt();
            item.Capture(this.player.cappy);
            if (item.inCamera) {
              var shot = item.Shoot(this.player);
              if (shot != undefined)
                this.shots.add(shot);
            }
            //Colisiones con Mario
            this.player.EnemyCollision(item);
            if (this.player.cappy != null) {
              this.player.cappy.Stunn(item);
            }
          }
        }, this);
      //Bucle del juego
      if (!this.pause && !this.pauseButton) //Condiciones de pausa. Juego activo
      {
        //Andar
        if (this.teclas.right.isDown)
          this.player.Move(1);
        else if (this.teclas.left.isDown)
          this.player.Move(-1);
        else
          this.player.NotMoving();
        //Rodar
        if (this.rodar.isDown)
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
        this.player.body.gravity.y = 500; //Vuelve su gravedad
        this.player.CheckOnFloor();
        this.player.handleAnimations();
        //Control de eventos de Cappy
        if (this.player.cappy != null) {
          this.player.cappy.Check();
          this.player.cappy.Collision();
          if (this.player.cappy.alive && !this.player.cappy.visible)
            this.player.cappy.visible = true;
        }
        //Colisiones de Mario con disparos
        this.shots.forEach(
          function (item) {
            //Devuelve su movimiento y animación
            if (item.body.velocity.x == 0 && item.body.velocity.y == 0) {
              item.body.velocity.x = item.VelX;
              item.body.velocity.y = item.VelY;
              item.animations.play(item.animName);
            }
            this.player.EnemyCollision(item);
            if (item.alive)
              item.RemoveShot();
          }, this);
      }
      //Pausa
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
          this.player.cappy.throwSound.stop();
          this.player.cappy.visible = false;
        }
        //Enemigos
        this.enemies.forEach(
          function (item) {
            if (item.alive) {
              item.body.velocity.x = 0;
              item.body.velocity.y = 0;
              item.animations.stop();
            }
          }, this);
        //Disparos
        this.shots.forEach(
          function (item) {
            //Guarda su dirección
            if (item.body.velocity.x != 0 || item.body.velocity.y != 0) {
              item.VelX = item.body.velocity.x;
              item.VelY = item.body.velocity.y;
            }
            item.body.velocity.x = 0;
            item.body.velocity.y = 0;
            item.animations.stop();
          }, this);
      }
    }
  }
}

module.exports = PlayScene;
