'use strict';

var Enemy = require('./enemy.js');

  var PlayScene = {
  create: function () {
    /*var logo = this.game.add.sprite(
      this.game.world.centerX, this.game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);*/

    var goomba = new Enemy(this.game, 0, 0, 'goomba');
    this.game.world.addChild(goomba);
  }
};

module.exports = PlayScene;
