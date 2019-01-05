'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = {
  preload: function () {
    this.game.load.spritesheet('odyssey', 'images/Odyssey.png', 140, 192);
  },
  create: function () {
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    //Color del fondo
    this.game.stage.backgroundColor = 0x4488aa;
    //Imagen de carga
    this.odyssey = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'odyssey');
    this.odyssey.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(this.odyssey);
    //Imagenes:

    //Menu
    this.game.load.image('logo', 'images/Logo.png');
    this.game.load.spritesheet('start', 'images/Start.png', 306, 56);
    this.game.load.spritesheet('options', 'images/Options.png', 306, 56);
    //Menu pausa y opciones
    this.game.load.image('pause', 'images/MenuPausa.png');
    this.game.load.spritesheet('continue', 'images/Continue.png', 306, 56);
    this.game.load.spritesheet('exit', 'images/Exit.png', 306, 56);
    this.game.load.spritesheet('volume', 'images/Volumen.png', 56, 56);
    //Objetos del mapa
    this.game.load.image('block', 'images/Bloque.png');
    this.game.load.spritesheet('superBlock', 'images/SuperBloque.png', 34, 32);
    this.game.load.spritesheet('coin', 'images/Moneda.png', 15, 16);
    this.game.load.spritesheet('superCoin', 'images/SuperMoneda.png', 16, 16);
    this.game.load.image('heart', 'images/Corazon.png');
    this.game.load.image('superHeart', 'images/SuperCorazon.png');
    this.game.load.image('moon', 'images/Energiluna.png');
    this.game.load.spritesheet('checkpoint', 'images/Bandera.png', 26, 32);
    //Mario y enemigos
    this.game.load.atlas('mario', 'images/Mario.png', 'images/Mario.json');
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('life', 'images/Vida.png', 56, 55);
    this.game.load.spritesheet('moonsHUD', 'images/EnergilunaHUD.png', 25, 22);
    this.game.load.atlas('goomba', 'images/Goomba.png', 'images/Goomba.json');
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 19, 16);
    this.game.load.spritesheet('plant', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('chomp', 'images/Chomp.png', 38, 29);
    this.game.load.image('t-rex', 'images/T-Rex.png');
    this.game.load.spritesheet('fireball', 'images/Disparo-Fuego.png', 9, 9);
    //Mapa
    this.game.load.tilemap('tilemap', 'tilemaps/Nivel1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles1', 'tilemaps/Tileset1.png');
    this.game.load.image('tiles2', 'tilemaps/Tileset2.png');
    //Sonidos:

    //Menu
    this.game.load.audio('start', 'audio/Start.wav');
    this.game.load.audio('press', 'audio/Press.wav');
    //Mario
    this.game.load.audio('jump', 'audio/Jump.wav');
    this.game.load.audio('swim', 'audio/Swim.wav');
    this.game.load.audio('kick', 'audio/Kick.wav');
    this.game.load.audio('kill', 'audio/Kill.wav');
    this.game.load.audio('hurt', 'audio/Hurt.wav');
    this.game.load.audio('hit', 'audio/Hit.wav');
    this.game.load.audio('break', 'audio/Break.wav');
    //Cappy
    this.game.load.audio('throw', 'audio/Throw.wav');
    this.game.load.audio('capture', 'audio/Capture.wav');
    //Objetos
    this.game.load.audio('coin', 'audio/Coin.wav');
    this.game.load.audio('moon', 'audio/Moon.wav');
    this.game.load.audio('fireball', 'audio/Fireball.wav');
    //Nivel
    this.game.load.audio('level1', 'audio/Level1.wav');
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.startSound = this.game.add.audio('start');
    this.pressSound = this.game.add.audio('press');
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(3, 3);
    this.logo.anchor.setTo(-1.1, -0.2);
    //Botón Start
    this.buttonPlay = this.game.add.button(0, 0, 'start', Play, this, 0, 2, 1);
    this.buttonPlay.scale.setTo(2, 2);
    this.buttonPlay.anchor.setTo(-0.6, -4);

    function Play() {
      if (!this.clicked) {
        this.clicked = true;
        this.startSound.play();
        this.startSound.onStop.add(function () {
          this.game.state.start('play');
        }, this);
      }
      this.clicked = false;
    }
    //Botón Options
    this.buttonOptions = this.game.add.button(0, 0, 'options', Options, this, 0, 2, 1);
    this.buttonOptions.scale.setTo(2, 2);
    this.buttonOptions.anchor.setTo(-0.6, -5.2);

    function Options() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('options');
        }, this);
      }
      this.clicked = false;
    }
  }
};

var Options = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(3, 3);
    this.logo.anchor.setTo(-1.1, -0.2);
    //Volumen
    this.text = this.game.add.text(0, 0, 'VOLUME ' + Math.round(this.game.sound.volume * 100), { fill: 'white', font: '40px arial' });
    this.text.anchor.setTo(-2.2, -9.5);
    //Botón bajar volumen
    this.downVolume = this.game.add.button(0, 0, 'volume', VolDown, this, 0, 4, 2);
    this.downVolume.scale.setTo(2, 2);
    this.downVolume.anchor.setTo(-0.6, -4);
    //Botón subir volumen
    this.upVolume = this.game.add.button(0, 0, 'volume', VolUp, this, 1, 5, 3);
    this.upVolume.scale.setTo(2, 2);
    this.upVolume.anchor.setTo(-10.6, -4);
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(2, 2);
    this.buttonExit.anchor.setTo(-0.6, -5.2);

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.game.sound.stopAll();
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('menu');
        }, this);
      }
      this.clicked = false;
    }

    function VolDown() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume - 0.05;
        this.text.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
    function VolUp() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume + 0.05;
        this.text.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
  }
};

var Win = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(2, 2);
    this.buttonExit.anchor.setTo(-0.6, -5.2);

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.game.sound.stopAll();
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('menu');
        }, this);
      }
      this.clicked = false;
    }
  }
};

window.onload = function () {
  var game = new Phaser.Game(1360, 768, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', Menu);
  game.state.add('options', Options);
  game.state.add('play', PlayScene);
  game.state.add('win', Win);

  game.state.start('boot');
};