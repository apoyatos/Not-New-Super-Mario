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
    // load here the assets for the game
    this.game.load.image('logo', 'images/Logo.png');
    this.game.load.image('moon', 'images/moon.png');
    this.game.load.image('blockE', 'images/bloque.png');
    this.game.load.image('block', 'images/bloque2.png');
    this.game.load.image('coins', 'images/coins.png');
    this.game.load.spritesheet('vidas', 'images/Vidas.png', 55, 55);
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('goomba', 'images/Goomba.png', 25, 24);
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 18.5, 16);
    this.game.load.spritesheet('planta', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('disparo-fuego', 'images/Disparo-Fuego.png', 9, 9);

    this.game.load.atlas('mario', 'images/Mario.png', 'images/sprites.json');

    this.game.load.tilemap('map', 'tilemaps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'tilemaps/super_mario.png');
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    this.game.stage.backgroundColor = 0x4488aa;
    this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.scale.setTo(2, 2);
    this.logo.anchor.setTo(0.5, 0.5);

    this.empezar = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  },
  update: function () {
    if (this.empezar.isDown)
      this.game.state.start('play');
  }
};

window.onload = function () {
  var game = new Phaser.Game(1360, 768, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', Menu);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};
