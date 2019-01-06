'use strict';

function Heart(game, x, y, sprite, frame, amount) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cantidad de vida
    this.amount = amount;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.gravity.y = 600;
    //Sonido
    this.heartSound = this.game.add.audio('heart');
}
Heart.prototype = Object.create(Phaser.Sprite.prototype);
Heart.constructor = Heart;

//Mario recoge el corazón
Heart.prototype.Collision = function (player) {
    //Cura a Mario y destruye el corazón
    if (this.amount == 6)
        player.life = 6;
    else {
        if (player.life > 3)
            player.life = 6;
        else
            player.life = 3;
    }
    player.scene.vidas.frame = player.life - 1;
    this.kill();
    this.heartSound.play();
}

module.exports = Heart;
