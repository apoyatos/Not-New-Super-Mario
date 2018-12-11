'use strict';

var Moneda = require('./Moneda.js');
var Corazon = require('./Corazon.js');

function Bloque(game, coinSprite, heartSprite, superHeartSprite) {
    //Sprites y juego
    this.game = game;
    this.coinSprite = coinSprite;
    this.heartSprite = heartSprite;
    this.superHeartSprite = superHeartSprite;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
}

//Bloque normal
Bloque.prototype.HitBlock = function (player, tile) {
    if (!player.capture) {
        if (player.body.blocked.up || (player.prevY < player.y && player.crouching)) {
            player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
            this.breakSound.play();
        }
    }
    else
        player.enemy.BlockCollision(tile, player);
}
//Bloque Especial
Bloque.prototype.HitEBlock = function (player, tile, prizeType) {
    if (!player.capture) {
        if (tile.index == 2) {
            if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) {
                tile.index = 123;
                tile.layer.dirty = true;
                if (prizeType == 'coin')
                    player.scene.collectibles.add(new Moneda(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.coinSprite));
                else if (prizeType == 'heart')
                    player.scene.collectibles.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.heartSprite, 0, 3));
                else
                    player.scene.collectibles.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.superHeartSprite, 0, 6));

                this.hitSound.play();
            }
        }
    }
    else {
        player.enemy.EBlockCollision(tile, prizeType);
    }
}

module.exports = Bloque;
