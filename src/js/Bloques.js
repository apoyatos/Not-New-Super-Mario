'use strict';

var Monedas = require('./Monedas.js');
var Corazones = require('./Corazones.js');

function BlocksHandler(game, coinSprite, heartSprite) {
    this.game = game;
    this.coinSprite = coinSprite;
    this.heartSprite = heartSprite;
}

BlocksHandler.prototype.HitBlock = function (player, tile) {
    if (!player.capture) {
        if (player.body.blocked.up || (player.prevY < player.y && player.crouching)) {
            player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks)
        }
    }
    else
        player.enemy.BlockCollision(tile, player);

}

BlocksHandler.prototype.HitEBlock = function (player, tile, prizeType) {
    if (!player.capture) {
        if (tile.index == 2) {
            if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) {
                player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY - tile.height, this.coinSprite))
                tile.index = 123;
                tile.layer.dirty = true;
                if (prizeType == 'coin')
                    player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY + tile.height, this.coinSprite))
                else if (prizeType == 'heart')
                    player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY - tile.height, this.heartSprite, 0, 3))
                else
                    player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY - tile.height, this.heartSprite, 0, 6))
            }
        }
    }
    else {
        player.enemy.EBlockCollision(tile, prizeType);
    }
}




module.exports = BlocksHandler;