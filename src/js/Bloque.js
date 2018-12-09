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
    if (player.body.blocked.up || (player.prevY < player.y && player.crouching)) {
        tile.index = 1;
        tile.setCollision(false, false, false, false);
        tile.layer.dirty = true;
        this.breakSound.play();
    }
}
//Bloque con moneda
Bloque.prototype.HitBlockCoins = function (player, tile) {
    if (tile.index == 14) {
        if (player.body.blocked.up) {
            player.scene.collectibles.add(new Moneda(this.game, tile.worldX, tile.worldY - tile.height, this.coinSprite));
            tile.index = 16;
            tile.layer.dirty = true;
            this.hitSound.play();
        }
        else if (player.prevY < player.y && player.crouching) {
            player.scene.collectibles.add(new Moneda(this.game, tile.worldX, tile.worldY + tile.height, this.coinSprite));
            tile.index = 16;
            tile.layer.dirty = true;
            this.hitSound.play();
        }
    }
}
//Bloque con corazón normal
Bloque.prototype.HitBlockHeart = function (player, tile) {
    if (tile.index == 14) {
        if (player.body.blocked.up) {
            player.scene.collectibles.add(new Corazon(this.game, tile.worldX, tile.worldY - tile.height, this.heartSprite, 0, 3));
            tile.index = 16;
            tile.layer.dirty = true;
            this.hitSound.play();
        }
        else if (player.prevY < player.y && player.crouching) {
            player.scene.collectibles.add(new Corazon(this.game, tile.worldX, tile.worldY + tile.height, this.heartSprite, 0, 3))
            tile.index = 16;
            tile.layer.dirty = true;
            this.hitSound.play();
        }
    }
}
//Bloque con super corazón
Bloque.prototype.HitBlockSuperHearts = function (player, tile) {
    if (tile.index == 14) {
        if (player.body.blocked.up) {
            player.scene.collectibles.add(new Corazon(this.game, tile.worldX, tile.worldY - tile.height, this.superHeartSprite, 0, 6));
            tile.index = 16;
            tile.layer.dirty = true;
            this.hitSound.play();
        }
        else if (player.prevY < player.y && player.crouching) {
            player.scene.collectibles.add(new Corazon(this.game, tile.worldX, tile.worldY + tile.height, this.superHeartSprite, 0, 6));
            tile.index = 16;
            tile.layer.dirty = true;
            this.hitSound.play();
        }
    }
}

module.exports = Bloque;
