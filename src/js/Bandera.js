'use strict';

function Checkpoint(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonido
    this.flagSound = this.game.add.audio('checkpoint');
}
Checkpoint.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoint.constructor = Checkpoint;

//Guarda la posición de reaparición de Mario
Checkpoint.prototype.Collision = function (player) {
    //Cada vez que pasas por encima
    player.spawnX = this.position.x;
    player.spawnY = this.position.y - player.height;
    //Solo una vez
    if (this.frame != 1) {
        //Cura a Mario
        if (player.life > 3)
            player.life = 6;
        else
            player.life = 3;
        player.scene.vidas.frame = player.life - 1;
        //Sonido
        this.flagSound.play();
        this.frame = 1;
    }
}

module.exports = Checkpoint;
