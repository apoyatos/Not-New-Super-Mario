'use strict';

function Moon(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonidos
    this.moonSound = this.game.add.audio('moon');
}
Moon.prototype = Object.create(Phaser.Sprite.prototype);
Moon.constructor = Moon;

//Mario recoge la luna
Moon.prototype.Collision = function (player) {
    //Cura a Mario
    if (player.life > 3)
        player.life = 6;
    else
        player.life = 3;
    player.scene.vidas.frame = player.life - 1;
    //Destruye la luna
    player.scene.moonsHUD[player.moons].frame = 0;
    player.moons++;
    this.kill();
    //Pausa el juego y la música
    player.scene.pause = true;
    player.scene.levelSound.pause();
    //Sonido de la luna
    this.moonSound.play();
    this.moonSound.onStop.add(Continue, this);
    //Reanuda el juego
    function Continue() {
        player.scene.pause = false;
        player.scene.levelSound.resume();
    }
}

module.exports = Moon;
