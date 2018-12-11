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
Moon.prototype.Collision = function (player, scene) {
    //Cura a Mario
    if (player.life > 3)
        player.life = 6;
    else
        player.life = 3;
    //Destruye la luna
    player.moons++;
    this.kill();
    //Pausa el juego y la música
    scene.pause = true;
    scene.level1Sound.pause();
    //Sonido de la luna
    this.moonSound.play();
    this.moonSound.onStop.add(Continue, this);
    //Reanuda el juego
    function Continue() {
        scene.pause = false;
        scene.level1Sound.resume();
    }
}

module.exports = Moon;
