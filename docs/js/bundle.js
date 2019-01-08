(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function Checkpoint(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonido
    this.flagSound = this.game.add.audio('checkpoint');
}
Checkpoint.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoint.constructor = Checkpoint;

//Guarda la posición de reaparición de Mario
Checkpoint.prototype.Collision = function (player) {
    //Cada vez que pasas por encima
    player.spawnX = this.position.x;
    player.spawnY = this.position.y - player.height;
    //Solo una vez
    if (this.frame != 1) {
        //Cura a Mario
        if (player.life > 3)
            player.life = 6;
        else
            player.life = 3;
        player.scene.vidas.frame = player.life - 1;
        //Sonido
        this.flagSound.play();
        this.frame = 1;
    }
}

module.exports = Checkpoint;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');
var Chomp = require('./Chomp.js');

function Boss(game, x, y, sprite, frame, chompSprite, speed, life, player, scene) {
    Enemy.call(this, game, x, y, sprite, frame);
    //Mario
    this.player = player;
    //Chomp
    this.chomp = new Chomp(this.game, this.x, this.y, chompSprite, 0, 50, 180, 300, 0, this.player, 0, this.player.chompBossAnims);
    this.chomp.originX = this.x + this.width / 4;
    this.capture = false;
    //Movimiento
    this.speed = speed;
    //Vida y daño
    this.life = life;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Propiedades
    this.scene = scene;
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 600;
    this.scale.setTo(1, 1);
    //Sonidos
    this.startBattle = false;
    this.musicOn = false;
    this.bossSound = this.game.add.audio('boss');
    this.bossSound.volume = 1;
    this.bossDeath = this.game.add.audio('bossDeath');
    this.bossDeath.volume = 1;
    //Animaciones
    this.animations.add('walkLeft', [0], 5, false);
    this.animations.add('walkRight', [1], 5, false);
    this.animations.add('hurtLeft', [0, 2], 5, true);
    this.animations.add('hurtRight', [1, 2], 5, true);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
}
Boss.prototype = Object.create(Enemy.prototype);
Boss.constructor = Boss;

//Movimiento del Boss
Boss.prototype.Move = function () {
    //Activa el inicio de la batalla contra el Boss
    if (this.player.y + this.player.height < this.bottom)
        this.startBattle = true;
    //Cuando inicia la batalla contra el Boss
    if (this.startBattle && !this.musicOn) {
        //Cambia la música de fondo
        this.scene.levelSound.stop();
        this.scene.battleSound.play();
        this.scene.battleSound.loop = true;
        //Cierra la zona del Boss
        this.scene.bossZone.revive();
        this.musicOn = true;
    }
    //El Boss empieza a moverse cuando llega Mario
    if (this.player.y < this.bottom) {
        //Si Mario ha capturado al chomp y está a más de la mitad de distancia de la cadena el Boss no se mueve
        if (this.chomp.captured && (this.player.x > this.x + this.speed + this.chomp.chain / 2 || this.player.x < this.x - this.speed - this.chomp.chain / 2))
            this.body.velocity.x = 0;
        else {
            this.chomp.originX = this.x + this.width / 4;
            this.body.velocity.x = Math.sign(this.player.x - this.x) * this.speed;
            //Animaciones
            if (!this.hurt) {
                if (this.body.velocity.x < 0)
                    this.animations.play('walkLeft');
                else
                    this.animations.play('walkRight');
            }
        }
    }
    else //Quieto
        this.body.velocity.x = 0;
}
//Vidas y daño recibido
Boss.prototype.Hurt = function () {
    if (this.chomp.charged && this.game.physics.arcade.overlap(this.chomp, this)) //Si se choca con Mario chomp
    {
        if (this.life > 1) //Su vida es 1 o más
        {
            if (!this.hurt) //Se hace daño
            {
                this.life--;
                this.hurtTimer = this.hurtTime + this.game.time.totalElapsedSeconds()
                this.hurt = true;
                this.bossSound.play();
                //Animaciones
                if (this.body.velocity.x < 0)
                    this.animations.play('hurtLeft');
                else
                    this.animations.play('hurtRight');
            }
        }
        else //Se muere y desaparece junto al chomp
        {
            if (!this.hurt) {
                this.chomp.kill();
                this.kill();
                //Pausa el juego y la música
                this.scene.pause = true;
                this.scene.battleSound.stop();
                //Sonido de la muerte del Boss
                this.bossDeath.play();
                this.bossDeath.onStop.add(Dead, this);
                //Reanuda el juego
                function Dead() {
                    this.scene.pause = false;
                    //Sonido de victoria
                    this.scene.winSound.play();
                }
                this.scene.winSound.onStop.add(Win, this);
                function Win() {
                    this.scene.win = true;
                }
            }
        }
    }
    if (this.alive && this.hurtTimer < this.game.time.totalElapsedSeconds())
        this.hurt = false;
}

module.exports = Boss;

},{"./Chomp.js":5,"./Enemigo.js":9}],4:[function(require,module,exports){
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
    this.scale.setTo(2, 2);
    //Sonidos
    this.throwSound = this.game.add.audio('throw');
    this.captureSound = this.game.add.audio('capture');
    //Animación
    this.animations.add("thrown", [0, 1, 2], 8, true);
}
Cappy.prototype = Object.create(Phaser.Sprite.prototype);
Cappy.constructor = Cappy;

//Movimiento de Cappy
Cappy.prototype.Throw = function () {
    if (!this.cappyCapture && !this.player.capture) //Si es Mario
    {
        if (!this.player.thrown) //Al lanzar a Cappy
        {
            //Animación y sonido
            this.body.velocity.x = this.velocity * this.dir;
            this.animations.play("thrown");
            this.throwSound.play();
            this.player.thrown = true;
            this.cappyHold = true;
            this.cappyTimer = this.game.time.totalElapsedSeconds() + this.cappyTime;
        }
    }
}
//Comprobaciones durante lanzamiento de Cappy
Cappy.prototype.Check = function () {
    if (this.player.thrown && !this.cappyStopped && !this.player.cappyPlant) //Si se ha lanzado y no se ha mantenido en su posición
    {
        if (this.game.time.totalElapsedSeconds() > this.cappyTimer) //Mantiene su posición un tiempo
        {
            this.body.velocity.x = 0;
            this.cappyStopped = true;
            this.throwSound.stop();
            this.throwSound.play();
            this.cappyHoldTimer = this.game.time.totalElapsedSeconds() + this.cappyHoldTime;
            this.cappyStopTimer = this.game.time.totalElapsedSeconds() + this.cappyStopTime;
        }
    }
    else if (this.cappyStopped && !this.player.cappyPlant) //Tras mantenerse en su posición
    {
        if ((this.cappyHold && this.game.time.totalElapsedSeconds() > this.cappyHoldTimer) || (!this.cappyHold && this.game.time.totalElapsedSeconds() > this.cappyStopTimer)) //Regresa a Mario
        {
            this.game.physics.arcade.moveToObject(this.player.cappy, this.player, 500);
            this.cappyReturning = true;
            this.body.checkCollision.up = this.player.y > this.y;
            this.body.checkCollision.left = false;
            this.body.checkCollision.right = false;
            this.body.checkCollision.down = this.player.y < this.y;
        }
    }
}
//Colisión de Cappy con Mario
Cappy.prototype.Collision = function () {
    if (this.game.physics.arcade.overlap(this.player.cappy, this.player) && this.cappyReturning) //Se reinicia al volver a Mario
        this.Reset();
    else if (this.game.physics.arcade.overlap(this.player.cappy, this.player) && this.cappyStopped) //Se reinicia después de que Mario salte sobre ella
    {
        this.player.body.velocity.y = -this.player.jumpVelocity / 1.2;
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
    this.body.checkCollision.up = true;
    this.body.checkCollision.left = true;
    this.body.checkCollision.right = true;
    this.body.checkCollision.down = true;;
    //Mata a Cappy y para los sonidos
    this.player.cappy.kill();
    if (this.throwSound.isPlaying)
        this.throwSound.stop();
}
//Captura al enemigo con Cappy
Cappy.prototype.Capture = function (enemy) {
    if (this.game.physics.arcade.overlap(this, enemy)) //Al chocar con un enemigo capturable
    {
        enemy.captured = true;
        this.cappyCapture = true;
        this.player.capture = true;
        this.player.enemy = enemy;
        //Sonidos
        if (this.throwSound.isPlaying)
            this.throwSound.stop();
        this.captureSound.play();
        //Mata a Cappy y posee al enemigo
        enemy.kill();
        this.Reset();
        this.player.reset(enemy.body.position.x, enemy.body.position.y);
        this.player.goombaCount = enemy.count;
        this.player.recalculateBody();
        return true;
    }
    else
        return false;
}
//Bloquea a la planta con Cappy
Cappy.prototype.Stunn = function (enemy) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy) && enemy.type == 'plant') //Si choca con la planta
    {
        //Mata a Cappy y para el sonido
        this.player.cappyPlant = true;
        this.player.cappy.kill();
        if (this.throwSound.isPlaying)
            this.throwSound.stop();
    }
}

module.exports = Cappy;

},{}],5:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown, player, offset, anims) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    this.charged = false;
    //Movimiento
    this.speed = speed;
    this.dir = 1;
    this.chain = chain;
    this.distance = distance;
    this.originalSpeed = speed;
    this.originX = x;
    this.offset = offset;
    //Acciones
    this.attack = false;
    this.charging = false;
    this.chargeAttack = false;
    this.captured = false;
    //Temporizadores
    this.cooldownTime = cooldown;
    this.cooldownTimer = 0;
    this.chargeTime = 0.25;
    this.chargeTimer = 0;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
    this.attackSound = this.game.add.audio('chomp');
    this.attackSound.volume = 0.5;
    //Animaciones
    this.anims = anims;
    this.animations.add('walkLeft', [2, 1, 3], 5, true);
    this.animations.add('walkRight', [5, 6, 4], 5, true);
    this.animations.add('chargeLeft', [0], 5, false);
    this.animations.add('chargeRight', [7], 5, false);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    //Tipo
    this.type = sprite;
}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

//Movimiento del chomp
Chomp.prototype.Move = function () {
    if (!this.captured) //Si es el chomp
    {
        //Cuando está atacando lanzado por Mario
        if (this.charged) {
            //Si llega al límite derecho cuando está atacando
            if ((this.x + (this.speed * this.dir) / 20 > (this.originX + this.chain + this.offset))) {
                this.charged = false;
                this.x = this.originX + this.chain - this.speed / 20;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + 2 * this.cooldownTime;
            }
            //Si llega al límite izquierdo cuando está atacando
            else if ((this.x - (this.speed * this.dir) / 20 < (this.originX - this.chain - this.offset))) {
                this.charged = false;
                this.x = this.originX - this.chain + this.speed / 20;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + 2 * this.cooldownTime;
            }
            this.body.velocity.x = this.speed * this.dir;
        }
        //Si no está atacando
        else {
            if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
                //Si ha llegado a un límite
                if ((this.x + (this.speed * this.dir) / 20 > (this.originX + this.chain)) || (this.x + (this.speed * this.dir) / 20 < (this.originX - this.chain))) {
                    //Si ha llegado al límite atacando se lanza más rápido hacia Mario
                    if (this.chargeAttack) {
                        this.speed = 8 * this.originalSpeed;
                        this.chargeAttack = false;
                        this.attack = true;
                        this.attackSound.play();
                    }
                    //Si ha llegado al límite después de atacar espera y regresa a la velocidad original
                    else if (this.attack) {
                        this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldownTime;
                        this.speed = this.originalSpeed;
                        this.attack = false;
                    }
                    this.dir = -this.dir;
                }
                this.body.velocity.x = this.speed * this.dir;
            }
            //Si está en espera no se mueve
            else
                this.body.velocity.x = 0;
        }
        this.ChompAnim();
    }
}
//Salto de Mario chomp
Chomp.prototype.MarioJump = function (player) { }
//Ataque del chomp
Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        //Si no está cargando o atacando y Mario se encuentra en su rango comienza a cargar el ataque
        if (!this.chargeAttack && !this.attack && !this.charged && this.dir == Math.sign(player.x - this.x)
            && (player.y < this.bottom) && (player.y > this.y - 2 * this.height) && Math.abs(player.x - this.x) < this.distance) {
            this.speed = 4 * this.originalSpeed;
            this.dir = -this.dir
            this.chargeAttack = true;
        }
    }
}
//Animaciones del chomp
Chomp.prototype.ChompAnim = function () {
    if (this.dir < 0) //Izquierda
    {
        if (!this.chargeAttack) //Si no está cargando el ataque
            this.animations.play('walkLeft');
        else //Si está cargando el ataque
            this.animations.play('chargeRight');
    }
    else if (this.dir > 0) //Derecha
    {
        if (!this.chargeAttack) //Si no está cargando el ataque
            this.animations.play('walkRight');
        else //Si está cargando el ataque
            this.animations.play('chargeLeft');
    }
}
//Captura del chomp
Chomp.prototype.Capture = function (cappy) {
    if (cappy != null)
        cappy.Capture(this);
}
//Movimiento de Mario chomp
Chomp.prototype.MarioMove = function (player) {
    //Si no llega al límite derecho se mueve a velocidad normal
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) {
        player.body.velocity.x = player.velocity / 2;
        this.charged = false;
        this.charging = false;
    }
    //Si no llega al límite izquierdo se mueve a velocidad normal
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) {
        player.body.velocity.x = -player.velocity / 2;
        this.charged = false;
        this.charging = false;
    }
    else {
        //cuando llega a uno de los límites comienza a cargar el ataque
        player.body.velocity.x = 0;
        //Si no está cargado o lanzandose empieza a cargar el ataque
        if (!this.charging && !this.charged) {
            this.chargeTimer = this.game.time.totalElapsedSeconds() + this.chargeTime;
            this.charging = true;
            this.charged = false;
        }
        else if (this.game.time.totalElapsedSeconds() > this.chargeTimer)
            this.charged = true;
    }
}
//Mario chomp lanzando al chomp o quieto
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.captured) {
        //Si está cargado lanza al chomp y sale de él
        if (this.charged) {
            this.dir = -player.facing
            this.chargeAttack = false
            player.ThrowCappy();
            this.speed = 8 * this.originalSpeed;
            this.attackSound.play();
        }
        else //Quieto
        {
            player.body.velocity.x = 0;
            this.charged = false;
            this.charging = false;
        }
    }
}
//Colisión de Mario chomp con enemigos
Chomp.prototype.MarioCollision = function () {
    Enemy.prototype.Collision(this.player);
}
//Colisión de Mario chomp con bloques normales
Chomp.prototype.BlockCollision = function (player, tile) {
    if (this.charged) {
        player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
        this.breakSound.play();
    }
}
//Colisión de Mario chomp con bloques especiales
Chomp.prototype.EspecialBlockCollision = function (tile, spawner) {
    if (tile.index == 498) //Bloque sin activar
    {
        if (this.charged) {
            //Al chocar con el bloque crea el premio
            tile.index = 619;
            tile.layer.dirty = true;
            player.scene.objects.add(spawner.Spawn(tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height)));
            this.hitSound.play();
        }
    }
}
//Animaciones de Mario chomp
Chomp.prototype.handleAnimations = function (player) {
    if (player.hurt) //Si se hace daño
    {
        if (this.charging) //Si está cargando
        {
            if (player.facing == -1)
                player.animations.play(this.anims[0]);
            else
                player.animations.play(this.anims[1]);
        }
        else if (!this.charged) //Si no está atacando
        {
            if (player.facing == -1)
                player.animations.play(this.anims[2]);
            else
                player.animations.play(this.anims[3]);
        }
        else if (this.charged) //Si está atacando
        {
            if (player.facing == 1)
                player.animations.play(this.anims[2]);
            else
                player.animations.play(this.anims[3]);
        }
    }
    else {
        if (this.charging) //Si está cargando
        {
            if (player.facing == -1)
                player.animations.play(this.anims[4]);
            else
                player.animations.play(this.anims[5]);
        }
        else if (!this.charged) //Si no está atacando
        {
            if (player.facing == -1)
                player.animations.play(this.anims[6]);
            else
                player.animations.play(this.anims[7]);
        }
        else if (this.charged) //Si está atacando
        {
            if (player.facing == 1)
                player.animations.play(this.anims[6]);
            else
                player.animations.play(this.anims[7]);
        }
    }

}

module.exports = Chomp;

},{"./Enemigo.js":9}],6:[function(require,module,exports){
'use strict';

var Moneda = require('./Moneda.js');

function CoinSpawner(game, sprite) {
    //Propiedades
    this.game = game;
    this.sprite = sprite;
}
//Genera una moneda
CoinSpawner.prototype.Spawn = function (x, y) {
    return (new Moneda(this.game, x, y, this.sprite));
}

module.exports = CoinSpawner;

},{"./Moneda.js":14}],7:[function(require,module,exports){
'use strict';

function Heart(game, x, y, sprite, frame, amount) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cantidad de vida
    this.amount = amount;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.gravity.y = 600;
    //Sonido
    this.heartSound = this.game.add.audio('heart');
}
Heart.prototype = Object.create(Phaser.Sprite.prototype);
Heart.constructor = Heart;

//Mario recoge el corazón
Heart.prototype.Collision = function (player) {
    //Cura a Mario y destruye el corazón
    if (this.amount == 6)
        player.life = 6;
    else {
        if (player.life > 3)
            player.life = 6;
        else
            player.life = 3;
    }
    player.scene.vidas.frame = player.life - 1;
    this.kill();
    this.heartSound.play();
}

module.exports = Heart;

},{}],8:[function(require,module,exports){
'use strict';

function Shot(game, x, y, sprite, frame, animName, animFrames, animSpeed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.shotSpeed;
  this.velX = 0;
  this.velY = 0;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  this.scale.setTo(2, 2);
  //Sonidos
  this.fireballSound = this.game.add.audio('fireball');
  //Sprite y animaciones
  this.sprite = sprite;
  this.animName = animName;
  this.animations.add(this.animName, animFrames, animSpeed, true);
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

//Disparo
Shot.prototype.Shoot = function (target, speed) {
  //Mueve el disparo
  this.shotSpeed = speed;
  this.game.physics.arcade.moveToObject(this, target, speed);
  //Animación y sonido del disparo
  this.animations.play(this.animName);
  this.fireballSound.play();

}
//Destrucción del disparo
Shot.prototype.RemoveShot = function () {
  //Destruye el disparo si sale de la pantalla
  if (this.x < this.game.camera.x || this.x > this.game.camera.x + this.game.camera.width || this.y < this.game.camera.y || this.y > this.game.camera.y + this.game.camera.height)
    this.destroy();
}
//Destrucción del disparo si choca con Mario
Shot.prototype.Collision = function (player) {
  this.destroy();
  player.Hurt();
}
//Destrucción del disparo si choca con Mario goomba
Shot.prototype.GoombaCollision = function (player) {
  this.Collision(player);
}

module.exports = Shot;

},{}],9:[function(require,module,exports){
'use strict';

var Disparo = require('./Disparo.js');

function Enemy(game, x, y, sprite, frame, shootSpeed, shootTime) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Posición de reaparición
  this.spawnX = x;
  this.spawnY = y;
  //Disparo
  this.shootSpeed = shootSpeed;
  this.shootTime = shootTime;
  this.shootTimer = 0;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = 600;
  this.scale.setTo(2, 2);
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;

//Disparo de enemigo
Enemy.prototype.EnemyShoot = function (target, sprite, enemy) {
  if (enemy.game.time.totalElapsedSeconds() > this.shootTimer) {
    //Crea el disparo
    var shot = new Disparo(enemy.game, enemy.x, enemy.y, sprite, 0, 'fireball', [0, 1, 2, 3], 5);
    //Lo dispara
    shot.Shoot(target, enemy.shootSpeed);
    this.shootTimer = enemy.game.time.totalElapsedSeconds() + this.shootTime;
    return shot;
  }
}
//Muerte del enemigo
Enemy.prototype.Die = function () {
  this.kill();
}
//Daña a Mario con enemigo capturado
Enemy.prototype.Collision = function (player) {
  player.Hurt();
}
Enemy.prototype.GoombaCollision = function (player) {
  this.Collision(player);
}
//Reset de enemigo
Enemy.prototype.Reset = function (x, y) {
  this.reset(x, y);
}
//Recalcula la caja de colisión
Enemy.prototype.Recalculate = function (player) {
  player.body.height = player.height;
  player.body.width = player.width;
}
//Metodos polimórficos
Enemy.prototype.Move = function () { }
Enemy.prototype.ChangeDir = function () { }
Enemy.prototype.Attack = function () { }
Enemy.prototype.Hurt = function () { }
Enemy.prototype.Shoot = function () { }
Enemy.prototype.Capture = function () { }
Enemy.prototype.BlockCollision = function () { }
Enemy.prototype.EspecialBlockCollision = function () { }

module.exports = Enemy;

},{"./Disparo.js":8}],10:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Goomba(game, x, y, sprite, frame, speed, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    this.count = 1;
    //Movimiento
    this.speed = speed;
    this.change = false;
    this.timer = 0;
    this.duration = 0.5;
    //Sonido
    this.killSound = this.game.add.audio('kill');
    //Animación
    this.animations.add('walk1', ['walkLeft1', 'walkRight1'], 5, true);
    this.animations.add('walk2', ['walkLeft2', 'walkRight2'], 5, true);
    this.animations.add('walk3', ['walkLeft3', 'walkRight3'], 5, true);
    this.animations.add('walk4', ['walkLeft4', 'walkRight4'], 5, true);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    //Tipo
    this.type = sprite;
}
Goomba.prototype = Object.create(Enemy.prototype);
Goomba.constructor = Goomba;

//Movimiento del goomba
Goomba.prototype.Move = function () {
    this.body.velocity.x = this.speed;
    if (this.count == 1)
        this.animations.play('walk1');
    else if (this.count == 2)
        this.animations.play('walk2');
    else if (this.count == 3)
        this.animations.play('walk3');
    else
        this.animations.play('walk4');
    this.recalculateBody();
}
//Cambia la dirección del goomba
Goomba.prototype.ChangeDir = function () {
    if (this.body.onWall() && !this.change) {
        this.speed = -this.speed;
        this.change = true;
        this.timer = this.game.time.totalElapsedSeconds() + this.duration;
    }
    if (this.timer < this.game.time.totalElapsedSeconds())
        this.change = false;
}
//Colisión del goomba
Goomba.prototype.Collision = function (player) {
    if (player.bottom < this.y + 10 && !player.hurt)
        this.Killed();
    else
        Enemy.prototype.Collision(player);
}
//Colisión del goomba con Mario goomba
Goomba.prototype.GoombaCollision = function (player) {
    if (player.bottom < this.y + 10 && player.goombaCount < 4) //Se sube en el goomba
    {
        player.goombaCount++;
        this.kill();
        player.recalculateBody();
    }
    else
        Enemy.prototype.GoombaCollision(player);
}
//Mario pisa al goomba
Goomba.prototype.Killed = function () {
    if (this.count == 1) //Muere si está solo
        this.Die();
    else //Pierde un miembro de la torre si son varios
    {
        this.count--;
        this.recalculateBody();
        this.y = this.y + this.height / (this.count + 1);
    }
    this.killSound.play();
    this.player.body.velocity.y = -this.player.jumpVelocity / 2;
    this.player.tackling = false;
    this.player.tackles = 1;
}
//Muerte del goomba
Goomba.prototype.Die = function () {
    this.kill();
    this.count = 1;
}
//Reset del goomba
Goomba.prototype.Reset = function (x, y, count) {
    this.reset(x, y);
    this.count = count;
}
//Captura del goomba
Goomba.prototype.Capture = function (cappy) {
    if (cappy != null)
        cappy.Capture(this);
}
//Movimiento de Mario goomba
Goomba.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.7;
    else
        player.body.velocity.x = player.facing * player.velocity / 1.5;
}
//Mario goomba quieto
Goomba.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto de Mario goomba
Goomba.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 1.7;
}
//Colisión de Mario goomba con enemigos
Goomba.prototype.MarioCollision = function (enemy) {
    enemy.GoombaCollision(this.player)
}
//Colisión de Mario goomba con bloqes
Goomba.prototype.BlockCollision = function () { }
Goomba.prototype.EspecialBlockCollision = function () { }
//Animaciones de Mario goomba
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
//Recalcula la caja de colisiones del goomba
Goomba.prototype.recalculateBody = function () {
    this.body.height = this.height;
    this.body.width = this.width;
}

module.exports = Goomba;

},{"./Enemigo.js":9}],11:[function(require,module,exports){
'use strict';

var Corazon = require('./Corazon.js');

function HeartSpawner(game, sprite, amount) {
    //Propiedades
    this.game = game;
    this.sprite = sprite;
    this.amount = amount;
}
//Genera un corazón
HeartSpawner.prototype.Spawn = function (x, y) {
    return new Corazon(this.game, x, y, this.sprite, 0, this.amount);
}

module.exports = HeartSpawner;

},{"./Corazon.js":7}],12:[function(require,module,exports){
'use strict';

function Moon(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonidos
    this.moonSound = this.game.add.audio('moon');
}
Moon.prototype = Object.create(Phaser.Sprite.prototype);
Moon.constructor = Moon;

//Mario recoge la luna
Moon.prototype.Collision = function (player) {
    //Cura a Mario
    if (player.life > 3)
        player.life = 6;
    else
        player.life = 3;
    player.scene.vidas.frame = player.life - 1;
    //Destruye la luna
    player.scene.moonsHUD[player.moons].frame = 0;
    player.moons++;
    this.kill();
    //Pausa el juego y la música
    player.scene.pause = true;
    player.scene.levelSound.pause();
    //Sonido de la luna
    this.moonSound.play();
    this.moonSound.onStop.add(Continue, this);
    //Reanuda el juego
    function Continue() {
        player.scene.pause = false;
        player.scene.levelSound.resume();
    }
}

module.exports = Moon;

},{}],13:[function(require,module,exports){
'use strict';

var Cappy = require('./Cappy.js');

function Mario(game, x, y, sprite, frame, scene) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cappy
    this.cappy = new Cappy(this.game, this.x, this.y, 'cappy', this, 1);
    this.cappy.kill();
    this.thrown = false;
    this.cappyPlant = false;
    this.cappyCooldownTimer = 0;
    //Vida y daño
    this.life = 3;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Objetos
    this.coins = 0;
    this.superCoins = 0;
    this.moons = 0;
    //Movimiento
    this.velocity = 200;
    this.prevY = this.y;
    this.facing = 1;
    this.jumpVelocity = 370;
    this.tackles = 0;
    //Acciones
    this.moving = false;
    this.bombJump = false;
    this.tackling = false;
    this.swimming = false;
    this.crouching = false;
    this.running = false;
    this.kicking = false;
    //Temporizadores
    this.kickTime = 0.2;
    this.kickTimer = 0;
    this.throwTime = 0.2;
    this.throwTimer = 0;
    //Posición de reaparición
    this.spawnX = x;
    this.spawnY = y;
    //Captura
    this.capture = false;
    this.enemy;
    this.goombaCount = 1;
    //Propiedades
    this.scene = scene;
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 600;
    this.scale.setTo(2, 2);
    //Sonidos
    this.jumpSound = this.game.add.audio('jump');
    this.tackleSound = this.game.add.audio('swim');
    this.bombSound = this.game.add.audio('hit');
    this.kickSound = this.game.add.audio('kick');
    this.hurtSound = this.game.add.audio('hurt');
    this.deathSound = this.game.add.audio('death');
    //Caja de colisión
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
    this.animations.add('throwLeft', ['throwLeft'], 10, false);
    this.animations.add('throwRight', ['throwRight'], 10, false);
    this.animations.add('kickLeft', ['kickLeft'], 10, false);
    this.animations.add('kickRight', ['kickRight'], 10, false);
    //Animaciones herido
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
    this.animations.add('dead', ['hurt'], 10, false);
    //Animaciones del Goomba
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
    //Animaciones del Chomp
    this.animations.add('walkChompLeft', Phaser.Animation.generateFrameNames('ChompLeft', 1, 3), 5, true);
    this.animations.add('walkChompRight', Phaser.Animation.generateFrameNames('ChompRight', 1, 3), 5, true);
    this.animations.add('hurtChompLeft', ['ChompLeft1', 'hurt', 'ChompLeft2', 'hurt', 'ChompLeft3', 'hurt'], 5, true);
    this.animations.add('hurtChompRight', ['ChompRight1', 'hurt', 'ChompRight2', 'hurt', 'ChompRight3', 'hurt'], 5, true);
    this.animations.add('chargeChompRight', ['ChompChargeRight'], 5, false);
    this.animations.add('chargeChompLeft', ['ChompChargeLeft'], 5, false);
    this.animations.add('hurtChargeChompRight', ['ChompChargeRight', 'hurt'], 5, true);
    this.animations.add('hurtChargeChompLeft', ['ChompChargeLeft', 'hurt'], 5, true);
    this.chompAnims = ['hurtChargeChompLeft', 'hurtChargeChompRight', 'hurtChompLeft', 'hurtChompRight', 'chargeChompLeft', 'chargeChompRight', 'walkChompLeft', 'walkChompRight'];
    //Animaciones del chomp dorado
    this.animations.add('walkChompBossLeft', Phaser.Animation.generateFrameNames('ChompBossLeft', 1, 3), 5, true);
    this.animations.add('walkChompBossRight', Phaser.Animation.generateFrameNames('ChompBossRight', 1, 3), 5, true);
    this.animations.add('hurtChompBossLeft', ['ChompBossLeft1', 'hurt', 'ChompBossLeft2', 'hurt', 'ChompBossLeft3', 'hurt'], 5, true);
    this.animations.add('hurtChompBossRight', ['ChompBossRight1', 'hurt', 'ChompBossRight2', 'hurt', 'ChompBossRight3', 'hurt'], 5, true);
    this.animations.add('chargeChompBossRight', ['ChompBossChargeRight'], 5, false);
    this.animations.add('chargeChompBossLeft', ['ChompBossChargeLeft'], 5, false);
    this.animations.add('hurtChargeChompBossRight', ['ChompBossChargeRight', 'hurt'], 5, true);
    this.animations.add('hurtChargeChompBossLeft', ['ChompBossChargeLeft', 'hurt'], 5, true);
    this.chompBossAnims = ['hurtChargeChompBossLeft', 'hurtChargeChompBossRight', 'hurtChompBossLeft', 'hurtChompBossRight', 'chargeChompBossLeft', 'chargeChompBossRight', 'walkChompBossLeft', 'walkChompBossRight'];
    //Animaciones del T-Rex
    this.animations.add('walkDinoLeft', Phaser.Animation.generateFrameNames('DinoLeft', 1, 10), 5, true);
    this.animations.add('walkDinoRight', Phaser.Animation.generateFrameNames('DinoRight', 1, 10), 5, true);
    this.animations.add('idleDinoLeft', ['DinoLeft1'], 5, false);
    this.animations.add('idleDinoRight', ['DinoRight1'], 5, false);
}
Mario.prototype = Object.create(Phaser.Sprite.prototype);
Mario.constructor = Mario;

//Comprueba si Mario está en el suelo
Mario.prototype.CheckOnFloor = function () {
    if (this.body.onFloor()) {
        this.prevY = this.y
        this.tackling = false;
        this.bombJump = false;
    }
}
//Movimiento de Mario
Mario.prototype.Move = function (dir) {
    this.facing = dir;
    this.prevY = this.y;
    if (!this.capture) //Si es Mario
    {
        if (!this.bombJump) //En el salto bomba no hay movimiento
        {
            this.moving = true;
            if (!this.crouching) //Si no está agachado
                this.body.velocity.x = this.facing * this.velocity;
            else if (this.crouching && !this.running) //Si está agachado
                this.body.velocity.x = this.facing * (this.velocity / 3);
            else if (this.crouching && this.running) //Si está agachado corriendo
                this.body.velocity.x = this.facing * this.velocity * 2;
        }
    }
    else //Enemigos capturados
    {
        this.moving = true;
        this.enemy.MarioMove(this);
    }
}
//Mario quieto
Mario.prototype.NotMoving = function () {
    if (!this.capture) //Si es Mario
    {
        this.body.velocity.x = 0;
        this.moving = false;
    }
    else //Enemigos capturados
    {
        this.moving = false;
        this.enemy.MarioNotMoving(this);
    }
}
//Salto de Mario
Mario.prototype.Jump = function () {
    this.prevY = this.y;
    if (!this.capture && this.body.onFloor() && !this.crouching) //Si es Mario. Si está en el suelo y no está agachado puede saltar
    {
        this.swimming = false;
        this.tackles = 1;
        this.body.velocity.y = -this.jumpVelocity;
        this.jumpSound.play();
    }
    else if ((this.capture && this.body.onFloor())) //Enemigos capturados
    {
        this.enemy.MarioJump(this);
    }
}
//Impulso de Mario tras el salto
Mario.prototype.Tackle = function () {
    this.prevY = this.y;
    if (!this.capture && !this.body.onFloor() && this.tackles > 0) //Si es Mario. Si está en el aire se puede impulsar una vez
    {
        if (!this.body.onFloor() && this.tackles > 0) {
            this.body.velocity.y = -this.jumpVelocity / 1.8;
            this.body.velocity.x = this.facing * (this.velocity / 2);

            this.tackles--;
            this.tackling = true;
            this.tackleSound.play();
        }
    }
}
//Salto bomba de Mario
Mario.prototype.JumpBomb = function () {
    if (!this.capture && !this.body.onFloor() && !this.swimming) //Si es Mario. Solo puede hacer el salto bomba si no está nadando y está en el aire
    {
        this.prevY = this.y;
        this.body.velocity.y = 600;
        this.body.velocity.x = 0;
        this.tackles = 0;
        this.bombJump = true;
    }
}
//Mario agachado
Mario.prototype.Crouch = function () {
    if (!this.capture && this.body.onFloor() && !this.swimming) //Si es Mario. Solo puede agacharse si no está nadando y está en el suelo
        this.crouching = true;
}
//Mario de pie
Mario.prototype.NotCrouching = function () {
    this.crouching = false;
}
//Mario nadando
Mario.prototype.Swim = function () {
    if (!this.capture) //Si es Mario
    {
        this.prevY = this.y;
        this.swimming = true;
        this.game.physics.arcade.gravity.y = 600;

        if (this.body.velocity.y >= 0)
            this.body.velocity.y = -200;
    }
}
//Patada de Mario
Mario.prototype.Kick = function () {
    this.kickTimer = this.game.time.totalElapsedSeconds() + this.kickTime;
    this.kicking = true;
    //Mata a la planta y reproduce el sonido
    this.kickSound.play();
    //Reinica a Cappy
    this.cappyPlant = false;
    this.cappy.Reset();
}
//Colisión de Mario con objetos
Mario.prototype.ObjectCollision = function (object) {
    if (this.game.physics.arcade.overlap(object, this)) {
        object.Collision(this, this.scene);
    }
}
//Colisión de Mario con enemigos
Mario.prototype.EnemyCollision = function (enemy) {
    if (this.game.physics.arcade.overlap(enemy, this) && !this.hurt) {
        if (!this.capture) //Si es Mario
            enemy.Collision(this);
        else //Enemigos capturados
            this.enemy.MarioCollision(enemy);
    }
    if (this.game.time.totalElapsedSeconds() > this.hurtTimer) {
        this.hurt = false;
    }
}
//Daño de Mario
Mario.prototype.Hurt = function () {
    if (this.life > 1) //Su vida es más de 1
    {
        //Reduce la vida en uno y reproduce el sonido
        this.life--;
        this.hurtSound.play();
        this.hurt = true;
        this.hurtTimer = this.game.time.totalElapsedSeconds() + this.hurtTime;
        this.scene.vidas.frame = this.life - 1;
    }
    else //Su vida es 1
    {
        //Reinicia su posición y lo mata
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.animations.play('dead');
        this.Die();
    }
}
//Muerte de Mario
Mario.prototype.Die = function () {
    //Pausa el juego y la música
    this.scene.pause = true;
    this.scene.levelSound.pause();
    //Sonido de muerte
    this.deathSound.play();
    this.deathSound.onStop.add(Respawn, this);
    //Reanuda el juego
    function Respawn() {
        this.scene.pause = false;
        this.scene.levelSound.resume();
        //Reinicia su vida y le resta todas las monedas
        this.coins = 0;
        this.scene.textCoins.setText(this.coins);
        //Reinicia a Cappy
        if (this.cappy != null) {
            this.cappy.Reset();
            this.capture = false;
            this.cappy.cappyCapture = false;
        }
        if (this.enemy != null) {
            this.scale.setTo(2, 2);
            this.recalculateBody();
            this.enemy.captured = false;
        }
        //Cura al Boss y abre su zona
        if (this.scene.bossZone.alive) {
            this.scene.boss.life = 3;
            this.scene.boss.startBattle = false;
            this.scene.boss.musicOn = false;
            this.scene.bossZone.kill();
            this.scene.battleSound.stop();
            this.scene.levelSound.play();
        }
        //Revive a todos los enemigos y los reposiciona
        this.scene.enemies.forEach(
            function (item) {
                if (!item.alive) {
                    item.revive();
                }
                item.reset(item.spawnX, item.spawnY);
                item.count = 1;
            }, this);
    }
}
//Lanzamiento de Cappy
Mario.prototype.ThrowCappy = function () {
    if (this.game.time.totalElapsedSeconds() > this.cappyCooldownTimer && !this.crouching && !this.tackling && !this.bombJump) {
        if (!this.cappy.alive && !this.capture && !this.cappyPlant) //Destruye a Cappy y crea otro
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.throwTimer = this.game.time.totalElapsedSeconds() + this.throwTime;
        }
        else if (this.capture) //Sale del estado de captura
        {
            //Impulsa a Mario
            this.body.velocity.y = -this.jumpVelocity / 1.2;
            this.tackling = false;
            this.tackles = 1;
            //Reinicia a Cappy, etc
            this.cappy.Reset()
            this.capture = false;
            this.cappy.cappyCapture = false;
            this.scale.setTo(2, 2);
            this.recalculateBody();
            this.body.width = 30;
            this.enemy.captured = false;
            //El enemigo reaparece
            this.enemy.Reset(this.x + this.enemy.width * -this.facing, this.y, this.goombaCount);
        }
    }
}
//Animaciones
Mario.prototype.MarioAnims = function (dir, cappy, hurt) //String con la dirección, si tiene a cappy y si está dañado
{
    if (this.swimming) //Animaciones cuando está nadando
        this.animations.play('swim' + dir + cappy + hurt);
    else if (this.body.onFloor()) //Animaciones cuando está en el suelo
    {
        if (this.throwTimer > this.game.time.totalElapsedSeconds()) //Animación de lanzamiento de Cappy
        {
            if (this.thrown)
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) //Animación de patada
        {
            if (this.kickTimer > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else if (this.crouching) {
            if (!this.moving) //Animación cuando está agachado
                this.animations.play('idleCrouch' + dir + cappy + hurt);
            else if (this.running) //Animaciones cuando está rodando
                this.animations.play('crouching' + dir + cappy + hurt);
            else  //Animaciones cuando está moviendose agachado
                this.animations.play('crouch' + dir + cappy + hurt);
        }
        else if (this.moving) //Animaciones cuando está andando
            this.animations.play('run' + dir + cappy + hurt);
        else //Animación cuando está quieto
            this.animations.play('idle' + dir + cappy + hurt);
    }
    else //Animaciones cuando está en el aire
    {
        if (this.bombJump) //Animación de salto bomba
            this.animations.play('bomb' + dir + cappy + hurt);
        else if (this.tackling) //Animación de impulso aereo
            this.animations.play('tackle' + dir + cappy + hurt);
        else if (this.throwTimer > this.game.time.totalElapsedSeconds()) {
            if (this.thrown) //Animación de lanzamiento de Cappy
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) //Animación de patada
        {
            if (this.kickTimer > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else //Animación de salto
            this.animations.play('jump' + dir + cappy + hurt);
    }
}
//Animaciones
Mario.prototype.handleAnimations = function () {
    if (!this.capture) //Animaciones de Mario
    {
        this.body.width = 18;
        this.body.offset.x = 2.5;
        if (this.facing == 1) //Animaciones derecha
        {
            if (!this.hurt) //Animaciones herido
            {
                if (!this.thrown)
                    this.MarioAnims('Right', '', '');
                else
                    this.MarioAnims('Right', 'Cappy', '');
            }
            else //Animaciones normal
            {
                if (!this.thrown)
                    this.MarioAnims('Right', '', 'Hurt');
                else
                    this.MarioAnims('Right', 'Cappy', 'Hurt');
            }
        }
        else //Animaciones izquierda
        {
            if (!this.hurt) //Animaciones herido
            {
                if (!this.thrown)
                    this.MarioAnims('Left', '', '');
                else
                    this.MarioAnims('Left', 'Cappy', '');
            }
            else //Animaciones normal
            {
                if (!this.thrown)
                    this.MarioAnims('Left', '', 'Hurt');
                else
                    this.MarioAnims('Left', 'Cappy', 'Hurt');
            }
        }
    }
    else //Animaciones de enemigo capturado
        this.enemy.handleAnimations(this);
}
//Recalcula la caja de colisiones de Mario
Mario.prototype.recalculateBody = function () {
    this.body.offset.x = 0;
    this.handleAnimations();
    this.enemy.Recalculate(this);
}

module.exports = Mario;

},{"./Cappy.js":4}],14:[function(require,module,exports){
'use strict';

function Coin(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonido
    this.coinSound = this.game.add.audio('coin');
    //Animación
    this.animations.add('coin', [0, 1, 2, 3], 5, true);
    this.animations.play('coin');
}
Coin.prototype = Object.create(Phaser.Sprite.prototype);
Coin.constructor = Coin;

//Mario recoge la moneda
Coin.prototype.Collision = function (player, scene) {
    //Destruye la moneda
    player.coins++;
    this.kill();
    //Sonido de la moneda
    this.coinSound.play();
    scene.textCoins.setText(player.coins);
}

module.exports = Coin;

},{}],15:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Fireplant(game, x, y, sprite, frame, shootSpeed, shootTime) {
    Enemy.call(this, game, x, y, sprite, frame, shootSpeed, shootTime);
    //Disparo
    this.angleShoot = 0;
    //Animaciones
    this.animations.add('shoot1', [9, 8], 5, false);
    this.animations.add('shoot2', [7, 6], 5, false);
    this.animations.add('shoot3', [5, 4], 5, false);
    this.animations.add('shoot4', [3, 2], 5, false);
    this.animations.add('shoot5', [1, 0], 5, false);
    //Tipo
    this.type = sprite;
}
Fireplant.prototype = Object.create(Enemy.prototype);
Fireplant.constructor = Fireplant;

//Disparo de la planta
Fireplant.prototype.Shoot = function (target) {
    if (!target.cappyPlant) //Si no se ha comido a Cappy dispara
    {
        var shot = this.EnemyShoot(target, 'fireball', this);
        this.Angle(target);
        return shot;
    }
    else
        this.frame = 5;
}
//Colisión de la planta
Fireplant.prototype.Collision = function (player) {
    if (player.cappyPlant) //Si se ha comido a Cappy
    {
        player.Kick();
        this.kill();
    }
    else
        Enemy.prototype.Collision(player);
}
//Ángulo de disparo para animaciones
Fireplant.prototype.Angle = function (target) {
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

module.exports = Fireplant;

},{"./Enemigo.js":9}],16:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Spiny(game, x, y, sprite, frame, speed) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Movimiento
    this.speed = speed;
    this.change = false;
    this.timer = 0;
    this.duration = 0.5;
    //Sonido
    this.killSound = this.game.add.audio('kill');
    //Animaciones
    this.animations.add('walkLeft', [0, 1], 5, true);
    this.animations.add('walkRight', [2, 3], 5, true);
    //Tipo
    this.type = sprite;
}
Spiny.prototype = Object.create(Enemy.prototype);
Spiny.constructor = Spiny;

//Movimiento del spiny
Spiny.prototype.Move = function () {
    this.body.velocity.x = this.speed;
    //Animaciones
    if (this.body.velocity.x < 0)
        this.animations.play('walkLeft');
    else
        this.animations.play('walkRight');
}
//Cambia la dirección
Spiny.prototype.ChangeDir = function () {
    if (this.body.onWall() && !this.change) {
        this.speed = -this.speed;
        this.change = true;
        this.timer = this.game.time.totalElapsedSeconds() + this.duration;
    }
    if (this.timer < this.game.time.totalElapsedSeconds())
        this.change = false;
}
//Muerte del spiny
Spiny.prototype.Die = function () {
    this.kill();
    this.killSound.play();
}

module.exports = Spiny;

},{"./Enemigo.js":9}],17:[function(require,module,exports){
'use strict';

function Coin(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonido
    this.coinSound = this.game.add.audio('coin');
    //Animación
    this.animations.add('coin', [0, 1, 2, 3], 5, true);
    this.animations.play('coin');
}
Coin.prototype = Object.create(Phaser.Sprite.prototype);
Coin.constructor = Coin;

//Mario recoge la moneda
Coin.prototype.Collision = function (player, scene) {
    //Destruye la moneda
    player.superCoins++;
    this.kill();
    //Sonido de la moneda
    this.coinSound.play();
    scene.textSuperCoins.setText(player.superCoins);
}

module.exports = Coin;

},{}],18:[function(require,module,exports){
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

},{"./Enemigo.js":9}],19:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = {
  preload: function () {
    this.game.load.spritesheet('odyssey', 'images/Odyssey.png', 140, 192);
  },
  create: function () {
    this.game.forceSingleUpdate = true;
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    //Color del fondo y volumen
    this.game.stage.backgroundColor = 0x4488aa;
    this.game.sound.volume = 0.5;
    //Imagen de carga
    this.odyssey = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'odyssey');
    this.odyssey.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(this.odyssey);
    //Imagenes:

    //Menu
    this.game.load.image('logo', 'images/Logo.png');
    this.game.load.image('credits', 'images/Credits.png');
    this.game.load.spritesheet('start', 'images/Start.png', 306, 56);
    this.game.load.spritesheet('options', 'images/Options.png', 306, 56);
    //Menu pausa y opciones
    this.game.load.image('pause', 'images/MenuPausa.png');
    this.game.load.spritesheet('continue', 'images/Continue.png', 306, 56);
    this.game.load.spritesheet('exit', 'images/Exit.png', 306, 56);
    this.game.load.spritesheet('volume', 'images/Volumen.png', 56, 56);
    //Tutorial-Imagenes
    this.game.load.image('andar', 'images/tutorial/Andar.png');
    this.game.load.image('agacharse', 'images/tutorial/Agacharse.png');
    this.game.load.image('rodar', 'images/tutorial/Rodar.png');
    this.game.load.image('saltar', 'images/tutorial/Saltar.png');
    this.game.load.image('impulso', 'images/tutorial/Impulso.png');
    this.game.load.image('lanzarCappy', 'images/tutorial/LanzarCappy.png');
    this.game.load.image('goombaTutorial', 'images/tutorial/Goomba.png');
    this.game.load.image('goombaMarioTutorial', 'images/tutorial/GoombaMario.png');
    this.game.load.image('goombaTorreTutorial', 'images/tutorial/GoombaTorre.png');
    this.game.load.image('chompCargadoTutorial', 'images/tutorial/ChompCargado.png');
    //Tutorial-Teclas
    this.game.load.image('arriba', 'images/tutorial/Arriba.png');
    this.game.load.image('abajo', 'images/tutorial/Abajo.png');
    this.game.load.image('izquierda', 'images/tutorial/Izquierda.png');
    this.game.load.image('derecha', 'images/tutorial/Derecha.png');
    this.game.load.image('espacio', 'images/tutorial/Espacio.png');
    this.game.load.image('shift', 'images/tutorial/Shift.png');
    this.game.load.image('z', 'images/tutorial/Z.png');
    this.game.load.image('x', 'images/tutorial/X.png');
    //Objetos del mapa
    this.game.load.image('block', 'images/Bloque.png');
    this.game.load.spritesheet('superBlock', 'images/SuperBloque.png', 34, 32);
    this.game.load.spritesheet('coin', 'images/Moneda.png', 15, 16);
    this.game.load.spritesheet('superCoin', 'images/SuperMoneda.png', 16, 16);
    this.game.load.image('heart', 'images/Corazon.png');
    this.game.load.image('superHeart', 'images/SuperCorazon.png');
    this.game.load.image('moon', 'images/Energiluna.png');
    this.game.load.spritesheet('checkpoint', 'images/Bandera.png', 26, 32);
    //Mario, enemigos e interfaz
    this.game.load.atlas('mario', 'images/Mario.png', 'images/Mario.json');
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('life', 'images/Vida.png', 56, 55);
    this.game.load.spritesheet('moonsHUD', 'images/EnergilunaHUD.png', 25, 22);
    this.game.load.atlas('goomba', 'images/Goomba.png', 'images/Goomba.json');
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 19, 16);
    this.game.load.spritesheet('plant', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('fireball', 'images/Disparo-Fuego.png', 9, 9);
    this.game.load.spritesheet('chomp', 'images/Chomp.png', 38, 29);
    this.game.load.spritesheet('chompBoss', 'images/ChompBoss.png', 38, 29);
    this.game.load.spritesheet('boss', 'images/MadameBroode.png', 115, 145);
    this.game.load.image('t-rex', 'images/T-Rex.png');
    //Mapa
    this.game.load.tilemap('tilemap', 'tilemaps/Nivel1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles1', 'tilemaps/Tileset1.png');
    this.game.load.image('tiles2', 'tilemaps/Tileset2.png');
    //Sonidos:

    //Menu
    this.game.load.audio('start', 'audio/Start.wav');
    this.game.load.audio('press', 'audio/Press.wav');
    this.game.load.audio('thanks', 'audio/Thanks.wav');
    //Mario
    this.game.load.audio('jump', 'audio/Jump.wav');
    this.game.load.audio('kick', 'audio/Kick.wav');
    this.game.load.audio('swim', 'audio/Swim.wav');
    this.game.load.audio('hurt', 'audio/Hurt.wav');
    this.game.load.audio('hit', 'audio/Hit.wav');
    this.game.load.audio('break', 'audio/Break.wav');
    this.game.load.audio('death', 'audio/Death.wav');
    //Cappy
    this.game.load.audio('throw', 'audio/Throw.wav');
    this.game.load.audio('capture', 'audio/Capture.wav');
    //Enemigos
    this.game.load.audio('fireball', 'audio/Fireball.wav');
    this.game.load.audio('kill', 'audio/Kill.wav');
    this.game.load.audio('chomp', 'audio/Chomp.wav');
    this.game.load.audio('boss', 'audio/MadameBroode.wav');
    this.game.load.audio('bossDeath', 'audio/MadameBroodeDeath.wav');
    //Objetos
    this.game.load.audio('coin', 'audio/Coin.wav');
    this.game.load.audio('heart', 'audio/Heart.wav');
    this.game.load.audio('moon', 'audio/Moon.wav');
    this.game.load.audio('checkpoint', 'audio/Checkpoint.wav');
    //Nivel
    this.game.load.audio('level', 'audio/LevelTheme.wav');
    this.game.load.audio('battle', 'audio/BattleTheme.wav');
    this.game.load.audio('win', 'audio/Win.wav');
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.startSound = this.game.add.audio('start');
    this.pressSound = this.game.add.audio('press');
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(2, 2);
    this.logo.anchor.setTo(-1, -0.2);
    //Botón Start
    this.buttonPlay = this.game.add.button(0, 0, 'start', Play, this, 0, 2, 1);
    this.buttonPlay.scale.setTo(1.5, 1.5);
    this.buttonPlay.anchor.setTo(-0.4, -4);

    function Play() {
      if (!this.clicked) {
        this.clicked = true;
        this.startSound.play();
        this.startSound.onStop.add(function () {
          this.game.state.start('tutorial');
        }, this);
      }
      this.clicked = false;
    }
    //Botón Options
    this.buttonOptions = this.game.add.button(0, 0, 'options', Options, this, 0, 2, 1);
    this.buttonOptions.scale.setTo(1.5, 1.5);
    this.buttonOptions.anchor.setTo(-0.4, -5.2);

    function Options() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('options', true, false, 'menu');
        }, this);
      }
      this.clicked = false;
    }
  }
};

var Options = {
  init: function (scene) {
    this.scene = scene;
  },
  create: function () {
    //Sonidos
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(2, 2);
    this.logo.anchor.setTo(-1, -0.2);
    //Volumen
    this.text = this.game.add.text(0, 0, 'VOLUME ' + Math.round(this.game.sound.volume * 100), { fill: 'white', font: '30px arial' });
    this.text.anchor.setTo(-1.85, -9);
    //Botón bajar volumen
    this.downVolume = this.game.add.button(0, 0, 'volume', VolDown, this, 0, 4, 2);
    this.downVolume.scale.setTo(1.5, 1.5);
    this.downVolume.anchor.setTo(-0.6, -4);
    //Botón subir volumen
    this.upVolume = this.game.add.button(0, 0, 'volume', VolUp, this, 1, 5, 3);
    this.upVolume.scale.setTo(1.5, 1.5);
    this.upVolume.anchor.setTo(-8, -4);
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(1.5, 1.5);
    this.buttonExit.anchor.setTo(-0.4, -5.2);

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start(this.scene);
        }, this);
      }
      this.clicked = false;
    }

    function VolDown() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume - 0.05;
        this.text.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
    function VolUp() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume + 0.05;
        this.text.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
  }
};

var Tutorial = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Movimientos de Mario
    this.imagenesMario = this.game.add.group();
    this.textoMario = this.game.add.group();
    this.teclasMario = this.game.add.group();
    //Andar
    this.imagenesMario.add(this.andar = this.game.add.sprite(0, 0, 'andar'));
    this.andar.anchor.setTo(-10, -1);
    //Texto
    this.textoMario.add(this.textAndar1 = this.game.add.text(0, 0, 'Walk', { fill: 'white', font: '30px arial' }));
    this.textAndar1.anchor.setTo(-1, -1.8);
    this.textoMario.add(this.textAndar2 = this.game.add.text(0, 0, 'or', { fill: 'white', font: '30px arial' }));
    this.textAndar2.anchor.setTo(-20.5, -1.8);
    //Teclas
    this.teclasMario.add(this.andarTecla1 = this.game.add.sprite(0, 0, 'izquierda'));
    this.andarTecla1.anchor.setTo(-10.5, -1.5);
    this.teclasMario.add(this.andarTecla2 = this.game.add.sprite(0, 0, 'derecha'));
    this.andarTecla2.anchor.setTo(-14.5, -1.5);
    //Agacharse
    this.imagenesMario.add(this.agacharse = this.game.add.sprite(0, 0, 'agacharse'));
    this.agacharse.anchor.setTo(-11.5, -4);
    //Texto
    this.textoMario.add(this.textAgacharse1 = this.game.add.text(0, 0, 'Crouch', { fill: 'white', font: '30px arial' }));
    this.textAgacharse1.anchor.setTo(-0.6, -3.6);
    this.textoMario.add(this.textAgacharse2 = this.game.add.text(0, 0, '+ Walk', { fill: 'white', font: '30px arial' }));
    this.textAgacharse2.anchor.setTo(-6, -3.6);
    //Tecla
    this.teclasMario.add(this.agacharseTecla = this.game.add.sprite(0, 0, 'abajo'));
    this.agacharseTecla.anchor.setTo(-11, -3.2);
    //Rodar
    this.imagenesMario.add(this.rodar = this.game.add.sprite(0, 0, 'rodar'));
    this.rodar.anchor.setTo(-8.4, -6);
    //Texto
    this.textoMario.add(this.textRodar1 = this.game.add.text(0, 0, 'Roll', { fill: 'white', font: '30px arial' }));
    this.textRodar1.anchor.setTo(-1.4, -5.8);
    this.textoMario.add(this.textRodar2 = this.game.add.text(0, 0, '+', { fill: 'white', font: '30px arial' }));
    this.textRodar2.anchor.setTo(-28, -5.8);
    this.textoMario.add(this.textRodar3 = this.game.add.text(0, 0, '+ Walk', { fill: 'white', font: '30px arial' }));
    this.textRodar3.anchor.setTo(-6.8, -5.8);
    //Teclas
    this.teclasMario.add(this.rodarTecla1 = this.game.add.sprite(0, 0, 'shift'));
    this.rodarTecla1.anchor.setTo(-8.4, -5.2);
    this.teclasMario.add(this.rodarTecla2 = this.game.add.sprite(0, 0, 'abajo'));
    this.rodarTecla2.anchor.setTo(-12.5, -5.2);
    //Saltar
    this.imagenesMario.add(this.saltar = this.game.add.sprite(0, 0, 'saltar'));
    this.saltar.anchor.setTo(-10, -6);
    //Texto
    this.textoMario.add(this.textSaltar = this.game.add.text(0, 0, 'Jump', { fill: 'white', font: '30px arial' }));
    this.textSaltar.anchor.setTo(-0.85, -8);
    //Tecla
    this.teclasMario.add(this.saltarTecla = this.game.add.sprite(0, 0, 'espacio'));
    this.saltarTecla.anchor.setTo(-2, -7.2);
    //Impulso
    this.imagenesMario.add(this.impulso = this.game.add.sprite(0, 0, 'impulso'));
    this.impulso.anchor.setTo(-8.4, -7.8);
    //Texto
    this.textoMario.add(this.textImpulso1 = this.game.add.text(0, 0, 'Tackle', { fill: 'white', font: '30px arial' }));
    this.textImpulso1.anchor.setTo(-0.75, -10.2);
    this.textoMario.add(this.textImpulso2 = this.game.add.text(0, 0, '+', { fill: 'white', font: '30px arial' }));
    this.textImpulso2.anchor.setTo(-36, -10.5);
    //Tecla
    this.teclasMario.add(this.impulsoTecla1 = this.game.add.sprite(0, 0, 'espacio'));
    this.impulsoTecla1.anchor.setTo(-1.7, -9.5);
    this.teclasMario.add(this.impulsoTecla2 = this.game.add.sprite(0, 0, 'arriba'));
    this.impulsoTecla2.anchor.setTo(-16, -9.5);

    this.imagenesMario.forEach(function (item) {
      item.scale.setTo(2, 2);
    }, this);
    this.teclasMario.forEach(function (item) {
      item.scale.setTo(0.75, 0.75);
    }, this);

    //Capturas Mario
    this.imagenesCappy = this.game.add.group();
    this.textoCappy = this.game.add.group();
    this.teclasCappy = this.game.add.group();
    //Lanzar
    this.imagenesCappy.add(this.lanzar = this.game.add.sprite(0, 0, 'lanzarCappy'));
    this.lanzar.anchor.setTo(-1.85, -1.2);
    //Texto
    this.textoCappy.add(this.textLanzar1 = this.game.add.text(0, 0, 'Throw', { fill: 'white', font: '25px arial' }));
    this.textLanzar1.anchor.setTo(-1.2, -1.8);
    this.textoCappy.add(this.textLanzar2 = this.game.add.text(0, 0, 'You can jump on Cappy', { fill: 'white', font: '15px arial' }));
    this.textLanzar2.anchor.setTo(-2.2, -6);
    //Tecla
    this.teclasCappy.add(this.lanzarTecla = this.game.add.sprite(0, 0, 'z'));
    this.lanzarTecla.anchor.setTo(-12.5, -1.5);
    //Pausa
    //Texto
    this.textoCappy.add(this.textPausa = this.game.add.text(0, 0, 'Pause', { fill: 'white', font: '25px arial' }));
    this.textPausa.anchor.setTo(-1.2, -6);
    //Tecla
    this.teclasCappy.add(this.pausaTecla = this.game.add.sprite(0, 0, 'x'));
    this.pausaTecla.anchor.setTo(-12.5, -4.5);
    //Torre Goomba
    this.imagenesCappy.add(this.goombaTorre = this.game.add.sprite(0, 0, 'goombaTorreTutorial'));
    this.goombaTorre.anchor.setTo(-5.5, -2.8);
    //Texto
    this.textoCappy.add(this.textgoombaTorre1 = this.game.add.text(0, 0, 'Goomba Tower', { fill: 'white', font: '25px arial' }));
    this.textgoombaTorre1.anchor.setTo(-0.2, -9.5);
    this.textoCappy.add(this.textGoombaTorre2 = this.game.add.text(0, 0, 'jump on', { fill: 'white', font: '25px arial' }));
    this.textGoombaTorre2.anchor.setTo(-5.8, -9.5);
    //Imagenes
    this.imagenesCappy.add(this.goomba1 = this.game.add.sprite(0, 0, 'goombaMarioTutorial'));
    this.goomba1.anchor.setTo(-8.5, -5.8);
    this.imagenesCappy.add(this.goomba2 = this.game.add.sprite(0, 0, 'goombaTutorial'));
    this.goomba2.anchor.setTo(-14, -6.8);
    //Chomp cargado
    this.imagenesCappy.add(this.chompCargado = this.game.add.sprite(0, 0, 'chompCargadoTutorial'));
    this.chompCargado.anchor.setTo(-2.2, -6.5);
    //Texto
    this.textoCappy.add(this.textChomp1 = this.game.add.text(0, 0, 'Charge Chomp', { fill: 'white', font: '25px arial' }));
    this.textChomp1.anchor.setTo(-0.2, -12);
    this.textoCappy.add(this.textChomp2 = this.game.add.text(0, 0, 'Move until reaching one side', { fill: 'white', font: '25px arial' }));
    this.textChomp2.anchor.setTo(-1.35, -12);

    this.imagenesCappy.forEach(function (item) {
      item.scale.setTo(2, 2);
      item.kill();
    }, this);
    this.teclasCappy.forEach(function (item) {
      item.scale.setTo(0.75, 0.75);
      item.kill();
    }, this);
    this.textoCappy.forEach(function (item) {
      item.kill();
    }, this);

    //Botón Continue
    this.count = 1;
    this.buttonContinue = this.game.add.button(0, 0, 'continue', Continue, this, 0, 2, 1);
    this.buttonContinue.scale.setTo(1.5, 1.5);
    this.buttonContinue.anchor.setTo(-0.4, -5.8);

    function Continue() {
      if (!this.clicked) {
        if (!this.clicked) {
          this.clicked = true;
          this.pressSound.play();
          this.pressSound.onStop.add(function () {
            if (this.count == 1) {
              this.count++;
              this.imagenesMario.forEach(function (item) {
                item.kill();
              }, this);
              this.textoMario.forEach(function (item) {
                item.kill();
              }, this);
              this.teclasMario.forEach(function (item) {
                item.kill();
              }, this);
              this.imagenesCappy.forEach(function (item) {
                item.revive();
              }, this);
              this.textoCappy.forEach(function (item) {
                item.revive();
              }, this);
              this.teclasCappy.forEach(function (item) {
                item.revive();
              }, this);
            }
            else if (this.count == 2) {
              this.count++;
              this.imagenesCappy.forEach(function (item) {
                item.kill();
              }, this);
              this.textoCappy.forEach(function (item) {
                item.kill();
              }, this);
              this.teclasCappy.forEach(function (item) {
                item.kill();
              }, this);
            }
            else
              this.game.state.start('play');
          }, this);
        }
        this.clicked = false;
      }
    }
  }
}

var Win = {
  create: function () {
    //Logo del juego
    this.logo = this.game.add.sprite(this.game.width / 3, 600, 'logo');
    this.logo.scale.setTo(2, 2);
    //Créditos
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 50, 'Developed by Odyssey Studios', { fill: 'white', font: '30px arial' });
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 100, 'Ismael Fernández Pereira', { fill: 'white', font: '30px arial' });
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 140, 'Álvaro Poyatos Morate', { fill: 'white', font: '30px arial' });
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 190, 'Facultad de Informatica UCM', { fill: 'white', font: '30px arial' });
    //Agradecimiento final
    this.thanks = this.game.add.sprite(this.game.width / 3, 600 + this.logo.width + 330, 'credits');
    this.thanks.scale.setTo(2, 2);
    //Sonidos
    this.clicked = false;
    this.played = false;
    this.pressSound = this.game.add.audio('press');
    this.thanksSound = this.game.add.audio('thanks');
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(1.5, 1.5);
    this.buttonExit.anchor.setTo(-0.4, -5.2);
    this.buttonExit.visible = false;

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('menu');
        }, this);
      }
      this.clicked = false;
    }
  },
  update: function () {
    this.game.world.forEach(function (element) {
      element.y -= 1;
    });
    if (this.thanks.bottom < 600 && !this.played) {
      this.thanksSound.play();
      this.thanksSound.onStop.add(function () {
        this.buttonExit.visible = true;
      }, this);
      this.played = true;
    }
    this.buttonExit.y += 1;
  }
};

window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', Menu);
  game.state.add('options', Options);
  game.state.add('tutorial', Tutorial);
  game.state.add('play', PlayScene);
  game.state.add('win', Win);

  game.state.start('boot');
};
},{"./play_scene.js":20}],20:[function(require,module,exports){
'use strict';

var Mario = require('./Mario.js');
var Goomba = require('./Goomba.js');
var Spiny = require('./Spiny.js');
var Planta = require('./PlantaPiraña.js');
var Chomp = require('./Chomp.js');
var Boss = require('./Boss.js');
var TRex = require('./T-Rex.js');

var Bandera = require('./Bandera.js');
var Moneda = require('./Moneda.js');
var SuperMoneda = require('./SuperMoneda.js');
var Luna = require('./Luna.js');
var Blocks = require('./BlockHandler.js');
var HeartSpawner = require('./HeartSpawner.js');
var CoinSpawner = require('./CoinSpawner.js');

var PlayScene = {

  create: function () {
    //Físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Sonido botón
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Sonido nivel 1
    this.levelSound = this.game.add.audio('level');
    this.battleSound = this.game.add.audio('battle');
    this.winSound = this.game.add.audio('win');
    this.winSound.volume = 1;
    this.levelSound.play();
    this.levelSound.loop = true;
    //Final del nivel 1
    this.win = false;
    //Teclas para input
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.rodar = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.pausar = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
    //Mapa
    this.map = this.game.add.tilemap('tilemap');
    this.map.addTilesetImage('Tiles1', 'tiles1');
    this.map.addTilesetImage('Tiles2', 'tiles2');
    this.layer = this.map.createLayer(1);
    this.layer.resizeWorld();
    //Objetos del mapa
    this.objects = this.game.add.group();
    this.map.createFromObjects('Banderas', 481, 'checkpoint', 0, true, false, this.objects, Bandera);
    this.map.createFromObjects('Monedas', 481, 'coin', 0, true, false, this.objects, Moneda);
    this.map.createFromObjects('SuperMonedas', 481, 'superCoin', 0, true, false, this.objects, SuperMoneda);
    this.map.createFromObjects('Lunas', 481, 'moon', 0, true, false, this.objects, Luna);
    //Colisiones del mapa
    this.collisions = this.map.createLayer('Colisiones');
    this.map.setCollisionByExclusion([], true, 'Colisiones');
    this.deathZone = this.map.createLayer('Muerte');
    this.map.setCollisionByExclusion([], true, 'Muerte');
    this.bossZone = this.map.createLayer('Boss');
    this.map.setCollisionByExclusion([], true, 'Boss');
    this.bossZone.kill();
    this.blocks = this.map.createLayer('Bloques');
    this.map.setCollisionByExclusion([], true, 'Bloques');
    this.coinBlocks = this.map.createLayer('BloquesMonedas');
    this.map.setCollisionByExclusion([], true, 'BloquesMonedas');
    this.heartBlocks = this.map.createLayer('BloquesCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesCorazones');
    this.superheartBlocks = this.map.createLayer('BloquesSuperCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesSuperCorazones');
    //Grupos
    this.enemies = this.game.add.group();
    this.shots = this.game.add.group();
    //Mario
    this.player = new Mario(this.game, 128, 2716, 'mario', 5, this);
    this.game.camera.follow(this.player);
    this.maxMoons = 10;
    this.minMoons = 5;
    //Enemigos:
    //Boss
    this.boss = new Boss(this.game, 5470, 446, 'boss', 0, 'chompBoss', 45, 3, this.player, this);
    this.enemies.add(this.boss);
    //T-Rex
    this.enemies.add(new TRex(this.game, 1408, 2080, 't-rex', 0, this.player));
    //Goombas
    this.enemies.add(new Goomba(this.game, 960, 2816, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 1890, 2688, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 2018, 2688, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 2146, 2688, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 2274, 2688, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 4864, 2848, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 5088, 2848, 'goomba', 0, 100, this.player));
    this.enemies.add(new Goomba(this.game, 4706, 2112, 'goomba', 0, -100, this.player));
    this.enemies.add(new Goomba(this.game, 4992, 2112, 'goomba', 0, 100, this.player));
    //Spinys
    this.enemies.add(new Spiny(this.game, 4576, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 4704, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 4832, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 4960, 2432, 'spiny', 0, -100));
    this.enemies.add(new Spiny(this.game, 5088, 2432, 'spiny', 0, -100));
    //Plantas
    this.enemies.add(new Planta(this.game, 2434, 1568, 'plant', 5, 100, 5));
    this.enemies.add(new Planta(this.game, 3936, 1216, 'plant', 5, 100, 5));
    this.enemies.add(new Planta(this.game, 4736, 2688, 'plant', 5, 100, 5));
    this.enemies.add(new Planta(this.game, 5184, 1120, 'plant', 5, 100, 5));
    //Chomps
    this.enemies.add(new Chomp(this.game, 2912, 2848, 'chomp', 0, 50, 150, 300, 1, this.player, 60, this.player.chompAnims));
    this.enemies.add(new Chomp(this.game, 3968, 2382, 'chomp', 0, 50, 150, 300, 1, this.player, 120, this.player.chompAnims));
    this.enemies.add(new Chomp(this.game, 4928, 1312, 'chomp', 0, 50, 90, 300, 1, this.player, 30, this.player.chompAnims));
    this.enemies.add(this.boss.chomp);
    //Bloques y objetos
    this.blocksHandler = new Blocks(this.game);
    this.coinSpawner = new CoinSpawner(this.game, 'coin');
    this.heartSpawner = new HeartSpawner(this.game, 'heart', 3);
    this.superHeartSpawner = new HeartSpawner(this.game, 'superHeart', 6);
    //Vidas
    this.vidas = this.game.add.sprite(this.game.width, 0, 'life', this.player.life - 1);
    this.vidas.anchor.setTo(1.5, -0.2);
    this.vidas.fixedToCamera = true;
    //Monedas
    this.coins = this.game.add.sprite(0, 0, 'coin', 0);
    this.coins.anchor.setTo(-0.5, -0.5);
    this.coins.fixedToCamera = true;
    this.textCoins = this.game.add.text(this.coins.right + 20, 0, this.player.coins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textCoins.anchor.setTo(0, -0.3);
    this.textCoins.fixedToCamera = true;
    //Super monedas
    this.superCoins = this.game.add.sprite(0, 0, 'superCoin', 0);
    this.superCoins.anchor.setTo(-4, -0.5);
    this.superCoins.fixedToCamera = true;
    this.textSuperCoins = this.game.add.text(this.superCoins.right + 20, 0, this.player.superCoins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textSuperCoins.anchor.setTo(0, -0.3);
    this.textSuperCoins.fixedToCamera = true;
    //Lunas
    this.moonsHUD = [];
    for (var i = 0; i < this.maxMoons; i++) {
      this.moonsHUD[i] = this.game.add.sprite(25 * i, 22, 'moonsHUD', 1);
      this.moonsHUD[i].anchor.setTo(0, -0.5);
      this.moonsHUD[i].fixedToCamera = true;
    }
    //Pausa
    this.pause = false;
    this.pauseButton = false;
    this.pauseMenuOpen = false;
    //Fondo del menu
    this.pauseBackground = this.game.add.sprite(0, 0, 'pause');
    this.pauseBackground.visible = false;
    this.pauseBackground.fixedToCamera = true;
    //Botón Continue
    this.buttonContinue = this.game.add.button(0, 0, 'continue', Continue, this, 0, 2, 1);
    this.buttonContinue.scale.setTo(1.5, 1.5);
    this.buttonContinue.anchor.setTo(-0.4, -4.2);
    this.buttonContinue.visible = false;
    this.buttonContinue.fixedToCamera = true;

    function Continue() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.pauseButton = false;
          this.pauseMenuOpen = false;
          this.levelSound.resume();
        }, this);
      }
      this.clicked = false;
    }
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(1.5, 1.5);
    this.buttonExit.anchor.setTo(-0.4, -5.4);
    this.buttonExit.visible = false;
    this.buttonExit.fixedToCamera = true;

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.levelSound.stop();
          this.game.state.start('menu');
        }, this);
      }
      this.clicked = false;
    }
    //Volumen
    this.volText = this.game.add.text(0, 0, 'VOLUME ' + Math.round(this.game.sound.volume * 100), { fill: 'white', font: '30px arial' });
    this.volText.anchor.setTo(-1.85, -7);
    this.volText.fixedToCamera = true;
    this.volText.visible = false;
    //Botón bajar volumen
    this.downVolume = this.game.add.button(0, 0, 'volume', VolDown, this, 0, 4, 2);
    this.downVolume.scale.setTo(1.5, 1.5);
    this.downVolume.anchor.setTo(-0.7, -3);
    this.downVolume.fixedToCamera = true;
    this.downVolume.visible = false;
    //Botón subir volumen
    this.upVolume = this.game.add.button(0, 0, 'volume', VolUp, this, 1, 5, 3);
    this.upVolume.scale.setTo(1.5, 1.5);
    this.upVolume.anchor.setTo(-8, -3);
    this.upVolume.fixedToCamera = true;
    this.upVolume.visible = false;

    function VolDown() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume - 0.05;
        this.volText.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
    function VolUp() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume + 0.05;
        this.volText.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
  },
  update: function () {
    //Comprueba si se ha ganado
    if (this.win)
      this.game.state.start('win');
    else {
      //Menu pausa
      this.pausar.onDown.add(PauseMenu, this);
      function PauseMenu() {
        if (!this.pause && !this.pauseButton) {
          this.pauseButton = true;
          this.pauseMenuOpen = true;
        }
      }
      if (this.pauseMenuOpen) //Visible, sin sonido del nivel
      {
        this.pauseBackground.visible = true;
        this.buttonContinue.visible = true;
        this.buttonExit.visible = true;
        this.upVolume.visible = true;
        this.volText.visible = true;
        this.downVolume.visible = true;
        this.levelSound.pause();
      }
      else //Desaparece y continua la música
      {
        this.pauseBackground.visible = false;
        this.buttonContinue.visible = false;
        this.buttonExit.visible = false;
        this.upVolume.visible = false;
        this.volText.visible = false;
        this.downVolume.visible = false;
      }
      //Colisiones de Mario con el mapa y los bloques
      if (this.player.alive) {
        this.game.physics.arcade.collide(this.player, this.collisions);
        this.game.physics.arcade.collide(this.player, this.deathZone, function (player) { player.life = 1; player.Hurt(); });
        this.game.physics.arcade.collide(this.player, this.bossZone);
        this.game.physics.arcade.collide(this.player, this.blocks, function (player, tile) { player.scene.blocksHandler.HitBlock(player, tile); });
        this.game.physics.arcade.collide(this.player, this.coinBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, player.scene.coinSpawner); });
        this.game.physics.arcade.collide(this.player, this.heartBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, player.scene.heartSpawner); });
        this.game.physics.arcade.collide(this.player, this.superheartBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, player.scene.superHeartSpawner); });
        //Colisiones de Cappy con el mapa
        if (this.player.cappy != null) {
          this.game.physics.arcade.collide(this.player.cappy, this.collisions);
          this.game.physics.arcade.collide(this.player.cappy, this.bossZone);
          this.game.physics.arcade.collide(this.player.cappy, this.blocks);
          this.game.physics.arcade.collide(this.player.cappy, this.coinBlocks);
          this.game.physics.arcade.collide(this.player.cappy, this.heartBlocks);
          this.game.physics.arcade.collide(this.player.cappy, this.superheartBlocks);
        }
      }
      //Colisiones de objetos
      this.objects.forEach(
        function (item) {
          if (item.alive) {
            //Colisiones de Mario con objetos
            this.player.ObjectCollision(item);
            //Colisiones con el mapa
            this.game.physics.arcade.collide(item, this.collisions);
            this.game.physics.arcade.collide(item, this.bossZone);
            this.game.physics.arcade.collide(item, this.blocks);
            this.game.physics.arcade.collide(item, this.coinBlocks);
            this.game.physics.arcade.collide(item, this.heartBlocks);
            this.game.physics.arcade.collide(item, this.superheartBlocks);
          }
        }, this);
      //Colisiones de enemigos 
      this.enemies.forEach(
        function (item) {
          if (item.alive) {
            //Colisiones
            this.game.physics.arcade.collide(item, this.collisions);
            this.game.physics.arcade.collide(item, this.deathZone, function (enemy) { enemy.Die(); });
            this.game.physics.arcade.collide(item, this.blocks, function (enemy, tile) { enemy.BlockCollision(enemy.player, tile); });
            this.game.physics.arcade.collide(item, this.coinBlocks, function (enemy, tile) { enemy.EspecialBlockCollision(tile, enemy.player.scene.coinSpawner); });
            this.game.physics.arcade.collide(item, this.heartBlocks, function (enemy, tile) { enemy.EspecialBlockCollision(tile, enemy.player.scene.heartSpawner); });
            this.game.physics.arcade.collide(item, this.superheartBlocks, function (enemy, tile) { enemy.EspecialBlockCollision(tile, enemy.player.scene.superHeartSpawner); });
            //Comportamiento de los enemigos
            if (!this.pause && !this.pauseButton) {
              item.Move();
              item.ChangeDir();
              item.Attack(this.player);
              item.Hurt();
              item.Capture(this.player.cappy);
              if (item.inCamera && !this.pause && !this.pauseButton) {
                var shot = item.Shoot(this.player);
                if (shot != undefined)
                  this.shots.add(shot);
              }
              //Colisiones con Mario
              this.player.EnemyCollision(item);
              if (this.player.cappy != null) {
                this.player.cappy.Stunn(item);
              }
            }
          }
        }, this);
      //Bucle del juego
      if (!this.pause && !this.pauseButton) //Condiciones de pausa. Juego activo
      {
        //Andar
        if (this.teclas.right.isDown)
          this.player.Move(1);
        else if (this.teclas.left.isDown)
          this.player.Move(-1);
        else
          this.player.NotMoving();
        //Rodar
        if (this.rodar.isDown)
          this.player.running = true;
        else
          this.player.running = false;
        //Salto e impulso aereo
        if (this.saltar.isDown)
          this.player.Jump();
        if (this.teclas.up.isDown)
          this.player.Tackle();
        //Agacharse y salto bomba
        if (this.teclas.down.isDown) {
          this.player.Crouch();
          this.player.JumpBomb();
        }
        if (this.teclas.down.isUp)
          this.player.NotCrouching();
        //Lanzar a Cappy
        if (this.lanzar.isDown)
          this.player.ThrowCappy();
        else if (this.player.cappy != null)
          this.player.cappy.cappyHold = false;
        //Control de eventos de Mario
        this.player.body.gravity.y = 500; //Vuelve su gravedad
        this.player.CheckOnFloor();
        this.player.handleAnimations();
        //Control de eventos de Cappy
        if (this.player.cappy != null) {
          this.player.cappy.Check();
          this.player.cappy.Collision();
          if (this.player.cappy.alive && !this.player.cappy.visible)
            this.player.cappy.visible = true;
        }
        //Colisiones de Mario con disparos
        this.shots.forEach(
          function (item) {
            //Devuelve su movimiento y animación
            if (item.body.velocity.x == 0 && item.body.velocity.y == 0) {
              item.body.velocity.x = item.VelX;
              item.body.velocity.y = item.VelY;
              item.animations.play(item.animName);
            }
            this.player.EnemyCollision(item);
            if (item.alive)
              item.RemoveShot();
          }, this);
      }
      //Pausa
      else {
        //Mario
        this.player.body.gravity.y = 0;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        this.player.animations.stop();
        //Cappy
        if (this.player.cappy != null) {
          this.player.cappy.body.velocity.x = 0;
          this.player.cappy.animations.stop();
          this.player.cappy.throwSound.stop();
          this.player.cappy.visible = false;
        }
        //Enemigos
        this.enemies.forEach(
          function (item) {
            if (item.alive) {
              item.body.velocity.x = 0;
              item.body.velocity.y = 0;
              item.animations.stop();
            }
          }, this);
        //Disparos
        this.shots.forEach(
          function (item) {
            //Guarda su dirección
            if (item.body.velocity.x != 0 || item.body.velocity.y != 0) {
              item.VelX = item.body.velocity.x;
              item.VelY = item.body.velocity.y;
            }
            item.body.velocity.x = 0;
            item.body.velocity.y = 0;
            item.animations.stop();
          }, this);
      }
    }
  }
}

module.exports = PlayScene;

},{"./Bandera.js":1,"./BlockHandler.js":2,"./Boss.js":3,"./Chomp.js":5,"./CoinSpawner.js":6,"./Goomba.js":10,"./HeartSpawner.js":11,"./Luna.js":12,"./Mario.js":13,"./Moneda.js":14,"./PlantaPiraña.js":15,"./Spiny.js":16,"./SuperMoneda.js":17,"./T-Rex.js":18}]},{},[19]);
