'use strict';

//Entidad abstracta (no necesita sprite) que maneja las collisiones de los bloques
function BlockHandler(game) {
    this.game = game;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
}

//Bloques normales
BlockHandler.prototype.HitBlock = function (player, tile) {
    if (!player.capture) //Si es Mario
    {
        if (player.body.blocked.up || (player.prevY < player.y && player.crouching)) //Al chocar con el bloque lo destruye
        {
            player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
            this.breakSound.play();
        }
    }
    else //Enemigos poseidos
        player.enemy.BlockCollision(player, tile);
}
//Bloques especiales
BlockHandler.prototype.HitEspecialBlock = function (player, tile, spawner) {
    if (!player.capture) //Si es Mario
    {
        if (tile.index == 498) //Bloque sin activar
        {
            if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) //Al chocar con el bloque crea el premio
            {
                tile.index = 619;
                tile.layer.dirty = true;
                player.scene.objects.add(spawner.Spawn(tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height)));
                this.hitSound.play();
            }
        }
        else if ((player.body.blocked.up) || (player.prevY < player.y && player.crouching)) //Al chocar con el bloque después de activarlo
            this.hitSound.play();
    }
    else //Enemigos poseidos
        player.enemy.EspecialBlockCollision(tile, spawner);
}

module.exports = BlockHandler;
