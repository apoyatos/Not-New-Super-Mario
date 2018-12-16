'use strict';

var Moneda = require('./Moneda.js');
var Corazon = require('./Corazon.js');

function Block(game, coinSprite, heartSprite, superHeartSprite) {
    //Juego y sprites
    this.game = game;
    this.coinSprite = coinSprite;
    this.heartSprite = heartSprite;
    this.superHeartSprite = superHeartSprite;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
}

//Bloque normal
Block.prototype.HitBlock = function (player, tile) {
    if (!player.capture) //Si es Mario
    {
        if (player.body.blocked.up || (player.prevY < player.y && player.crouching)) //Al chocar con el bloque lo destruye
        {
            player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
            this.breakSound.play();
        }
    }
    else //Enemigos poseidos
        player.enemy.BlockCollision(tile, player);
}
//Bloque Especial
Block.prototype.HitEspecialBlock = function (player, tile, prizeType) {
    if (!player.capture) //Si es Mario
    {
        if (tile.index == 2) //Bloque sin activar
        {
            if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) //Al chocar con el bloque crea el premio
            {
                tile.index = 123;
                tile.layer.dirty = true;

                if (prizeType == 'coin') //Crea una moneda
                {
                    this.coin = new Moneda(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.coinSprite);
                    player.scene.objects.add(this.coin);
                    this.coin.animations.play('coin');
                }
                else if (prizeType == 'heart') //Crea un corazón
                    player.scene.objects.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.heartSprite, 0, 3));
                else //Crea un super corazón
                    player.scene.objects.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.superHeartSprite, 0, 6));

                this.hitSound.play();
            }
        }
        else if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) //Al chocar con el bloque después de activarlo
            this.hitSound.play();
    }
    else //Enemigos poseidos
        player.enemy.EBlockCollision(tile, prizeType);
}

module.exports = Block;