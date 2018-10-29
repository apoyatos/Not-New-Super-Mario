'use strict';

var Enemy = require('./enemy.js');

  var PlayScene = {
  create: function () {
    /*var logo = this.game.add.sprite(
      this.game.world.centerX, this.game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);*/

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    var goomba = new Enemy(this.game, 400, 300, 'goomba', 0, 150);
    this.game.world.addChild(goomba);
    goomba.resizeMeUP(2);
    goomba.animAdd('walk', [0, 1], 10);
  }
};

module.exports = PlayScene;
