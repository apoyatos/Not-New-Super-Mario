'use strict';

function Coin(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonido
    this.coinSound = this.game.add.audio('coin');
    //Animación
    this.animations.add('coin', [0, 1, 2, 3], 5, true);
    this.animations.play('coin');
}
Coin.prototype = Object.create(Phaser.Sprite.prototype);
Coin.constructor = Coin;

//Mario recoge la moneda
Coin.prototype.Collision = function (player, scene) {
    //Destruye la moneda
    player.superCoins++;
    this.kill();
    //Sonido de la moneda
    this.coinSound.play();
    scene.textSuperCoins.setText(player.superCoins);
}

module.exports = Coin;
