'use strict';

function Coin(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonidos
    this.coinSound = this.game.add.audio('coin');
    //Animaciones
    this.animations.add('coin', [0, 1, 2, 3], 5, true);
}
Coin.prototype = Object.create(Phaser.Sprite.prototype);
Coin.constructor = Coin;

//Mario recoge la moneda
Coin.prototype.Collision = function (player) {
    //Destruye la moneda
    player.coins++;
    this.kill();
    //Sonido de la moneda
    this.coinSound.play();
}

module.exports = Coin;
