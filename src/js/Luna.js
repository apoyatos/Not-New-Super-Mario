'use strict';

function Luna(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    //Sonidos
    this.moonSound = this.game.add.audio('moon');
}
Luna.prototype = Object.create(Phaser.Sprite.prototype);
Luna.constructor = Luna;

//Colisión con Mario
Luna.prototype.Collision = function (player) {
    player.moons++;
    this.kill();
    this.moonSound.play();
}

module.exports = Luna;
