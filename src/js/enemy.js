'use strict';

function Enemy(game) {
  var x = game.world.width-500;
  var y = game.world.height-300;
  Phaser.Sprite.call(this, game, x, y, 'goomba');
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;

module.exports = Enemy;
