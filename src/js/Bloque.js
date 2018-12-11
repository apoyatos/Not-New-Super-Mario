'use strict';

var Monedas = require('./Monedas.js');
var Corazones = require('./Corazones.js');

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

Bloque.prototype.HitEBlock = function (player, tile, prizeType) {
    if (!player.capture) {
        if (tile.index == 2) {
            if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) {
                tile.index = 123;
                tile.layer.dirty = true;
                if (prizeType == 'coin')
                    player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.coinSprite));
                else if (prizeType == 'heart')
                    player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.heartSprite, 0, 3));
                else
                    player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.heartSprite, 0, 6));

                this.hitSound.play();
            }
        }
    }
    else {
        player.enemy.EBlockCollision(tile, prizeType);
    }
}

module.exports = Bloque;
