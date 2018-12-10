(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
                tile.index = 123;
                tile.layer.dirty = true;
                if (prizeType == 'coin')
                    player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY +(Math.sign(tile.worldY-player.y)*tile.height), this.coinSprite))
                else if (prizeType == 'heart')
                    player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY +(Math.sign(tile.worldY-player.y)*tile.height), this.heartSprite, 0, 3))
                else
                    player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY +(Math.sign(tile.worldY-player.y)*tile.height), this.heartSprite, 0, 6))
            }
        }
    }
    else {
        player.enemy.EBlockCollision(tile, prizeType);
    }
}




module.exports = BlocksHandler;
},{"./Corazones.js":5,"./Monedas.js":11}],2:[function(require,module,exports){
'use strict';

function Cappy(game, x, y, name, player, dir) {
    Phaser.Sprite.call(this, game, x, y, name);
    //Mario
    this.player = player;
    //Movimiento
    this.dir = dir;
    this.velocity = 400;
    //Acciones
    this.cappyHold = false;
    this.cappyStopped = false;
    this.cappyReturning = false;
    this.cappyCapture = false;
    //Temporizadores
    this.cappyTime = 0.5;
    this.cappyTimer = 0;
    this.cappyHoldTime = 3;
    this.cappyHoldTimer = 0;
    this.cappyStopTime = 1;
    this.cappyStopTimer = 0;
    this.cappyCooldownTime = 1;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.allowGravity = false;
    //Sprite y animaciones
    this.scale.setTo(2,2);
    this.animations.add("Thrown", [0, 1, 2], 8, true);
}
Cappy.prototype = Object.create(Phaser.Sprite.prototype);
Cappy.constructor = Cappy;

//Movimiento al lanzarse
Cappy.prototype.Throw = function () {
    if (!this.cappyCapture && !this.player.capture) //Si es Mario
    {
        if (!this.player.thrown) {
            this.body.velocity.x = this.velocity * this.dir;
            this.animations.play("Thrown");
            this.player.thrown = true;
            this.cappyHold = true;
            this.cappyTimer = this.game.time.totalElapsedSeconds() + this.cappyTime;
        }
    }
}
//Manejo de lanzamiento
Cappy.prototype.Check = function () {
    if (this.player.thrown && !this.cappyStopped && !this.player.cappyPlant) //Si se ha lanzado y no se ha mantenido en su posición
    {
        if (this.game.time.totalElapsedSeconds() > this.cappyTimer) {
            this.body.velocity.x = 0;
            this.cappyStopped = true;
            this.cappyHoldTimer = this.game.time.totalElapsedSeconds() + this.cappyHoldTime;
            this.cappyStopTimer = this.game.time.totalElapsedSeconds() + this.cappyStopTime;
        }
    }
    else if (this.cappyStopped && !this.player.cappyPlant) //Tras mantenerse en su posición
    {
        if ((this.cappyHold && this.game.time.totalElapsedSeconds() > this.cappyHoldTimer) || (!this.cappyHold && this.game.time.totalElapsedSeconds() > this.cappyStopTimer)) {
            this.game.physics.arcade.moveToObject(this.player.cappy, this.player, 500);
            this.cappyReturning = true;
        }
    }
}
//Manejo de colisiones
Cappy.prototype.Collision = function () {
    if (this.game.physics.arcade.overlap(this.player.cappy, this.player) && this.cappyReturning) //Se reinicia al volver a Mario
    {
        this.Reset();
    }
    else if (this.game.physics.arcade.overlap(this.player.cappy, this.player) && this.cappyStopped) //Se reinicia después de que Mario salte sobre ella
    {
        this.player.body.velocity.y = -this.player.jumpVelocity/1.5;
        this.player.tackling = false;
        this.player.tackles = 1;
        this.Reset();
    }
}
//Reinicia el estado de Cappy
Cappy.prototype.Reset = function () {
    this.player.cappyCooldownTimer = this.game.time.totalElapsedSeconds() + this.cappyCooldownTime;
    this.player.thrown = false;
    this.cappyStopped = false;
    this.cappyReturning = false;
    this.player.cappy.kill();
}
//Captura al enemigo con Cappy
Cappy.prototype.Capture = function (enemy) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy)) {
        enemy.kill();
        this.cappyCapture = true;
        this.player.capture = true;
        this.player.enemy = enemy;
        this.player.reset(enemy.body.position.x, enemy.body.position.y);
        this.Reset();
        this.player.recalculateBody();
        return true;
    }
    else
        return false;
}
//Bloquea a la Planta
Cappy.prototype.Stunn = function (enemy) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy) && enemy.type == 'planta') {
        this.player.cappyPlant = true;
        this.player.cappy.kill();
    }
}

module.exports = Cappy;

},{}],3:[function(require,module,exports){
'use strict';

function Checkpoints(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
}
Checkpoints.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoints.constructor = Checkpoints;

Checkpoints.prototype.Collision = function (player) {
    player.spawnX=this.x;
    player.spawnY=this.y;
    this.kill();
}

module.exports = Checkpoints;
},{}],4:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.charged = false;
    //Tipo
    this.type = sprite;
    //Movimiento
    this.speed = speed;
    this.originalSpeed = speed;
    this.chain = chain;
    this.originX = x;
    this.distance = distance;
    this.attack = false;
    this.cooldownTimer = 0;
    this.cooldown = cooldown;
    this.chargeTime = 1;
    this.chargeTimer = 0;
    this.charging = false;
    //Sprites y animaciones
    this.scale.setTo(2.5,2.5);
    this.animations.add('walkLeft', [0, 1, 4, 1, 0], 5, true);
    this.animations.add('walkRight', [3, 2, 7, 2, 3], 5, true);
    this.originalHeight = this.body.height * this.scale.x;

}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

Chomp.prototype.Move = function () {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if ((this.x + this.speed / 30 > (this.originX + this.chain)) || (this.x + this.speed / 30 < (this.originX - this.chain))) {
            if (this.attack) {
                this.speed = this.originalSpeed * Math.sign(this.speed);
                this.attack = false;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldown;
            }
            this.speed = -this.speed;

        }
        this.body.velocity.x = this.speed;
        if (this.speed < 0)
            this.animations.play('walkLeft');
        else
            this.animations.play('walkRight');
    }
    else
        this.body.velocity.x = 0;

}

Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if (!this.attack && (Math.sign(this.speed) == Math.sign(player.x - this.x) && Math.abs(player.x - this.x) < this.distance)) {
            this.x = this.originX + this.chain * Math.sign(-this.speed);
            this.speed = 4 * this.speed;
            this.attack = true;
        }
    }

}

//Movimiento capturado
Chomp.prototype.MarioMove = function (player) {
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) {
        player.body.velocity.x = player.velocity / 4;
        this.charged = false;
        this.charging = false;
    }
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) {
        player.body.velocity.x = -player.velocity / 4;
        this.charged = false;
    }
    else {
        player.body.velocity.x = 0;
        if (!this.charging && !this.charged) {
            this.chargeTimer = this.game.time.totalElapsedSeconds() + this.chargeTime;
            this.charging = true;
            this.charged = false;
        }
        else if (this.game.time.totalElapsedSeconds() > this.chargeTimer)
            this.charged = true;

    }

}
//Ausencia de movimiento capturado
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.charged && ((player.x + player.velocity / 30 < (this.originX + this.chain) + 150) && player.facing == -1)) {
        player.body.velocity.x = 4 * player.velocity;
    }
    else if (this.charged && ((player.x - player.velocity / 30 > (this.originX - this.chain) - 150) && player.facing == 1)) {
        player.body.velocity.x = -4 * player.velocity;
    }
    else {
        player.body.velocity.x = 0;
        this.charged = false;
        this.charging = false;
    }
}
//Salto capturado
Chomp.prototype.MarioJump = function (player) {

}
//Colisiones capturado
Chomp.prototype.Collision = function (player, enemy) {
    if (this.game.physics.arcade.overlap(enemy, player) && !player.hurt) {
        player.Hurt();
        return true;
    }
    if (this.game.time.totalElapsedSeconds() > player.hurtTimer) {
        player.hurt = false;
        return false;
    }
}

Chomp.prototype.BlockCollision = function (tile, player) {
    if (this.charged) {
        player.scene.map.removeTile(tile.x,tile.y,player.scene.blocks)
    }


}
Chomp.prototype.EBlockCollision = function (tile, prizeType) {
    if (tile.index == 2) {
        if (this.charged) {
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
Chomp.prototype.handleAnimations = function (player) {
    if (player.hurt) {
        if (!this.charged) {
            if (player.facing == -1)
                player.animations.play('hurtChompLeft');
            else
                player.animations.play('hurtChompRight');
        }
        else {
            if (player.facing == 1)
                player.animations.play('hurtChompLeft');
            else
                player.animations.play('hurtChompRight');
        }
    }
    else {
        if (!this.charged) {
            if (player.facing == -1)
                player.animations.play('walkChompLeft');
            else
                player.animations.play('walkChompRight');
        }
        else {
            if (player.facing == 1)
                player.animations.play('walkChompLeft');
            else
                player.animations.play('walkChompRight');
        }
    }

}

module.exports = Chomp;
},{"./Enemigo.js":7}],5:[function(require,module,exports){
'use strict';

function Hearts(game, x, y, sprite, frame,amount) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.amount=amount;
    this.body.gravity.y = 500;
}
Hearts.prototype = Object.create(Phaser.Sprite.prototype);
Hearts.constructor = Hearts;

Hearts.prototype.Collision = function (player) {
    player.life=amount;
    this.kill();
}

module.exports = Hearts;
},{}],6:[function(require,module,exports){
'use strict';

function Shot(game, x, y, sprite, frame, animName, animFrames, animSpeed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  //Sprite y animaciones
  this.scale.setTo(2,2);
  this.animName = animName;
  this.animations.add(this.animName, animFrames, animSpeed, true);
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

//Disparo
Shot.prototype.Shoot = function (target, speed) {
  this.game.physics.arcade.moveToObject(this, target, speed);
  this.animations.play(this.animName);
}
//Destrucción
Shot.prototype.RemoveShot = function () {
  if(this.x<this.game.camera.x ||this.x>this.game.camera.x+this.game.camera.width||this.y<this.game.camera.y ||this.y>this.game.camera.y+this.game.camera.height)
    this.destroy();
}

module.exports = Shot;

},{}],7:[function(require,module,exports){
'use strict';

var Shot = require('./Disparo.js');

function Enemy(game, x, y, sprite, frame, shootingSpeed, shootingTime) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.shootingSpeed = shootingSpeed;
  this.shootingTime = shootingTime;
  this.shootingTimer = 0;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = 500;
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;


//Movimiento
Enemy.prototype.Move = function () {
  this.body.velocity.x = this.speed;
  this.animations.play('walk');
}

Enemy.prototype.ChangeDir = function () {
  this.speed = -this.speed;
}

//Disparo
Enemy.prototype.EnemyShoot = function (target, sprite, enemy) {
  if (enemy.game.time.totalElapsedSeconds() > this.shootingTimer) {
    //Crea el disparo
    if (sprite == 'disparo-fuego') {
      var shot = new Shot(enemy.game, enemy.x, enemy.y, sprite, 0, 'shootFire', [0, 1, 2, 3], 5);
      shot.Shoot(target, enemy.shootingVel);
      this.shootingTimer = enemy.game.time.totalElapsedSeconds() + this.shootingTime;
      return shot;
    }
    else {
      //Disparo del tanque
    }
  }
}

module.exports = Enemy;

},{"./Disparo.js":6}],8:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Goomba(game, x, y, sprite, frame, speed, movingTime, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    //Tipo
    this.type = sprite;
    //Movimiento
    this.speed = speed;
    this.movingTime = movingTime;
    this.movingTimer = 0;
    //Sprites y animaciones
    this.animations.add('walk', [0, 1], 5, true);
    this.scale.setTo(2,2);
    this.originalHeight = this.body.height * this.scale.x;
}
Goomba.prototype = Object.create(Enemy.prototype);
Goomba.constructor = Goomba;

//Muerte
Goomba.prototype.Die = function () {
    if (this.game.physics.arcade.overlap(this, this.player) && this.player.y + this.player.height < this.y + 10 && !this.player.hurt && !this.player.capture) {
        this.kill();
        this.player.body.velocity.y = -this.player.jumpVelocity / 2;
        this.player.tackling = false;
        this.player.tackles = 1;
    }
}
//Movimiento capturado
Goomba.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.75;
    else
        player.body.velocity.x = player.facing * player.velocity;
}
//Ausencia de movimiento capturado
Goomba.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto capturado
Goomba.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 1.5;
}
//Colisiones capturado
Goomba.prototype.Collision = function (player, enemy) {
    if (player.game.physics.arcade.overlap(enemy, player) && !player.hurt) //Si choca con un enemigo
    {
        if (enemy.type == 'goomba') //Si es un goomba
        {
            if (player.y + player.height < enemy.y + 10 && player.goombaCount < 4) //Se sube en el goomba
            {
                console.log('hola')
                player.goombaCount++;
                enemy.kill();
                player.recalculateBody();
            }
            else //Se hace daño
            {
                player.Hurt();
                return true;
            }
        }
        else //Se hace daño
        {
            player.Hurt();
            return true;
        }
    }
    if (player.game.time.totalElapsedSeconds() > player.hurtTimer) {
        player.hurt = false;
        return false;
    }
}

Goomba.prototype.BlockCollision = function (player, tile) {

}
Goomba.prototype.EBlockCollision = function (tile, prizeType) {
}
//Animaciones
Goomba.prototype.handleAnimations = function (player) {
    if (player.hurt) //Si se hace daño
    {
        if (player.goombaCount == 1)
            player.animations.play('hurtGoomba1');
        else if (player.goombaCount == 2)
            player.animations.play('hurtGoomba2');
        else if (player.goombaCount == 3)
            player.animations.play('hurtGoomba3');
        else
            player.animations.play('hurtGoomba4');
    }
    else if (!player.moving) //Si no se mueve
    {
        if (player.goombaCount == 1)
            player.animations.play('idleGoomba1');
        else if (player.goombaCount == 2)
            player.animations.play('idleGoomba2');
        else if (player.goombaCount == 3)
            player.animations.play('idleGoomba3');
        else
            player.animations.play('idleGoomba4');
    }
    else //Si se mueve
    {
        if (player.goombaCount == 1)
            player.animations.play('walkGoomba1');
        else if (player.goombaCount == 2)
            player.animations.play('walkGoomba2');
        else if (player.goombaCount == 3)
            player.animations.play('walkGoomba3');
        else
            player.animations.play('walkGoomba4');
    }
}

module.exports = Goomba;

},{"./Enemigo.js":7}],9:[function(require,module,exports){
'use strict';

function Moon(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.physics.arcade.enable(this);
}
Moon.prototype = Object.create(Phaser.Sprite.prototype);
Moon.constructor = Moon;

Moon.prototype.Collision = function (player) {
    player.moons++;
    console.log("Lunas: " + player.moons);
    this.kill();
}

module.exports = Moon;
},{}],10:[function(require,module,exports){
'use strict';

var Cappy = require('./Cappy.js');
var Goomba = require('./Goomba.js');

function Mario(game, x, y, sprite, frame, scene) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.scene = scene;
    //Cappy
    this.cappy = null;
    this.thrown = false;
    this.cappyPlant = false;
    this.cappyCooldownTimer = 0;
    //Vida y daño
    this.life = 6;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Objetos
    this.coins = 0;
    this.moons = 0;
    //Movimiento
    this.velocity = 200;
    this.prevState;
    this.facing = 1; //derecha = 1, izquierda = -1
    this.jumpVelocity = 415;
    this.tackles = 0;
    //Acciones
    this.moving = false;
    this.bombJump = false;
    this.tackling = false;
    this.swimming = false;
    this.crouching = false;
    this.running = false;
    this.kicking = false;
    //Timers
    this.kickTime = 0.2;
    this.kickTimer = 0;
    this.throwTime = 0.2;
    this.throwTimer = 0;
    //Posición
    this.spawnX = x;
    this.spawnY = y - 300;
    //Captura
    this.capture = false;
    this.enemy;
    this.goombaCount = 1;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.gravity.y = 600;
    this.body.collideWorldBounds = true;
    //Sprite y animaciones
    this.scale.setTo(2, 2);
    this.originalHeight = this.body.height * this.scale.x;
    //Animaciones normales
    this.animations.add('runLeft', Phaser.Animation.generateFrameNames('walkLeft', 1, 3), 8, true);
    this.animations.add('runRight', Phaser.Animation.generateFrameNames('walkRight', 1, 3), 8, true);
    this.animations.add('jumpLeft', ['jumpLeft'], 10, false);
    this.animations.add('jumpRight', ['jumpRight'], 10, false);
    this.animations.add('idleLeft', ['walkLeft1'], 10, false);
    this.animations.add('idleRight', ['walkRight1'], 10, false);
    this.animations.add('crouchLeft', Phaser.Animation.generateFrameNames('crouchLeft', 1, 2), 10, false);
    this.animations.add('crouchRight', Phaser.Animation.generateFrameNames('crouchRight', 1, 2), 10, false);
    this.animations.add('idleCrouchLeft', ['crouchLeft1'], 10, false);
    this.animations.add('idleCrouchRight', ['crouchRight1'], 10, false);
    this.animations.add('tackleLeft', ['swimLeft2'], 10, false);
    this.animations.add('tackleRight', ['swimRight2'], 10, false);
    this.animations.add('swimLeft', Phaser.Animation.generateFrameNames('swimLeft', 1, 3), 8, true);
    this.animations.add('swimRight', Phaser.Animation.generateFrameNames('swimRight', 1, 3), 8, true);
    this.animations.add('bombLeft', ['bombLeft'], 10, false);
    this.animations.add('bombRight', ['bombRight'], 10, false);
    this.animations.add('crouchingLeft', Phaser.Animation.generateFrameNames('crouchingLeft', 1, 4), 10, false);
    this.animations.add('crouchingRight', Phaser.Animation.generateFrameNames('crouchingRight', 1, 4), 10, false);
    this.animations.add('throwLeft', ['throwLeft'], 10, false);
    this.animations.add('throwRight', ['throwRight'], 10, false);
    //Animaciones sin Cappy
    this.animations.add('runLeftCappy', Phaser.Animation.generateFrameNames('walkLeftCappy', 1, 3), 8, true);
    this.animations.add('runRightCappy', Phaser.Animation.generateFrameNames('walkRightCappy', 1, 3), 8, true);
    this.animations.add('jumpLeftCappy', ['jumpLeftCappy'], 10, false);
    this.animations.add('jumpRightCappy', ['jumpRightCappy'], 10, false);
    this.animations.add('idleLeftCappy', ['walkLeftCappy1'], 10, false);
    this.animations.add('idleRightCappy', ['walkRightCappy1'], 10, false);
    this.animations.add('crouchLeftCappy', Phaser.Animation.generateFrameNames('crouchLeftCappy', 1, 2), 10, false);
    this.animations.add('crouchRightCappy', Phaser.Animation.generateFrameNames('crouchRightCappy', 1, 2), 10, false);
    this.animations.add('idleCrouchLeftCappy', ['crouchLeftCappy1'], 10, false);
    this.animations.add('idleCrouchRightCappy', ['crouchRightCappy1'], 10, false);
    this.animations.add('tackleLeftCappy', ['swimLeftCappy2'], 10, false);
    this.animations.add('tackleRightCappy', ['swimRightCappy2'], 10, false);
    this.animations.add('swimLeftCappy', Phaser.Animation.generateFrameNames('swimLeftCappy', 1, 3), 8, true);
    this.animations.add('swimRightCappy', Phaser.Animation.generateFrameNames('swimRightCappy', 1, 3), 8, true);
    this.animations.add('bombLeftCappy', ['bombLeftCappy'], 10, false);
    this.animations.add('bombRightCappy', ['bombRightCappy'], 10, false);
    this.animations.add('crouchingLeftCappy', Phaser.Animation.generateFrameNames('crouchingLeftCappy', 1, 4), 10, false);
    this.animations.add('crouchingRightCappy', Phaser.Animation.generateFrameNames('crouchingRightCappy', 1, 4), 10, false);
    this.animations.add('kickLeft', ['kickLeft'], 10, false);
    this.animations.add('kickRight', ['kickRight'], 10, false);
    //Animaciones de daño
    this.animations.add('runLeftHurt', ['walkLeft1', 'hurt', 'walkLeft2', 'hurt', 'walkLeft3'], 10, true);
    this.animations.add('runRightHurt', ['walkRight1', 'hurt', 'walkRight2', 'hurt', 'walkRight3'], 10, true);
    this.animations.add('jumpLeftHurt', ['jumpLeft', 'hurt'], 10, true);
    this.animations.add('jumpRightHurt', ['jumpRight', 'hurt'], 10, true);
    this.animations.add('idleLeftHurt', ['walkLeft1', 'hurt'], 10, true);
    this.animations.add('idleRightHurt', ['walkRight1', 'hurt'], 10, true);
    this.animations.add('crouchLeftHurt', ['crouchLeft1', 'hurt', 'crouchLeft2', 'hurt'], 10, true);
    this.animations.add('crouchRightHurt', ['crouchRight1', 'hurt', 'crouchRight2', 'hurt'], 10, true);
    this.animations.add('idleCrouchLeftHurt', ['crouchLeft1', 'hurt'], 10, false);
    this.animations.add('idleCrouchRightHurt', ['crouchRight1', 'hurt'], 10, false);
    this.animations.add('tackleLeftHurt', ['swimLeft2', 'hurt'], 10, true);
    this.animations.add('tackleRightHurt', ['swimRight2', 'hurt'], 10, true);
    this.animations.add('swimLeftHurt', ['swimLeft1', 'hurt', 'swimLeft2', 'hurt', 'swimLeft3'], 10, true);
    this.animations.add('swimRightHurt', ['swimRight1', 'hurt', 'swimRight2', 'hurt', 'swimRight3'], 10, true);
    this.animations.add('bombLeftHurt', ['bombLeft', 'hurt'], 10, true);
    this.animations.add('bombRightHurt', ['bombRight', 'hurt'], 10, true);
    this.animations.add('crouchingLeftHurt', ['crouchingLeft1', 'hurt', 'crouchingLeft2', 'hurt', 'crouchingLeft3', 'hurt', 'crouchingLeft4', 'hurt'], 10, false);
    this.animations.add('crouchingRightHurt', ['crouchingRight1', 'hurt', 'crouchingRight2', 'hurt', 'crouchingRight3', 'hurt', 'crouchingRight4', 'hurt'], 10, false);
    this.animations.add('runLeftCappyHurt', ['walkLeftCappy1', 'hurt', 'walkLeftCappy2', 'hurt', 'walkLeftCappy3'], 10, true);
    this.animations.add('runRightCappyHurt', ['walkRightCappy1', 'hurt', 'ealkRightCappy2', 'hurt', 'walkRightCappy3'], 10, true);
    this.animations.add('jumpLeftCappyHurt', ['jumpLeftCappy', 'hurt'], 10, true);
    this.animations.add('jumpRightCappyHurt', ['jumpRightCappy', 'hurt'], 10, true);
    this.animations.add('idleLeftCappyHurt', ['walkLeftCappy1', 'hurt'], 10, true);
    this.animations.add('idleRightCappyHurt', ['walkRightCappy1', 'hurt'], 10, true);
    this.animations.add('crouchLeftCappyHurt', ['crouchLeftCappy', 'hurt'], 10, true);
    this.animations.add('crouchRightCappyHurt', ['crouchRightCappy', 'hurt'], 10, true);
    this.animations.add('tackleLeftCappyHurt', ['swimLeftCappy2', 'hurt'], 10, true);
    this.animations.add('tackleRightCappyHurt', ['swimRightCappy2', 'hurt'], 10, true);
    this.animations.add('swimLeftCappyHurt', ['swimLeftCappy1', 'hurt', 'swimLeftCappy2', 'hurt', 'swimLeftCappy3'], 10, true);
    this.animations.add('swimRightCappyHurt', ['swimRightCappy1', 'hurt', 'swimRightCappy2', 'hurt', 'swimRightCappy3'], 10, true);
    this.animations.add('bombLeftCappyHurt', ['bombLeftCappy', 'hurt'], 10, true);
    this.animations.add('bombRightCappyHurt', ['bombRightCappy', 'hurt'], 10, true);
    //Animaciones de Goomba
    this.animations.add('walkGoomba1', ['goombaLeft1', 'goombaRight1'], 5, true);
    this.animations.add('idleGoomba1', ['goombaLeft1'], 5, false);
    this.animations.add('hurtGoomba1', ['goombaLeft1', 'hurt'], 10, true);
    this.animations.add('walkGoomba2', ['goombaLeft2', 'goombaRight2'], 5, true);
    this.animations.add('idleGoomba2', ['goombaLeft2'], 5, false);
    this.animations.add('hurtGoomba2', ['goombaLeft2', 'hurt'], 10, true);
    this.animations.add('walkGoomba3', ['goombaLeft3', 'goombaRight3'], 5, true);
    this.animations.add('idleGoomba3', ['goombaLeft3'], 5, false);
    this.animations.add('hurtGoomba3', ['goombaLeft3', 'hurt'], 10, true);
    this.animations.add('walkGoomba4', ['goombaLeft4', 'goombaRight4'], 5, true);
    this.animations.add('idleGoomba4', ['goombaLeft4'], 5, false);
    this.animations.add('hurtGoomba4', ['goombaLeft4', 'hurt'], 10, true);

    this.animations.add('walkChompLeft', Phaser.Animation.generateFrameNames('ChompLeft', 1, 3), 10, true);
    this.animations.add('walkChompRight', Phaser.Animation.generateFrameNames('ChompRight', 1, 3), 10, true);
    this.animations.add('hurtChompLeft', ['ChompLeft1', 'hurt', 'ChompLeft2', 'hurt', 'ChompLeft3', 'hurt', 'ChompLeft2', 'hurt', 'ChompLeft1', 'hurt'], 10, true)
    this.animations.add('hurtChompRight', ['ChompRight', 'hurt', 'ChompRight2', 'hurt', 'ChompRight3', 'hurt', 'ChompRight2', 'hurt', 'ChompRight1', 'hurt'], 10, true)
}
Mario.prototype = Object.create(Phaser.Sprite.prototype);
Mario.constructor = Mario;

//Comprueba si está en el suelo
Mario.prototype.CheckOnFloor = function () {
    if (this.body.onFloor()) {
        this.prevY = this.y
        this.tackling = false;
        this.bombJump = false;
    }
}
//Movimiento
Mario.prototype.Move = function (dir) {
    this.facing = dir;
    this.prevY = this.y;
    if (!this.capture) //Si es Mario
    {
        if (!this.bombJump) //En el salto bomba no hay movimiento
        {
            this.moving = true;
            if (!this.crouching && !this.running) //Si no está agachado y no está corriendo
                this.body.velocity.x = this.facing * this.velocity;
            else if (this.crouching && !this.running) //Si está agachado
                this.body.velocity.x = this.facing * (this.velocity / 3);
            else if (!this.crouching && this.running) //Si está corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.75;
            else if (this.crouching && this.running) //Si está agachado corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.5;
        }
    }
    else {
        this.moving = true;
        this.enemy.MarioMove(this);
    }
}
//Ausencia de movimiento
Mario.prototype.NotMoving = function () {
    if (!this.capture) //Si es Mario
    {
        this.body.velocity.x = 0;
        this.moving = false;
    }
    else {
        this.moving = false;
        this.enemy.MarioNotMoving(this);
    }
}
//Salto
Mario.prototype.Jump = function () {
    this.prevY = this.y;
    if (!this.capture) //Si es Mario
    {
        if (this.body.onFloor() && !this.crouching) //Si está en el suelo y no está agachado puede saltar
        {
            this.swimming = false;
            this.tackles = 1;
            this.body.velocity.y = -this.jumpVelocity;
        }
    }
    else if ((this.body.onFloor() || this.body.touching.down)) {
        this.enemy.MarioJump(this);
    }
}
//Impulso tras el salto
Mario.prototype.Tackle = function () {
    this.prevY = this.y;
    if (!this.capture) //Si es Mario
    {
        if (!this.body.onFloor() && this.tackles > 0) {
            this.body.velocity.y = -this.jumpVelocity / 2;
            this.body.velocity.x = this.facing * (this.velocity / 2);

            this.tackles--;
            this.tackling = true;
        }
    }
}
//Agacharse
Mario.prototype.Crouch = function () {
    if (!this.capture) //Si es Mario
    {
        if (!this.swimming) //Solo puede agacharse o hacer salto bomba si no esta nadando
        {
            if (this.body.onFloor()) {
                this.crouching = true;
            }
            else {
                this.prevY = this.y;
                this.body.velocity.y = 600;
                this.body.velocity.x = 0;
                this.tackles = 0;
                this.bombJump = true;
            }
        }
    }
}
//No agacharse
Mario.prototype.NotCrouching = function () {
    this.crouching = false;
}
//Nadar
Mario.prototype.Swim = function () {
    if (!this.capture) //Si es Mario
    {
        this.prevY = this.y;
        this.swimming = true;
        this.game.physics.arcade.gravity.y = 600;

        if (this.body.velocity.y >= 0)
            this.body.velocity.y = -200;
    }
    else {
        //
    }
}
//Collision con Objetos
Mario.prototype.CollectibleCollision = function (object) {
    if (this.game.physics.arcade.overlap(object, this)) {
        object.Collision(this);
    }
}

//Colisión con enemigos
Mario.prototype.EnemyCollision = function (enemy) {
    if (!this.capture) {
        if (this.game.physics.arcade.overlap(enemy, this) && !this.hurt) {
            if (enemy.type == 'planta' && this.cappyPlant) {
                this.kickTimer = this.game.time.totalElapsedSeconds() + this.kickTime;
                this.kicking = true;
                enemy.kill();
                this.cappyPlant = false;
                this.cappy.Reset();
            }
            else {
                this.Hurt();
                return true;
            }
        }
        if (this.game.time.totalElapsedSeconds() > this.hurtTimer) {
            this.hurt = false;
            return false;
        }
    }
    else {
        return this.enemy.Collision(this, enemy);
    }
}
//Daño
Mario.prototype.Hurt = function () {
    if (this.life > 1) {
        this.life--;
        this.hurt = true;
        this.hurtTimer = this.game.time.totalElapsedSeconds() + this.hurtTime;
    }
    else
        this.Die();
    console.log(this.life);
}
//Muerte
Mario.prototype.Die = function () {
    this.reset(this.spawnX, this.spawnY);
    this.life = 3;
    this.goombaCount = 1;
    this.capture = false;

    if (this.cappy != null)
        this.cappy.Reset();

    this.recalculateBody();
}
//Lanzar a Cappy
Mario.prototype.ThrowCappy = function () {
    if (this.game.time.totalElapsedSeconds() > this.cappyCooldownTimer && !this.crouching && !this.tackling && !this.bombJump) {
        if (this.cappy == null) // Al principio crea una gorra
        {
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.throwTimer = this.game.time.totalElapsedSeconds() + this.throwTime;
        }
        else if (this.cappy != null && !this.cappy.alive && !this.capture && !this.cappyPlant) // Destruye la antigua y crea otra gorra
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.throwTimer = this.game.time.totalElapsedSeconds() + this.throwTime;
        }
        else if (this.capture) // Reinicia el estado de la gorra
        {
            this.cappy.Reset()
            this.goombaCount = 1;
            this.capture = false;
            this.cappy.cappyCapture = false;
            this.recalculateBody();
            if (this.enemy.type == 'chomp')
                this.enemy.reset(this.enemy.x, this.enemy.y);
        }
    }
}
//Animaciones
Mario.prototype.MarioAnims = function (dir, cappy, hurt) //String con la dirección, si tiene a cappy y si esta dañado
{
    if (this.swimming) //Animaciones cuando está nadando
        this.animations.play('swim' + dir + cappy + hurt);
    else if (this.body.onFloor()) //Animaciones cuando está en el suelo
    {
        if (this.throwTimer > this.game.time.totalElapsedSeconds()) {
            if (this.thrown)
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) {
            if (this.kickTimer > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else if (!this.moving && this.crouching)
            this.animations.play('idleCrouch' + dir + cappy + hurt);
        else if (this.crouching && this.running)
            this.animations.play('crouching' + dir + cappy + hurt);
        else if (this.crouching)
            this.animations.play('crouch' + dir + cappy + hurt);
        else if (this.moving)
            this.animations.play('run' + dir + cappy + hurt);
        else
            this.animations.play('idle' + dir + cappy + hurt);
    }
    else //Animaciones cuando está en el aire
    {

        if (this.bombJump)
            this.animations.play('bomb' + dir + cappy + hurt);
        else if (this.tackling)
            this.animations.play('tackle' + dir + cappy + hurt);
        else if (this.throwTimer > this.game.time.totalElapsedSeconds()) {
            if (this.thrown)
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) {
            if (this.kickTimer > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else
            this.animations.play('jump' + dir + cappy + hurt);
    }
}
Mario.prototype.handleAnimations = function () {
    if (!this.capture) //Si no hay enemigo capturado se ponen las animaciones de Mario
    {
        if (this.facing == 1) //Animaciones derecha
        {
            if (!this.hurt) {
                if (!this.thrown)
                    this.MarioAnims('Right', '', '');
                else
                    this.MarioAnims('Right', 'Cappy', '');
            }
            else {
                if (!this.thrown)
                    this.MarioAnims('Right', '', 'Hurt');
                else
                    this.MarioAnims('Right', 'Cappy', 'Hurt');
            }
        }
        else //Animaciones izquierda
        {
            if (!this.hurt) {
                if (!this.thrown)
                    this.MarioAnims('Left', '', '');
                else
                    this.MarioAnims('Left', 'Cappy', '');
            }
            else {
                if (!this.thrown)
                    this.MarioAnims('Left', '', 'Hurt');
                else
                    this.MarioAnims('Left', 'Cappy', 'Hurt');
            }
        }
    }
    else {
        this.enemy.handleAnimations(this);
    }

}
Mario.prototype.recalculateBody = function () {
    this.handleAnimations();
    this.body.height = this.height;
    this.body.width = this.width;
}

module.exports = Mario;

},{"./Cappy.js":2,"./Goomba.js":8}],11:[function(require,module,exports){
'use strict';

function Coins(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
}
Coins.prototype = Object.create(Phaser.Sprite.prototype);
Coins.constructor = Coins;

Coins.prototype.Collision = function (player) {
    player.coins++;
    console.log("Monedas: " + player.coins);
    this.kill();
}

module.exports = Coins;
},{}],12:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Planta(game, x, y, sprite, frame, shootingSpeed, shootingTime) {
    Enemy.call(this, game, x, y, sprite, frame, shootingSpeed, shootingTime);
    //Tipo
    this.type = sprite;
    //Disparo
    this.angleShoot = 0;
    //Sprites y animaciones
    this.scale.setTo(2,2);
    this.animations.add('shoot1', [9, 8], 5, false);
    this.animations.add('shoot2', [7, 6], 5, false);
    this.animations.add('shoot3', [5, 4], 5, false);
    this.animations.add('shoot4', [3, 2], 5, false);
    this.animations.add('shoot5', [1, 0], 5, false);
}
Planta.prototype = Object.create(Enemy.prototype);
Planta.constructor = Planta;

//Disparo
Planta.prototype.Shoot = function (target) {
    if (!target.cappyPlant) {
        var shot = this.EnemyShoot(target, 'disparo-fuego', this);
        this.Angle(target);
        return shot;
    }
    else {
        this.frame = 5;
    }
}
Planta.prototype.Angle = function (target) {
    this.angleShoot = Math.abs((this.game.physics.arcade.angleBetween(this, target) * 180) / Math.PI);
    if (this.angleShoot <= 36)
        return this.animations.play('shoot1');
    else if (this.angleShoot <= 36 * 2)
        return this.animations.play('shoot2');
    else if (this.angleShoot <= 36 * 3)
        return this.animations.play('shoot3');
    else if (this.angleShoot <= 36 * 4)
        return this.animations.play('shoot4');
    else
        return this.animations.play('shoot5');
}

module.exports = Planta;

},{"./Enemigo.js":7}],13:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Spiny(game, x, y, sprite, frame, speed, movingTime) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Movimiento
    this.speed = speed;
    this.movingTime = movingTime;
    this.movingTimer = 0;
    //Sprites y animaciones
    this.scale.setTo(2,2);
    this.animations.add('walkRight', [0, 1], 5, true);
    this.animations.add('walkLeft', [2, 3], 5, true);
}
Spiny.prototype = Object.create(Enemy.prototype);
Spiny.constructor = Spiny;

module.exports = Spiny;

},{"./Enemigo.js":7}],14:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
  },
  create: function () {
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    // load here the assets for the game
    this.game.load.image('logo', 'images/Logo.png');

    this.game.load.spritesheet('play', 'images/BotonPlay.png', 73, 30);
    this.game.load.spritesheet('options', 'images/BotonOptions.png', 95, 32);

    this.game.load.image('flag', 'images/bloque2.png');
    this.game.load.image('block', 'images/bloque2.png');
    this.game.load.image('moon', 'images/moon.png');
    this.game.load.image('coins', 'images/coins.png');

    this.game.load.spritesheet('chomp', 'images/Chomp.png',31.75,29.5);

    this.game.load.spritesheet('vidas', 'images/Vidas.png', 55, 55);
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('goomba', 'images/Goomba.png', 25, 24);
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 18.5, 16);
    this.game.load.spritesheet('planta', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('disparo-fuego', 'images/Disparo-Fuego.png', 9, 9);

    this.game.load.atlas('mario', 'images/Mario.png', 'images/sprites.json');

    this.game.load.tilemap('map', 'tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles3', 'tilemaps/tiles3G.png');
    this.game.load.image('tiles1', 'tilemaps/tiles1G.png'); 
    this.game.load.image('tiles2', 'tilemaps/tiles2G.png');    
    /*
    this.game.load.tilemap('map', 'tilemaps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles3', 'tilemaps/tiles3G.png');
    this.game.load.image('tiles1', 'tilemaps/tiles1G.png'); 
    this.game.load.image('tiles2', 'tilemaps/tiles2G.png');  
    */
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    this.game.stage.backgroundColor = 0x4488aa;
    this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY - 50, 'logo');
    this.logo.scale.setTo(2, 2);
    this.logo.anchor.setTo(0.5, 0.5);

    this.buttonPlay = this.game.add.button(this.game.world.centerX - 200, this.game.world.centerY + 250, 'play', play, this, 0, 1, 2);
    this.buttonPlay.scale.setTo(2, 2);
    this.buttonPlay.anchor.setTo(0.5, 0.5);

    this.buttonOptions = this.game.add.button(this.game.world.centerX + 200, this.game.world.centerY + 250, 'options', options, this, 0, 1, 2);
    this.buttonOptions.scale.setTo(2, 2);
    this.buttonOptions.anchor.setTo(0.5, 0.5);

    function play() {
      this.game.state.start('play');
    }
    function options() {
      //this.game.state.start('options');
    }
  }
};

var Options = {
  create: function () {

  }
};

window.onload = function () {
  var game = new Phaser.Game(1360, 768, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', Menu);
  game.state.add('options', Options);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};
},{"./play_scene.js":15}],15:[function(require,module,exports){
'use strict';

var Mario = require('./Mario.js');
var Goomba = require('./Goomba.js');
var Spiny = require('./Spiny.js');
var Planta = require('./PlantaPiraña.js');
var Monedas = require('./Monedas.js');
var Lunas = require('./Lunas.js');
var Banderas = require('./Checkpoints.js');
var Bloques = require('./Bloques.js');
var Chomp = require('./Chomp.js');

var PlayScene = {
  create: function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Teclas para input
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.correr = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    //Mapa
    this.game.stage.backgroundColor = '#787878';
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('tiles3G', 'tiles3');
    this.map.addTilesetImage('tiles1G', 'tiles1');
    this.map.addTilesetImage('tiles2G', 'tiles2');
    this.layer = this.map.createLayer('World1');
    this.layer.resizeWorld();

    //Colisiones
    this.collisions = this.map.createLayer('Colisiones');
    this.map.setCollisionByExclusion([], true, 'Colisiones');
    this.floor = this.map.createLayer('Suelo');
    this.map.setCollisionByExclusion([], true, 'Suelo');
    this.deathZone = this.map.createLayer('Muerte');
    this.map.setCollisionByExclusion([], true, 'Muerte');
    this.eBlocks = this.map.createLayer('BloquesENormales');
    this.map.setCollisionByExclusion([], true, 'BloquesENormales');
    this.blocks = this.map.createLayer('Bloques');
    this.map.setCollisionByExclusion([], true, 'Bloques');

    //Arrays
    this.collectibles = this.game.add.group();
    this.goombas = this.game.add.group();
    this.capturables = this.game.add.group();
    this.shots = this.game.add.group();

    this.enemies = [];
    this.capturables = [];
    this.blocksHandler = new Bloques(this.game, 'block', 'block');
    //Objetos: jugador y enemigos
    this.player = new Mario(this.game, 2300, 0, 'mario', 5, this);
    this.game.camera.follow(this.player);

    this.map.createFromObjects('Monedas', 11, 'coins', 0, true, false, this.collectibles, Monedas);
    this.map.createFromObjects('Lunas', 1269, 'moon', 0, true, false, this.collectibles, Lunas);
    this.map.createFromObjects('Checkpoints', 1255, 'flag', 0, true, false, this.collectibles, Banderas);

    this.goombas = this.game.add.group();
    this.plants = this.game.add.group();
    this.chomps = this.game.add.group();
    this.spinys = this.game.add.group();

    //this.map.createFromObjects('Enemigos', 1263, 'goomba', 0, true, false, this.goombas, Goomba);
    //this.map.createFromObjects('Enemigos', 1262, 'chomp', 0, true, false, this.chomps, Chomp);
    //this.map.createFromObjects('Enemigos', 1276, 'planta', 0, true, false, this.plants, Planta);
    //this.map.createFromObjects('Enemigos', 1268, 'spiny', 0, true, false, this.spinys, Spiny);

    this.goombas.add(new Goomba(this.game, 1150, 0, 'goomba', 0, 100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1500, 0, 'goomba', 0, -100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1800, 0, 'goomba', 0, -100, 2, this.player));
    this.goombas.add(new Goomba(this.game, 1600, 0, 'goomba', 0, 100, 2, this.player));
    this.chomps.add(new Chomp(this.game, 3800, 0, 'chomp', 0, 50, 150, 300, 1));
    this.spinys.add(new Spiny(this.game, 4900, 0, 'spiny', 0, 100, 2));
    this.plants.add(new Planta(this.game, 2600, 0, 'planta', 5, 300, 5));
    this.vidas = this.game.add.sprite(this.game.width - 110, 27, 'vidas', 0);
    this.vidas.scale.setTo(1.5, 1.5);
    this.vidas.fixedToCamera = true;
    //Array enemigo
    this.enemies.push(this.goombas);
    this.enemies.push(this.chomps);
    this.enemies.push(this.plants);
    this.enemies.push(this.spinys);
    //Array capturables
    this.capturables.push(this.goombas);
    this.capturables.push(this.chomps);
  },
  update: function () {
    this.vidas.frame = this.player.life - 1
    console.log(this.shots);
    //Colisiones del mapa respectos a los objetos del juego
    this.game.physics.arcade.collide(this.player, this.floor);
    this.game.physics.arcade.collide(this.player, this.collisions);
    this.game.physics.arcade.collide(this.player, this.deathZone, function (player) { player.Die(); });

    this.game.physics.arcade.collide(this.player, this.blocks, function (player, tile) { player.scene.blocksHandler.HitBlock(player, tile); });
    this.game.physics.arcade.collide(this.player, this.eBlocks, function (player, tile) { player.scene.blocksHandler.HitEBlock(player, tile, 'coin'); });

    this.enemies.forEach(
      function (item) {
        item.forEach(
          function (item) {
            this.game.physics.arcade.collide(item, this.floor);
            this.game.physics.arcade.collide(item, this.collisions, function (enemy) { enemy.ChangeDir(); });
            this.game.physics.arcade.collide(item, this.blocks);
            this.game.physics.arcade.collide(item, this.eBlocks);
          }, this);
      }, this);

    this.game.physics.arcade.collide(this.player.cappy, this.collisions);
    //Correr
    if (this.correr.isDown)
      this.player.running = true;
    else
      this.player.running = false;
    //Movimiento
    if (this.teclas.right.isDown)
      this.player.Move(1);
    else if (this.teclas.left.isDown)
      this.player.Move(-1);
    else
      this.player.NotMoving();
    //Salto
    if (this.saltar.isDown)
      this.player.Jump();
    if (this.teclas.up.isDown)
      this.player.Tackle();
    //Agacharse
    if (this.teclas.down.isDown)
      this.player.Crouch();
    if (this.teclas.down.isUp)
      this.player.NotCrouching();
    //Lanzar a Cappy
    if (this.lanzar.isDown)
      this.player.ThrowCappy();
    else if (this.player.cappy != null)
      this.player.cappy.cappyHold = false;
    //Manejo de eventos
    this.player.CheckOnFloor();
    this.player.handleAnimations();

    if (this.player.cappy != null) {
      this.player.cappy.Check();
      this.player.cappy.Collision();
    }
    //Goomba
    this.goombas.forEach(
      function (item) {
        if (item.alive) {
          item.Move();
          item.Die();
        }
      });
    this.chomps.forEach(
      function (item) {
        if (item.alive) {
          item.Move();
          item.Attack(this.player);
        }
      }, this);
    this.spinys.forEach(
      function (item) {
        if (item.alive) {
          item.Move();
        }
      });
    this.plants.forEach(
      function (item) {
        if (item.alive && item.inCamera) {
          var shot = item.Shoot(this.player);
          if (shot != undefined)
            this.shots.add(shot);
        }
      }, this);
    //colisiones con Objetos
    this.collectibles.forEach(
      function (item) {
        this.player.CollectibleCollision(item);
      }, this);
    //Colisiones con enemigos
    this.enemies.forEach(
      function (item) {
        item.forEach(
          function (item) {
            this.player.EnemyCollision(item);
            if (this.player.cappy != null)
              this.player.cappy.Stunn(item);
          }, this);
      }, this);
    //Colisiones con disparos
    this.shots.forEach(
      function (item) {
        if (this.player.EnemyCollision(item)) {
          item.destroy();
        }
        if (item.alive)
          item.RemoveShot();
      }, this);

    //Enemigos capturados/no capturados
    this.capturables.forEach(
      function (item) {
        item.forEach(
          function (item) {
            if (this.player.cappy != null)
              this.player.cappy.Capture(item);
          }, this);
      }, this);
  }
};



module.exports = PlayScene;

},{"./Bloques.js":1,"./Checkpoints.js":3,"./Chomp.js":4,"./Goomba.js":8,"./Lunas.js":9,"./Mario.js":10,"./Monedas.js":11,"./PlantaPiraña.js":12,"./Spiny.js":13}]},{},[14]);
