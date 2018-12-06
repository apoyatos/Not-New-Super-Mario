'use strict';

var Monedas = require('./Monedas.js');
var Corazones = require('./Corazones.js');

function BlocksHandler(game, coinSprite, heartSprite) {
    this.game = game;
    this.coinSprite = coinSprite;
    this.heartSprite = heartSprite;
}

BlocksHandler.prototype.HitBlock = function (player, tile) {
    if (player.body.blocked.up || (player.prevY < player.y && player.crouching)) {
        tile.index = 1;
        tile.setCollision(false, false, false, false);
        tile.layer.dirty = true;
    }
}

BlocksHandler.prototype.HitBlockCoins = function (player, tile) {
    console.log(this.coinSprite.heigth)
    if (tile.index == 14) {
        if (player.body.blocked.up) {
            player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY - tile.height, this.coinSprite))
            tile.index = 16;
            tile.layer.dirty = true;
        }
        else if (player.prevY < player.y && player.crouching) {
            player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY + tile.height, this.coinSprite))
            tile.index = 16;
            tile.layer.dirty = true;
        }
    }
}

BlocksHandler.prototype.HitBlockHeart = function (player, tile) {
    if (tile.index == 14) {
        if (player.body.blocked.up) {
            player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY  - tile.height, this.heartSprite, 0, 3))
            tile.index = 16;
            tile.layer.dirty = true;
        }
        else if (player.prevY < player.y && player.crouching) {
            player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY + tile.height, this.heartSprite, 0, 3))
            tile.index = 16;
            tile.layer.dirty = true;
        }
    }
}

BlocksHandler.prototype.HitBlockSuperHearts = function (player, tile) {
    if (tile.index == 14) {
        if (player.body.blocked.up) {
            player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY -tile.height, this.heartSprite, 0, 6))
            tile.index = 16;
            tile.layer.dirty = true;
        }
        else if (player.prevY < player.y && player.crouching) {
            player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY + tile.height, this.heartSprite, 0, 6))
            tile.index = 16;
            tile.layer.dirty = true;
        }
    }
}

module.exports = BlocksHandler;