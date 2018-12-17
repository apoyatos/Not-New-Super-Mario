'use strict';

var Enemy = require('./Enemigo.js');
var Moneda = require('./Moneda.js');
var Corazon = require('./Corazon.js');

function TRex(game, x, y, sprite, frame, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    this.scale.setTo(0.95, 0.95);
    //Mario
    this.player = player;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    //Tipo
    this.type = sprite;
}
TRex.prototype = Object.create(Enemy.prototype);
TRex.constructor = TRex;

//Cambia la dirección
TRex.prototype.ChangeDir = function () { }
//Movimiento del T-Rex capturado
TRex.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.7;
    else
        player.body.velocity.x = player.facing * player.velocity / 1.5;
}
//T-Rex capturado quieto
TRex.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto del T-Rex capturado
TRex.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 2;
}
//Colisiones del T-Rex capturado con enemigos
TRex.prototype.Collision = function (player, enemy) {
    if (player.game.physics.arcade.overlap(enemy, player)) //Si choca con un enemigo
    {
        enemy.kill();
    }
}
//Colisiones del T-Rex capturado con bloques normales
TRex.prototype.BlockCollision = function (tile, player) {
    player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
    this.breakSound.play();
}
//Colisiones del T-Rex capturado con bloques especiales
TRex.prototype.EspecialBlockCollision = function (tile, prizeType) {
    if (tile.index == 498) //Bloque sin activar
    {
        //Al chocar con el bloque crea el premio
        tile.index = 619;
        tile.layer.dirty = true;

        if (prizeType == 'coin') //Crea una moneda
        {
            this.coin = new Moneda(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - this.player.y) * tile.height), prizeType);
            this.player.scene.objects.add(this.coin);
        }
        else if (prizeType == 'heart') //Crea un corazón
            this.player.scene.objects.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - this.player.y) * tile.height), prizeType, 0, 3));
        else //Crea un super corazón
            this.player.scene.objects.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - this.player.y) * tile.height), prizeType, 0, 6));

        this.hitSound.play();
    }
}
//Animaciones
TRex.prototype.handleAnimations = function (player) {
    player.scale.setTo(0.95, 0.95);
    player.body.width = this.width;
    player.body.height = this.height;
    if (!player.moving) //Si no se mueve
    {
        if (player.facing == -1)
            player.animations.play('idleDinoLeft');
        else
            player.animations.play('idleDinoRight');
    }
    else //Si se mueve
    {
        if (player.facing == -1)
            player.animations.play('walkDinoLeft');
        else
            player.animations.play('walkDinoRight');
    }
}

module.exports = TRex;
