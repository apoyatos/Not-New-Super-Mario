'use strict';

function Moon( game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
}
Moon.prototype = Object.create(Phaser.Sprite.prototype);
Moon.constructor = Moon;

module.exports=Moon;