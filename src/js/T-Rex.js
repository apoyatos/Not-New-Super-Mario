'use strict';

var Enemy = require('./Enemigo.js');

function TRex(game, x, y, sprite, frame, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    this.scale.setTo(0.95, 0.95);
    //Mario
    this.player = player;
    //Atributos
    this.captured = false;
    this.timer = 0;
    this.duration = 30;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
    this.killSound = this.game.add.audio('kill');
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    this.colBox = 0.5;
}
TRex.prototype = Object.create(Enemy.prototype);
TRex.constructor = TRex;

//Timer del T-Rex
TRex.prototype.Timer = function () {
    if (this.captured && this.timer < this.game.time.totalElapsedSeconds()) {
        this.player.ThrowCappy();
        this.captured = false;
        this.killSound.play();
    }
}
//Captura del T-Rex
TRex.prototype.Capture = function (cappy) {
    if (cappy != null) {
        cappy.Capture(this);
        this.captured = true;
        this.timer = this.game.time.totalElapsedSeconds() + this.duration;
    }
}
//Movimiento de Mario T-Rex
TRex.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.7;
    else
        player.body.velocity.x = player.facing * player.velocity / 1.5;
}
//Mario T-Rex quieto
TRex.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto de Mario T-Rex
TRex.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 2;
}
//Colisión de Mario T-Rex con enemigos
TRex.prototype.MarioCollision = function (enemy) {
    enemy.kill();
    this.killSound.play();
}
//Colisión de Mario T-Rex con bloques normales
TRex.prototype.BlockCollision = function (player, tile) {
    player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
    this.breakSound.play();
}
//Colisión de Mario T-Rex con bloques especiales
TRex.prototype.EspecialBlockCollision = function (tile, spawner) {
    if (tile.index == 498) //Bloque sin activar
    {
        //Al chocar con el bloque crea el premio
        tile.index = 619;
        tile.layer.dirty = true;
        this.player.scene.objects.add(spawner.Spawn(tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height)));
        this.hitSound.play();
    }
}
//Animaciones de Mario T-Rex
TRex.prototype.handleAnimations = function (player) {
    player.scale.setTo(0.95, 0.95);
    player.body.width = this.width * this.colBox;
    player.body.height = this.height;
    if (!player.moving) //Si no se mueve
    {
        if (player.facing == -1) //Izquierda
        {
            player.animations.play('idleDinoLeft');
            player.body.offset.x = 0
        }
        else //Derecha
        {
            player.animations.play('idleDinoRight');
            player.body.offset.x = this.width * (1 - this.colBox)
        }
    }
    else //Si se mueve
    {
        if (player.facing == -1) //Izquierda
        {
            player.animations.play('walkDinoLeft');
            player.body.offset.x = 0;
        }
        else //Derecha
        {
            player.animations.play('walkDinoRight');
            player.body.offset.x = this.width * (1 - this.colBox)
        }
    }
    this.Timer();
}
//Métodos polimórficos
TRex.prototype.Reset = function () { }
TRex.prototype.Recalculate = function () { }

module.exports = TRex;
