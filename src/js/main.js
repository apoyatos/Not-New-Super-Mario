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
    this.game.load.spritesheet('mario', 'images/Mario.png', 24, 28);
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 14, 8);
    this.game.load.spritesheet('goomba', 'images/Goomba.png', 24, 24);
    this.game.load.spritesheet('disparo-fuego', 'images/Disparo-Fuego.png', 9, 9);
  },
  create: function () {
    this.game.state.start('play');
  }
};

window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};