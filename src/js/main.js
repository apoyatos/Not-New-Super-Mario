'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
  },
  create: function () {
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    //Imagenes
    //Menu
    this.game.load.image('logo', 'images/Logo.png');
    this.game.load.spritesheet('start', 'images/Start.png', 306, 56);
    this.game.load.spritesheet('options', 'images/Options.png', 306, 56);
    //Menu pausa
    this.game.load.image('pause', 'images/MenuPausa.png');
    this.game.load.spritesheet('continue', 'images/Continue.png', 306, 56);
    this.game.load.spritesheet('exit', 'images/Exit.png', 306, 56);
    //Objetos del mapa
    this.game.load.spritesheet('superBlock', 'images/SuperBloque.png', 33, 32);
    this.game.load.image('block', 'images/Bloque.png');
    this.game.load.spritesheet('coin', 'images/Moneda.png', 14, 16);
    this.game.load.spritesheet('superCoin', 'images/SuperMoneda.png', 14, 16);
    this.game.load.image('moon', 'images/Energiluna.png');
    this.game.load.image('heart', 'images/Corazon.png');
    this.game.load.image('superHeart', 'images/SuperCorazon.png');
    this.game.load.spritesheet('checkpoint', 'images/Bandera.png', 25, 32);
    //Mario y enemigos
    this.game.load.atlas('mario', 'images/Mario.png', 'images/sprites.json');
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('goomba', 'images/Goomba.png', 25, 24);
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 18.5, 16);
    this.game.load.spritesheet('plant', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('chomp', 'images/Chomp.png', 31.75, 29.5);
    this.game.load.spritesheet('life', 'images/Vida.png', 55, 55);
    this.game.load.spritesheet('fireball', 'images/Disparo-Fuego.png', 9, 9);
    //Mapa
    //this.game.load.image('tiles', 'tilemaps/super_mario.png');
    //this.game.load.tilemap('map', 'tilemaps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('map', 'tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles3', 'tilemaps/tiles3G.png');
    this.game.load.image('tiles1', 'tilemaps/tiles1G.png');
    this.game.load.image('tiles2', 'tilemaps/tiles2G.png');
    //Sonidos
    //Menu
    this.game.load.audio('start', 'audio/Start.wav');
    //Juego
    this.game.load.audio('jump', 'audio/Jump.wav');
    this.game.load.audio('swim', 'audio/Swim.wav');
    this.game.load.audio('throw', 'audio/Throw.wav');
    this.game.load.audio('capture', 'audio/Capture.wav');
    this.game.load.audio('kick', 'audio/Kick.wav');
    this.game.load.audio('kill', 'audio/Kill.wav');
    this.game.load.audio('hurt', 'audio/Hurt.wav');
    this.game.load.audio('hit', 'audio/Hit.wav');
    this.game.load.audio('break', 'audio/Break.wav');
    this.game.load.audio('coin', 'audio/Coin.wav');
    this.game.load.audio('moon', 'audio/Moon.wav');
    this.game.load.audio('fireball', 'audio/Fireball.wav');
    this.game.load.audio('level1', 'audio/Level1.wav');
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    this.game.stage.backgroundColor = 0x4488aa;

    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(3, 3);
    this.logo.anchor.setTo(-1.2, -0.2);

    this.buttonPlay = this.game.add.button(0, 0, 'start', PlaySound, this, 0, 2, 1);
    this.buttonPlay.scale.setTo(2, 2);
    this.buttonPlay.anchor.setTo(-0.6, -4);
    this.startSound = this.game.add.audio('start');

    this.buttonOptions = this.game.add.button(0, 0, 'options', Options, this, 0, 2, 1);
    this.buttonOptions.scale.setTo(2, 2);
    this.buttonOptions.anchor.setTo(-0.6, -5.2);

    function PlaySound() {
      this.startSound.play();
      this.startSound.onStop.add(Play, this);
    }
    function Play() {
      this.game.state.start('play');
    }
    function Options() {
      //En desarrollo
    }
  }
};

var Options = {
  create: function () {
    //En desarrollo
  }
};

window.onload = function () {
  var game = new Phaser.Game(1360, 768, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', Menu);
  game.state.add('options', Options);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};
