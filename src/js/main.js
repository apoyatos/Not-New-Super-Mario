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
    this.game.load.spritesheet('spritesMario', 'images/mario2.png',40.5,41);//altura y anchura de cada frame

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
