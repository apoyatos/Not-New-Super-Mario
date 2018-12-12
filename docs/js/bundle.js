(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function Checkpoint(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
}
Checkpoint.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoint.constructor = Checkpoint;

//Guarda la posición de reaparición de Mario
Checkpoint.prototype.Collision = function (player) {
    player.spawnX = this.x;
    player.spawnY = this.y;
    this.frame = 1;
    //Sonido de la bandera
}

module.exports = Checkpoint;

},{}],2:[function(require,module,exports){
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

},{"./Corazon.js":5,"./Moneda.js":11}],3:[function(require,module,exports){
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
        }
    }
}
//Colisiones de Cappy con Mario
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
    //Mata a Cappy y para los sonidos
    this.player.cappy.kill();
    if (this.throwSound.isPlaying)
        this.throwSound.stop();
}
//Captura al enemigo con Cappy
Cappy.prototype.Capture = function (enemy, scene) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy)) //Al chocar con un enemigo capturables
    {
        //Pausa la escena
        scene.pause = true;
        this.cappyCapture = true;
        this.player.capture = true;
        this.player.enemy = enemy;
        //Para los sonidos
        if (this.throwSound.isPlaying)
            this.throwSound.stop();
        //Reproduce el sonido de captura
        this.captureSound.play();
        this.captureSound.onStop.add(ResetMario, this);
        //Tras reproducir el sonido
        function ResetMario() {
            //Mata a Cappy y posee al enemigo
            enemy.kill();
            this.Reset();
            this.player.reset(enemy.body.position.x, enemy.body.position.y);
            this.player.recalculateBody();
            //Reanuda la escena
            scene.pause = false;
        }
        return true;
    }
    else
        return false;
}
//Bloquea a la planta con Cappy
Cappy.prototype.Stunn = function (enemy) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy) && enemy.type == 'plant') //Si choca con la planta
    {
        //Mata a Cappy y para los sonidos
        this.player.cappyPlant = true;
        this.player.cappy.kill();
        if (this.throwSound.isPlaying)
            this.throwSound.stop();
    }
}

module.exports = Cappy;

},{}],4:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.charged = false;
    //Movimiento
    this.speed = speed;
    this.chain = chain;
    this.distance = distance;
    this.originalSpeed = speed;
    this.originX = x;
    //Acciones
    this.attack = false;
    this.charging = false;
    //Temporizadores
    this.cooldown = cooldown;
    this.cooldownTimer = 0;
    this.chargeTime = 1;
    this.chargeTimer = 0;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
    //Animaciones
    this.animations.add('walkLeft', [0, 1, 4, 1, 0], 5, true);
    this.animations.add('walkRight', [3, 2, 7, 2, 3], 5, true);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    //Tipo
    this.type = sprite;
}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

//Movimiento del chomp
Chomp.prototype.Move = function () {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if ((this.x + this.speed / 30 > (this.originX + this.chain)) || (this.x + this.speed / 30 < (this.originX - this.chain))) //Si está en el area de la cadena
        {
            if (this.attack) //Ataque cargando contra Mario
            {
                this.speed = this.originalSpeed * Math.sign(this.speed);
                this.attack = false;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldown;
            }
            this.speed = -this.speed;
        }
        this.body.velocity.x = this.speed;
        //Animaciones
        if (this.speed < 0)
            this.animations.play('walkLeft');
        else
            this.animations.play('walkRight');
    }
    else
        this.body.velocity.x = 0;
}
//Ataque del chomp
Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if (!this.attack && (Math.sign(this.speed) == Math.sign(player.x - this.x) && Math.abs(player.x - this.x) < this.distance)) //Si Mario está en rango ataca
        {
            this.x = this.originX + this.chain * Math.sign(-this.speed);
            this.speed = 4 * this.speed;
            this.attack = true;
        }
    }
}
//Movimiento del chomp capturado
Chomp.prototype.MarioMove = function (player) {
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) //Movimiento hacia la derecha
    {
        player.body.velocity.x = player.velocity / 3;
        this.charged = false;
        this.charging = false;
    }
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) //Movimiento hacia la izquierda
    {
        player.body.velocity.x = -player.velocity / 3;
        this.charged = false;
    }
    else {
        player.body.velocity.x = 0;
        if (!this.charging && !this.charged) //Carga el ataque
        {
            this.chargeTimer = this.game.time.totalElapsedSeconds() + this.chargeTime;
            this.charging = true;
            this.charged = false;
        }
        else if (this.game.time.totalElapsedSeconds() > this.chargeTimer) //Ataca
            this.charged = true;
    }
}
//Chomp capturado quieto o atacando
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.charged && ((player.x + player.velocity / 30 < (this.originX + this.chain) + 150) && player.facing == -1)) //Movimiento cargado hacia la derecha
    {
        player.body.velocity.x = 4 * player.velocity;
    }
    else if (this.charged && ((player.x - player.velocity / 30 > (this.originX - this.chain) - 150) && player.facing == 1)) //Movimiento cargado hacia la izquierda
    {
        player.body.velocity.x = -4 * player.velocity;
    }
    else //Quieto
    {
        player.body.velocity.x = 0;
        this.charged = false;
        this.charging = false;
    }
}
//Salto del chomp capturado
Chomp.prototype.MarioJump = function (player) { }
//Colisiones del chomp capturado con enemigos
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
//Colisiones del chomp capturado con bloques normales
Chomp.prototype.BlockCollision = function (tile, player) {
    if (this.charged) {
        player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
        this.breakSound.play();
    }
}
//Colisiones del chomp capturado con bloques normales
Chomp.prototype.EspecialBlockCollision = function (tile, prizeType) {
    if (tile.index == 2) {
        if (this.charged) {
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
}
//Animaciones
Chomp.prototype.handleAnimations = function (player) {
    if (player.hurt) //Si se hace daño
    {
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
    else //Si se mueve
    {
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

function Heart(game, x, y, sprite, frame, amount) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cantidad de vida
    this.amount = amount;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.gravity.y = 600;
}
Heart.prototype = Object.create(Phaser.Sprite.prototype);
Heart.constructor = Heart;

//Mario recoge el corazón
Heart.prototype.Collision = function (player) {
    //Cura a Mario y destruye el corazón
    if (this.amount > 3)
        player.life = 6;
    else {
        if (player.life > 3)
            player.life = 6;
        else
            player.life = 3;
    }
    this.kill();
    //Sonido del corazón
}

module.exports = Heart;

},{}],6:[function(require,module,exports){
'use strict';

function Shot(game, x, y, sprite, frame, animName, animFrames, animSpeed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.posX;
  this.shotSpeed;
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
  if (this.sprite == 'fireball')
    this.fireballSound.play();
  else {
    //Disparo del tanque (Expansión)
  }
}
//Destrucción del disparo
Shot.prototype.RemoveShot = function () {
  //Destruye el disparo si sale de la pantalla
  if (this.x < this.game.camera.x || this.x > this.game.camera.x + this.game.camera.width || this.y < this.game.camera.y || this.y > this.game.camera.y + this.game.camera.height)
    this.destroy();
}

module.exports = Shot;

},{}],7:[function(require,module,exports){
'use strict';

var Disparo = require('./Disparo.js');

function Enemy(game, x, y, sprite, frame, shootSpeed, shootTime) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
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

//Disparo
Enemy.prototype.EnemyShoot = function (target, sprite, enemy) {
  if (enemy.game.time.totalElapsedSeconds() > this.shootTimer) {
    //Crea el disparo
    if (sprite == 'fireball') {
      var shot = new Disparo(enemy.game, enemy.x, enemy.y, sprite, 0, 'fireball', [0, 1, 2, 3], 5);
      //Lo lanza
      shot.Shoot(target, enemy.shootSpeed);
      this.shootTimer = enemy.game.time.totalElapsedSeconds() + this.shootTime;
      return shot;
    }
    else {
      //Disparo del tanque (DLC)
    }
  }
}

module.exports = Enemy;

},{"./Disparo.js":6}],8:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Goomba(game, x, y, sprite, frame, speed, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    //Movimiento
    this.speed = speed;
    //Sonidos
    this.killSound = this.game.add.audio('kill');
    //Animación
    this.animations.add('walk', [0, 1], 5, true);
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
    this.animations.play('walk');
}
//Cambia la dirección
Goomba.prototype.ChangeDir = function () {
    this.speed = -this.speed;
}
//Mario pisa al goomba
Goomba.prototype.Killed = function () {
    if (this.game.physics.arcade.overlap(this, this.player) && this.player.y + this.player.height < this.y + 10 && !this.player.hurt && !this.player.capture) {
        this.Die();
        this.killSound.play();
        this.player.body.velocity.y = -this.player.jumpVelocity / 2;
        this.player.tackling = false;
        this.player.tackles = 1;
    }
}
//Muerte del goomba
Goomba.prototype.Die = function () {
    this.kill();
}
//Movimiento del goomba capturado
Goomba.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.7;
    else
        player.body.velocity.x = player.facing * player.velocity / 1.5;
}
//Goomba capturado quieto
Goomba.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto del goomba capturado
Goomba.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 1.6;
}
//Colisiones del goomba capturado con enemigos
Goomba.prototype.Collision = function (player, enemy) {
    if (player.game.physics.arcade.overlap(enemy, player) && !player.hurt) //Si choca con un enemigo
    {
        if (enemy.type == 'goomba') //Si es un goomba
        {
            if (player.y + player.height < enemy.y + 10 && player.goombaCount < 4) //Se sube en el goomba
            {
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
//Colisiones del goomba capturado con bloqes
Goomba.prototype.BlockCollision = function (player, tile) { }
Goomba.prototype.EspecialBlockCollision = function (tile, prizeType) { }
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
Moon.prototype.Collision = function (player, scene) {
    //Cura a Mario
    if (player.life > 3)
        player.life = 6;
    else
        player.life = 3;
    //Destruye la luna
    player.moons++;
    this.kill();
    //Pausa el juego y la música
    scene.pause = true;
    scene.level1Sound.pause();
    //Sonido de la luna
    this.moonSound.play();
    this.moonSound.onStop.add(Continue, this);
    //Reanuda el juego
    function Continue() {
        scene.pause = false;
        scene.level1Sound.resume();
    }
}

module.exports = Moon;

},{}],10:[function(require,module,exports){
'use strict';

var Cappy = require('./Cappy.js');

function Mario(game, x, y, sprite, frame, scene) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
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
    this.spawnY = y - 300;
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
    //Caja de colión
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
    this.animations.add('walkChompLeft', Phaser.Animation.generateFrameNames('ChompLeft', 1, 3), 10, true);
    this.animations.add('walkChompRight', Phaser.Animation.generateFrameNames('ChompRight', 1, 3), 10, true);
    this.animations.add('hurtChompLeft', ['ChompLeft1', 'hurt', 'ChompLeft2', 'hurt', 'ChompLeft3', 'hurt', 'ChompLeft2', 'hurt', 'ChompLeft1', 'hurt'], 10, true)
    this.animations.add('hurtChompRight', ['ChompRight', 'hurt', 'ChompRight2', 'hurt', 'ChompRight3', 'hurt', 'ChompRight2', 'hurt', 'ChompRight1', 'hurt'], 10, true)
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
            if (!this.crouching && !this.running) //Si no está agachado y no está corriendo
                this.body.velocity.x = this.facing * this.velocity;
            else if (this.crouching && !this.running) //Si está agachado
                this.body.velocity.x = this.facing * (this.velocity / 3);
            else if (!this.crouching && this.running) //Si está corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.5;
            else if (this.crouching && this.running) //Si está agachado corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.7;
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
    else if ((this.capture && this.body.onFloor() || this.body.touching.down)) //Enemigos capturados
    {
        this.enemy.MarioJump(this);
    }
}
//Impulso de Mario tras el salto
Mario.prototype.Tackle = function () {
    this.prevY = this.y;
    if (!this.capture && !this.body.onFloor() && this.tackles > 0) //Si es Mario. Si está en el aire se puede impulsar
    {
        if (!this.body.onFloor() && this.tackles > 0) {
            this.body.velocity.y = -this.jumpVelocity / 2;
            this.body.velocity.x = this.facing * (this.velocity / 2);

            this.tackles--;
            this.tackling = true;
            this.tackleSound.play();
        }
    }
}
//Salto bomba de Mario
Mario.prototype.JumpBomb = function () {
    if (!this.capture && !this.body.onFloor() && !this.swimming) //Si es Mario. Solo puede hacer el salto bomba si no esta nadando y está en el aire
    {
        this.prevY = this.y;
        this.body.velocity.y = 600;
        this.body.velocity.x = 0;
        this.tackles = 0;
        this.bombJump = true;
        //this.bombSound.play();
    }
}
//Mario agachado
Mario.prototype.Crouch = function () {
    if (!this.capture && this.body.onFloor() && !this.swimming) //Si es Mario. Solo puede agacharse si no esta nadando y está en el suelo
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
    else //Enemigos capturados
    {
        //Movimiento del pez (Expansión)
    }
}
//Colisión de Mario con objetos
Mario.prototype.ObjectCollision = function (object) {
    if (this.game.physics.arcade.overlap(object, this)) {
        object.Collision(this, this.scene);
    }
}
//Colisión de Mario con enemigos
Mario.prototype.EnemyCollision = function (enemy) {
    if (!this.capture) //Si es Mario
    {
        if (this.game.physics.arcade.overlap(enemy, this) && !this.hurt) {
            if (enemy.type == 'plant' && this.cappyPlant) //Si se choca con la planta que se ha comido a Cappy
            {
                this.kickTimer = this.game.time.totalElapsedSeconds() + this.kickTime;
                this.kicking = true;
                //Mata a la planta y reproduce el sonido
                enemy.kill();
                this.kickSound.play();
                //Reinica a Cappy
                this.cappyPlant = false;
                this.cappy.Reset();
            }
            else //Si se choca con un enemigo
            {
                this.Hurt();
                return true;
            }
        }
        if (this.game.time.totalElapsedSeconds() > this.hurtTimer) {
            this.hurt = false;
            return false;
        }
    }
    else //Enemigos capturados
        return this.enemy.Collision(this, enemy);
}
//Daño de Mario
Mario.prototype.Hurt = function () {
    if (this.life > 1) //Su vida es 1 o más
    {
        //Reduce la vida en uno y reproduce el sonido
        this.life--;
        this.hurtSound.play();
        this.hurt = true;
        this.hurtTimer = this.game.time.totalElapsedSeconds() + this.hurtTime;
    }
    else //Su vida es 0
        this.Die();
}
//Muerte de Mario
Mario.prototype.Die = function () {
    //Reinicia su posición, su vida, etc
    this.reset(this.spawnX, this.spawnY);
    this.life = 3;
    this.goombaCount = 1;
    this.capture = false;
    this.recalculateBody();
    //Reinicia a Cappy
    if (this.cappy != null)
        this.cappy.Reset();
    //Revive a todos los enemigos
    this.scene.enemies.forEach(
        function (item) {
            item.forEach(
                function (item) {
                    if (!item.alive) {
                        item.revive();
                    }
                }, this);
        }, this);
}
//Lanzamiento de Cappy
Mario.prototype.ThrowCappy = function () {
    if (this.game.time.totalElapsedSeconds() > this.cappyCooldownTimer && !this.crouching && !this.tackling && !this.bombJump) {
        if (this.cappy == null) //Al principio crea a Cappy y lo lanza
        {
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.throwTimer = this.game.time.totalElapsedSeconds() + this.throwTime;
        }
        else if (this.cappy != null && !this.cappy.alive && !this.capture && !this.cappyPlant) //Destruye a Cappy y crea otro
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.throwTimer = this.game.time.totalElapsedSeconds() + this.throwTime;
        }
        else if (this.capture) //Sale del estado de captura
        {
            //Impulsa a Mario
            this.body.velocity.y = -this.jumpVelocity / 1.7;
            this.tackling = false;
            this.tackles = 1;
            //Reinicia a Cappy, etc
            this.cappy.Reset()
            this.capture = false;
            this.cappy.cappyCapture = false;
            this.goombaCount = 1;
            this.recalculateBody();
            //Si el enemigo era un chomp reaparece
            if (this.enemy.type == 'chomp')
                this.enemy.reset(this.enemy.x, this.enemy.y);
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
        else if (!this.moving && this.crouching) //Animación cuando está agachado
            this.animations.play('idleCrouch' + dir + cappy + hurt);
        else if (this.crouching && this.running) //Animaciones cuando está rodando
            this.animations.play('crouching' + dir + cappy + hurt);
        else if (this.crouching) //Animaciones cuando está moviendose agachado
            this.animations.play('crouch' + dir + cappy + hurt);
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
//Recalcula la caja de colisiones
Mario.prototype.recalculateBody = function () {
    this.handleAnimations();
    this.body.height = this.height;
    this.body.width = this.width;
}

module.exports = Mario;

},{"./Cappy.js":3}],11:[function(require,module,exports){
'use strict';

function Coin(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonidos
    this.coinSound = this.game.add.audio('coin');
    //Animaciones
    this.animations.add('coin', [0, 1, 2, 3], 5, true);
}
Coin.prototype = Object.create(Phaser.Sprite.prototype);
Coin.constructor = Coin;

//Mario recoge la moneda
Coin.prototype.Collision = function (player) {
    //Destruye la moneda
    player.coins++;
    this.kill();
    //Sonido de la moneda
    this.coinSound.play();
}

module.exports = Coin;

},{}],12:[function(require,module,exports){
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
//Ángulo de disparo par aanimaciones
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

},{"./Enemigo.js":7}],13:[function(require,module,exports){
'use strict';

var Enemy = require('./Enemigo.js');

function Spiny(game, x, y, sprite, frame, speed) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Movimiento
    this.speed = speed;
    //Animaciones
    this.animations.add('walkLeft', [0, 1], 5, true);
    this.animations.add('walkRight', [2, 3], 5, true);
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
    this.speed = -this.speed;
}
//Muerte del spiny
Spiny.prototype.Die = function () {
    this.kill();
}

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
    //Imagenes:

    //Menu
    this.game.load.image('logo', 'images/Logo.png');
    this.game.load.spritesheet('start', 'images/Start.png', 306, 56);
    this.game.load.spritesheet('options', 'images/Options.png', 306, 56);
    //Menu pausa
    this.game.load.image('pause', 'images/MenuPausa.png');
    this.game.load.spritesheet('continue', 'images/Continue.png', 306, 56);
    this.game.load.spritesheet('exit', 'images/Exit.png', 306, 56);
    //Objetos del mapa
    this.game.load.image('block', 'images/Bloque.png');
    this.game.load.spritesheet('superBlock', 'images/SuperBloque.png', 34, 32);
    this.game.load.spritesheet('coin', 'images/Moneda.png', 15, 16);
    this.game.load.spritesheet('superCoin', 'images/SuperMoneda.png', 16, 16);
    this.game.load.image('heart', 'images/Corazon.png');
    this.game.load.image('superHeart', 'images/SuperCorazon.png');
    this.game.load.image('moon', 'images/Energiluna.png');
    this.game.load.spritesheet('checkpoint', 'images/Bandera.png', 26, 32);
    //Mario y enemigos
    this.game.load.atlas('mario', 'images/Mario.png', 'images/Mario.json');
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('life', 'images/Vida.png', 56, 55);
    this.game.load.spritesheet('goomba', 'images/Goomba.png', 25, 24);
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 19, 16);
    this.game.load.spritesheet('plant', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('chomp', 'images/Chomp.png', 31.75, 29.5);
    this.game.load.spritesheet('fireball', 'images/Disparo-Fuego.png', 9, 9);
    //Mapa
    //this.game.load.image('tiles', 'tilemaps/super_mario.png');
    //this.game.load.tilemap('map', 'tilemaps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('map', 'tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles1', 'tilemaps/tiles1G.png');
    this.game.load.image('tiles2', 'tilemaps/tiles2G.png');
    this.game.load.image('tiles3', 'tilemaps/tiles3G.png');
    //Sonidos:

    //Menu
    this.game.load.audio('start', 'audio/Start.wav');
    //Mario
    this.game.load.audio('jump', 'audio/Jump.wav');
    this.game.load.audio('swim', 'audio/Swim.wav');
    this.game.load.audio('kick', 'audio/Kick.wav');
    this.game.load.audio('kill', 'audio/Kill.wav');
    this.game.load.audio('hurt', 'audio/Hurt.wav');
    this.game.load.audio('hit', 'audio/Hit.wav');
    this.game.load.audio('break', 'audio/Break.wav');
    //Cappy
    this.game.load.audio('throw', 'audio/Throw.wav');
    this.game.load.audio('capture', 'audio/Capture.wav');
    //Objetos
    this.game.load.audio('coin', 'audio/Coin.wav');
    this.game.load.audio('moon', 'audio/Moon.wav');
    this.game.load.audio('fireball', 'audio/Fireball.wav');
    //Nivel
    this.game.load.audio('level1', 'audio/Level1.wav');
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    //Color del fondo
    this.game.stage.backgroundColor = 0x4488aa;
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(3, 3);
    this.logo.anchor.setTo(-1.2, -0.2);
    //Botón Start
    this.buttonPlay = this.game.add.button(0, 0, 'start', PlaySound, this, 0, 2, 1);
    this.buttonPlay.scale.setTo(2, 2);
    this.buttonPlay.anchor.setTo(-0.6, -4);
    this.startSound = this.game.add.audio('start');

    function PlaySound() {
      this.startSound.play();
      this.startSound.onStop.add(Play, this);
    }
    function Play() {
      this.game.state.start('play');
    }
    //Botón Options
    this.buttonOptions = this.game.add.button(0, 0, 'options', Options, this, 0, 2, 1);
    this.buttonOptions.scale.setTo(2, 2);
    this.buttonOptions.anchor.setTo(-0.6, -5.2);

    function Options() {
      //En desarrollo
    }
  }
};

var Options = {
  create: function () {
    //En desarrollo
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
var Chomp = require('./Chomp.js');
var Bandera = require('./Bandera.js');
var Moneda = require('./Moneda.js');
var Luna = require('./Luna.js');
var Bloque = require('./Bloque.js');

var PlayScene = {
  create: function () {
    //Físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Sonido nivel 1
    this.level1Sound = this.game.add.audio('level1');
    this.level1Sound.play();
    this.level1Sound.loop = true;
    //Teclas para input
    this.teclas = this.game.input.keyboard.createCursorKeys();
    this.saltar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.correr = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.lanzar = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.pausar = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
    //Mapa
    this.game.stage.backgroundColor = '#787878';
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('tiles1G', 'tiles1');
    this.map.addTilesetImage('tiles2G', 'tiles2');
    this.map.addTilesetImage('tiles3G', 'tiles3');
    this.layer = this.map.createLayer('World1');
    this.layer.resizeWorld();
    //Objetos del mapa
    this.objects = this.game.add.group();
    this.map.createFromObjects('Banderas', 1255, 'checkpoint', 0, true, false, this.objects, Bandera);
    this.map.createFromObjects('Monedas', 11, 'coins', 0, true, false, this.objects, Moneda);
    this.map.createFromObjects('Lunas', 1269, 'moon', 0, true, false, this.objects, Luna);
    //Colisiones del mapa
    this.collisions = this.map.createLayer('Colisiones');
    this.map.setCollisionByExclusion([], true, 'Colisiones');
    this.floor = this.map.createLayer('Suelo');
    this.map.setCollisionByExclusion([], true, 'Suelo');
    this.deathZone = this.map.createLayer('Muerte');
    this.map.setCollisionByExclusion([], true, 'Muerte');
    this.blocks = this.map.createLayer('Bloques');
    this.map.setCollisionByExclusion([], true, 'Bloques');
    this.coinBlocks = this.map.createLayer('BloquesMonedas');
    this.map.setCollisionByExclusion([], true, 'BloquesMonedas');
    this.heartBlocks = this.map.createLayer('BloquesCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesCorazones');
    this.superheartBlocks = this.map.createLayer('BloquesSuperCorazones');
    this.map.setCollisionByExclusion([], true, 'BloquesSuperCorazones');
    //Grupos
    this.goombas = this.game.add.group();
    this.spinys = this.game.add.group();
    this.plants = this.game.add.group();
    this.chomps = this.game.add.group();
    this.shots = this.game.add.group();
    //Arrays
    this.enemies = [];
    this.capturables = [];
    //Mario
    this.player = new Mario(this.game, 0, 150, 'mario', 5, this);
    this.game.camera.follow(this.player);
    //Enemigos
    this.goombas.add(new Goomba(this.game, 1300, 0, 'goomba', 0, 100, this.player));
    this.goombas.add(new Goomba(this.game, 1500, 0, 'goomba', 0, -100, this.player));
    this.goombas.add(new Goomba(this.game, 1800, 0, 'goomba', 0, -100, this.player));
    this.goombas.add(new Goomba(this.game, 1600, 0, 'goomba', 0, 100, this.player));
    this.spinys.add(new Spiny(this.game, 5000, 0, 'spiny', 0, 100));
    this.plants.add(new Planta(this.game, 2500, 0, 'plant', 5, 100, 5));
    this.chomps.add(new Chomp(this.game, 3800, 0, 'chomp', 0, 50, 150, 300, 1));
    //Array enemies
    this.enemies.push(this.goombas);
    this.enemies.push(this.chomps);
    this.enemies.push(this.plants);
    this.enemies.push(this.spinys);
    //Array capturables
    this.capturables.push(this.goombas);
    this.capturables.push(this.chomps);
    //Bloques
    this.blocksHandler = new Bloque(this.game, 'coin', 'heart', 'superHeart');
    //Vidas
    this.vidas = this.game.add.sprite(this.game.width, 0, 'life', 0);
    this.vidas.anchor.setTo(1.5, -0.2);
    this.vidas.fixedToCamera = true;
    //Monedas
    this.coins = this.game.add.sprite(0, 0, 'coin', 0);
    this.coins.anchor.setTo(-0.5, -0.5);
    this.coins.fixedToCamera = true;
    this.textCoins = this.game.add.text(0, 0, this.player.coins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textCoins.anchor.setTo(-3.5, -0.3);
    this.textCoins.fixedToCamera = true;
    //Super monedas
    this.superCoins = this.game.add.sprite(0, 0, 'superCoin', 0);
    this.superCoins.anchor.setTo(-4, -0.5);
    this.superCoins.fixedToCamera = true;
    this.textSuperCoins = this.game.add.text(0, 0, this.player.superCoins, { font: "16px Arial", fill: "#ffffff", align: "center" });
    this.textSuperCoins.anchor.setTo(-9, -0.3);
    this.textSuperCoins.fixedToCamera = true;
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
    this.buttonContinue.scale.setTo(2, 2);
    this.buttonContinue.anchor.setTo(-0.6, -4);
    this.buttonContinue.visible = false;
    this.buttonContinue.fixedToCamera = true;

    function Continue() {
      this.pauseButton = false;
      this.pauseMenuOpen = false;
      this.level1Sound.resume();
    }
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(2, 2);
    this.buttonExit.anchor.setTo(-0.6, -5.2);
    this.buttonExit.visible = false;
    this.buttonExit.fixedToCamera = true;

    function Exit() {
      //En desarrollo
    }
  },
  update: function () {
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
      this.level1Sound.pause();
    }
    else //Desaparece y continua la canción
    {
      this.pauseBackground.visible = false;
      this.buttonContinue.visible = false;
      this.buttonExit.visible = false;
    }
    //Interfaz
    this.vidas.frame = this.player.life - 1;
    this.textCoins.setText(this.player.coins);
    this.textSuperCoins.setText(this.player.superCoins);
    //Colisiones de Mario con el mapa
    this.game.physics.arcade.collide(this.player, this.floor);
    this.game.physics.arcade.collide(this.player, this.collisions);
    this.game.physics.arcade.collide(this.player, this.deathZone, function (player) { player.Die(); });
    //Colisiones de Mario con los bloques
    this.game.physics.arcade.collide(this.player, this.blocks, function (player, tile) { player.scene.blocksHandler.HitBlock(player, tile); });
    this.game.physics.arcade.collide(this.player, this.coinBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, 'coin'); });
    this.game.physics.arcade.collide(this.player, this.heartBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, 'heart'); });
    this.game.physics.arcade.collide(this.player, this.superheartBlocks, function (player, tile) { player.scene.blocksHandler.HitEspecialBlock(player, tile, 'superHeart'); });
    //Colisiones de Cappy con el mapa
    this.game.physics.arcade.collide(this.player.cappy, this.collisions);
    //colisiones de objetos con el mapa
    this.game.physics.arcade.collide(this.objects, this.floor);
    this.game.physics.arcade.collide(this.objects, this.heartBlocks);
    this.game.physics.arcade.collide(this.objects, this.superheartBlocks);
    //Colisiones de enemigos con el mapa y los bloques
    this.enemies.forEach(
      function (item) {
        item.forEach(
          function (item) {
            this.game.physics.arcade.collide(item, this.floor);
            this.game.physics.arcade.collide(item, this.collisions, function (enemy) { enemy.ChangeDir(); });
            this.game.physics.arcade.collide(item, this.deathZone, function (enemy) { enemy.Die(); });
            this.game.physics.arcade.collide(item, this.blocks);
            this.game.physics.arcade.collide(item, this.coinBlocks);
            this.game.physics.arcade.collide(item, this.heartBlocks);
            this.game.physics.arcade.collide(item, this.superheartBlocks);
          }, this);
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
      //Correr y rodar
      if (this.correr.isDown)
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
      this.player.body.gravity.y = 500; //Devuelve su gravedad
      this.player.CheckOnFloor();
      this.player.handleAnimations();
      //Control de eventos de Cappy
      if (this.player.cappy != null) {
        this.player.cappy.Check();
        this.player.cappy.Collision();
      }
      //Goombas
      this.goombas.forEach(
        function (item) {
          if (item.alive) {
            item.Move();
            item.Killed();
          }
        });
      //Spinys
      this.spinys.forEach(
        function (item) {
          if (item.alive) {
            item.Move();
          }
        });
      //Plantas
      this.plants.forEach(
        function (item) {
          if (item.alive && item.inCamera) {
            var shot = item.Shoot(this.player);
            if (shot != undefined)
              this.shots.add(shot);
          }
        }, this);
      //Chomps
      this.chomps.forEach(
        function (item) {
          if (item.alive) {
            item.Move();
            item.Attack(this.player);
          }
        }, this);
      //Colisiones de Mario con objetos
      this.objects.forEach(
        function (item) {
          this.player.ObjectCollision(item);
        }, this);
      //Colisiones de Mario con enemigos
      this.enemies.forEach(
        function (item) {
          item.forEach(
            function (item) {
              this.player.EnemyCollision(item);
              if (this.player.cappy != null)
                this.player.cappy.Stunn(item);
            }, this);
        }, this);
      //Colisiones de Cappy con enemigos
      this.capturables.forEach(
        function (item) {
          item.forEach(
            function (item) {
              if (this.player.cappy != null)
                this.player.cappy.Capture(item, this);
            }, this);
        }, this);
      //Colisiones de Mario con disparos
      this.shots.forEach(
        function (item) {
          //Devuelve su movimiento
          if (item.body.velocity.x == 0) {
            item.body.velocity.x = item.shotSpeed * item.posX;
            item.animations.play(item.sprite);
          }
          if (this.player.EnemyCollision(item)) {
            item.destroy();
          }
          if (item.alive)
            item.RemoveShot();
        }, this);
    }
    else //Juego pausado
    {
      //Mario
      this.player.body.gravity.y = 0;
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;
      this.player.animations.stop();
      //Cappy
      if (this.player.cappy != null) {
        this.player.cappy.body.velocity.x = 0;
        this.player.cappy.animations.stop();
      }
      //Goombas
      this.goombas.forEach(
        function (item) {
          if (item.alive) {
            item.body.velocity.x = 0;
            item.animations.stop();
          }
        }, this);
      //Spinys
      this.spinys.forEach(
        function (item) {
          if (item.alive) {
            item.body.velocity.x = 0;
            item.animations.stop();
          }
        });
      //Chomps
      this.chomps.forEach(
        function (item) {
          if (item.alive) {
            item.body.velocity.x = 0;
            item.animations.stop();
          }
        }, this);
      //Disparos
      this.shots.forEach(
        function (item) {
          //Guarda su dirección
          if (item.body.velocity < 0)
            item.posX = 1;
          else
            item.posX = -1;
          item.body.velocity.x = 0;
          item.animations.stop();
        }, this);
    }
  }
};

module.exports = PlayScene;

},{"./Bandera.js":1,"./Bloque.js":2,"./Chomp.js":4,"./Goomba.js":8,"./Luna.js":9,"./Mario.js":10,"./Moneda.js":11,"./PlantaPiraña.js":12,"./Spiny.js":13}]},{},[14]);
