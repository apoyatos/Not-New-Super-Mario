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
    // TODO: load here the assets for the game
    this.game.load.image('logo', 'images/logo.png');
    this.game.load.spritesheet('cappy', 'images/Cappy.png', 15.3 ,8.5);
    this.game.load.spritesheet('spritesMario', 'images/Mario.png', 19.6, 28);

    this.game.load.image('logo', 'images/phaser.png');
    this.game.load.spritesheet('goomba', 'images/goomba.png', 25, 23, 3);
    this.game.load.spritesheet('shot', 'images/shot.png', 9, 9, 4);
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
