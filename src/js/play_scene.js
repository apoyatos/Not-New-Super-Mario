'use strict';

var Enemy = require('./enemy.js');
  var goomba;
  var targetExample;

  var PlayScene = {
  create: function () {
    /*var logo = this.game.add.sprite(
      this.game.world.centerX, this.game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);*/

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    goomba = new Enemy(this.game, this.game.width / 4, this.game.height, 'goomba', 0, 100, 150, 100);
    this.game.world.addChild(goomba);
    goomba.scale.setTo( 2, 2);
    goomba.AddAnimation('walk', [0, 1], 5);

    targetExample = new Enemy(this.game, this.game.width, this.game.height, 'goomba', 0, 0, 0, 0);
    this.game.world.addChild(targetExample);
    targetExample.scale.setTo( 2, 2);
  },
  update: function () {
    goomba.Move();
    goomba.Shoot(targetExample);
  }
};

module.exports = PlayScene;
