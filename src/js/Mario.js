'use strict';

var Cappy = require('./Cappy.js');
var Capturable = require('./Capturable.js');

function Mario(game, x, y, name) {
    Phaser.Sprite.call(this, game, x, y, name);

    this.cappy = null;
    this._cappyCooldownTimer = 0;
    this._thrown = false;

    this._life = 3;
    this._hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;

    this._velocity = 200;
    this._facing = 1; //1 derecha, -1 izquierda
    this._jumpVelocity = 400;
    this._tackles = 0;
    
    this._moving = false;
    this._bombJump = false;
    this._tackling = false;
    this._swimming = false;
    this._crouching = false;

    this._spawnX = x;
    this._spawnY = y;

    this.enemyType;
    this.capture = false;

    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 400;

    this.frame = 5;
    this.scale.setTo(2, 2);
    //Animaciones normales
    this.animations.add('runLeft', [4, 3, 2], 8, true);
    this.animations.add('runRight', [5, 6, 7], 8, true);
    this.animations.add('jumpLeft', [1], 10, false);
    this.animations.add('jumpRight', [8], 10, false);
    this.animations.add('idleLeft', [4], 10, false);
    this.animations.add('idleRight', [5], 10, false);
    this.animations.add('crouchLeft', [0], 10, false);
    this.animations.add('crouchRight', [9], 10, false);
    this.animations.add('tackleLeft', [13], 10, false);
    this.animations.add('tackleRight', [16], 10, false);
    this.animations.add('swimLeft', [14, 13, 12], 8, true);
    this.animations.add('swimRight', [15, 16, 17], 8, true);
    this.animations.add('bombLeft', [11], 10, false);
    this.animations.add('bombRight', [18], 10, false);
    //Animaciones sin Cappy
    this.animations.add('runLeftCappy', [24, 23, 22], 8, true);
    this.animations.add('runRightCappy', [25, 26, 27], 8, true);
    this.animations.add('jumpLeftCappy', [21], 10, false);
    this.animations.add('jumpRightCappy', [28], 10, false);
    this.animations.add('idleLeftCappy', [24], 10, false);
    this.animations.add('idleRightCappy', [25], 10, false);
    this.animations.add('crouchLeftCappy', [20], 10, false);
    this.animations.add('crouchRightCappy', [29], 10, false);
    this.animations.add('tackleLeftCappy', [33], 10, false);
    this.animations.add('tackleRightCappy', [36], 10, false);
    this.animations.add('swimLeftCappy', [34, 33, 32], 8, true);
    this.animations.add('swimRightCappy', [35, 36, 37], 8, true);
    this.animations.add('bombLeftCappy', [31], 10, false);
    this.animations.add('bombRightCappy', [38], 10, false);
    //Animaciones de Daño
    this.animations.add('runLeftHurt', [4,40, 3,40, 2,40], 8, true);
    this.animations.add('runRightHurt', [5,40, 6,40, 7,40], 8, true);
    this.animations.add('jumpLeftHurt', [1,40], 10, true);
    this.animations.add('jumpRightHurt', [8,40], 10, true);
    this.animations.add('idleLeftHurt', [4,40], 10, true);
    this.animations.add('idleRightHurt', [5,40], 10, true);
    this.animations.add('crouchLeftHurt', [0,40], 10, true);
    this.animations.add('crouchRightHurt', [9,40], 10, true);
    this.animations.add('tackleLeftHurt', [13,40], 10, true);
    this.animations.add('tackleRightHurt', [16,40], 10, true);
    this.animations.add('swimLeftHurt', [14,40, 13,40, 12,40], 8, true);
    this.animations.add('swimRightHurt', [15,40, 16,40, 17,40], 8, true);
    this.animations.add('bombLeftHurt', [11,40], 10, true);
    this.animations.add('bombRightHurt', [18,40], 10, true);
    this.animations.add('runLeftCappyHurt', [24,40, 23,40, 22,40], 8, true);
    this.animations.add('runRightCappyHurt', [25,40, 26,40, 27,40], 8, true);
    this.animations.add('jumpLeftCappyHurt', [21,40], 10, true);
    this.animations.add('jumpRightCappyHurt', [28,40], 10, true);
    this.animations.add('idleLeftCappyHurt', [24,40], 10, true);
    this.animations.add('idleRightCappyHurt', [25,40], 10, true);
    this.animations.add('crouchLeftCappyHurt', [20,40], 10, true);
    this.animations.add('crouchRightCappyHurt', [29,40], 10, true);
    this.animations.add('tackleLeftCappyHurt', [33,40], 10, true);
    this.animations.add('tackleRightCappyHurt', [36,40], 10, true);
    this.animations.add('swimLeftCappyHurt', [34,40, 33,40, 32,40], 8, true);
    this.animations.add('swimRightCappyHurt', [35,40, 36,40, 37,40], 8, true);
    this.animations.add('bombLeftCappyHurt', [31,40], 10, true);
    this.animations.add('bombRightCappyHurt', [38,40], 10, true);
    
    this.animations.add('goombaWalk',[44,45],8,true);
    this.animations.add('goombaIdle',[44],8,false)
    this.animations.add('goombaHurting',[40,44],8,true);
}
Mario.prototype = Object.create(Phaser.Sprite.prototype);
Mario.constructor = Mario;

//MOVIMIENTOS
Mario.prototype.CheckOnFloor = function() {
    if(this.body.onFloor())
    {
        this._tackling = false;
        this._bombJump = false;
    }
}
Mario.prototype.Move = function(dir) {
    this._facing = dir;
    if(!this.capture)
    {
        if(!this._bombJump) //en el salto bomba no hay movimiento
        {
            this._moving = true;
            if(!this._crouching) //si no esta agachado se mueve normal
                this.body.velocity.x = this._facing * this._velocity;
            else //si esta agachado la velocidd es n tercios de la original
                this.body.velocity.x = this._facing * (this._velocity / 3);
        }
    }
    else
    {
        this._moving=true;
        Capturable.prototype.Move(this);
    }
}
Mario.prototype.NotMoving = function() {
    if(!this.capture)
    {
        this.body.velocity.x = 0;    
        this._moving = false;
    }
    else
    {
        this._moving = false;
        Capturable.prototype.NotMoving(this);
    }
}
Mario.prototype.Jump = function() {
    if(!this.capture)
    {
        if(this.body.onFloor() && !this._crouching) //si esta en el suelo y no esta agachado puede saltar
        {   
            this._swimming = false;
            this._tackles = 1;
            this.body.velocity.y = -this._jumpVelocity;         
        }
    }
    else 
    {
        Capturable.prototype.Jump(this);
    } 
}
Mario.prototype.Tackle = function() {
    if(!this.capture)
    {
        if(!this.body.onFloor() && this._tackles > 0)
        {    
            this.body.velocity.y = -this._jumpVelocity / 2;
            this.body.velocity.x = this._facing * (this._velocity / 2);

            this._tackles--;
            this._tackling = true;
        }
    }
    else 
    {
        switch(this.enemyType)
        {
            case(0):
                break;
        }
    }
}
Mario.prototype.Crouch = function() {
    if(!this.capture)
    {
        if(!this._swimming) //solo puede agacharse o hacer salto bomba si no esta nadando
        {
            if(this.body.onFloor())
            {
                this._crouching = true;
            }
            else
            {
                this.body.velocity.y = 600;
                this.body.velocity.x = 0;
                this._tackles = 0;
                this._bombJump = true;  
            }            
        }
    }
    else 
    {
        switch(this.enemyType)
        {
            case(0):
                break;
        }
    }
}
Mario.prototype.NotCrouching = function() {
    this._crouching = false;
}
Mario.prototype.Swim  = function() {
    if(!this.capture)
    {
        this._swimming = true;
        this.game.physics.arcade.gravity.y = 600;

        if(this.body.velocity.y >= 0)
            this.body.velocity.y = -200;
    }
    else 
    {
        switch(this.enemyType)
        {
            case(0):
                break;
        }
    }
}

//DAÑO
Mario.prototype.EnemyCollision = function(enemy) {
    if(this.game.physics.arcade.overlap(enemy, this) && !this._hurt)
        this.Hurt();
    if(this.game.time.totalElapsedSeconds() > this.hurtTimer)
        this._hurt = false;
}
Mario.prototype.Hurt = function() {
    if(this._life > 1)
    {
        this._life--;
        this._hurt = true;
        this.hurtTimer = this.game.time.totalElapsedSeconds() + this.hurtTime;
    }
    else
        this.Die();
}
Mario.prototype.Die = function() {
    this.reset(this._spawnX, this._spawnY);
    this._life = 3;
}

//CAPPY
Mario.prototype.ThrowCappy = function() {
    if(this.game.time.totalElapsedSeconds() > this._cappyCooldownTimer && !this._crouching && !this._tackling && !this._bombJump)
    {
        if(this.cappy == null)
        {
            this.cappy = new Cappy(this.game, this.body.x ,this.body.y, 'cappy', this, this._facing);
            this.cappy.Throw();
        }
        else if(this.cappy != null && !this.cappy.alive && !this.capture)
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x ,this.body.y, 'cappy', this, this._facing);
            this.cappy.Throw();
        }
        else if(this.capture)
        {   
            this.cappy.Reset()
            this.capture = false;
            this.cappy.cappyCapture = false;
        }
    }
    
}

//ANIMACIONES
Mario.prototype.MarioAnims=function(dir,cappy,hurt)//string con la direccion, si esta dañado y si tiene a cappy
{
    if(this._swimming) //animaciones cuando esta nadando
        this.animations.play('swim'+dir+cappy+hurt);
    else if(this.body.onFloor()) //animaciones cuando esta en el suelo
    {
        this._bombJump = false;
        if(this._crouching)
            this.animations.play('crouch'+dir+cappy+hurt);
        else if(this._moving)
            this.animations.play('run'+dir+cappy+hurt);
        else
            this.animations.play('idle'+dir+cappy+hurt);
    }
    else //animaciones cuando esta en el aire
    {
        if(this._bombJump)
            this.animations.play('bomb'+dir+cappy+hurt);
        else if(this._tackling)
            this.animations.play('tackle'+dir+cappy+hurt);
        else
            this.animations.play('jump'+dir+cappy+hurt);
    }
}

Mario.prototype.EnemyAnims=function(dir)//Animaciones cuando hay un enemigo capturado
{
    if(this._swimming) //animaciones cuando esta nadando
    {

    }
    else if(this._hurt)
    {
        switch(this.type)
        {
            case(0):
            this.animations.play('goombaHurting');
            break;
        }
    }
    else if(this.body.onFloor()) //animaciones cuando esta en el suelo
    {
        if(this._crouching)
        {

        }
        else if(this._moving)
        {
            switch(this.type)
            {
                case(0):
                this.animations.play('goombaWalk');
                break;
            }
        }
        else
        {
            switch(this.type)
            {
                case(0):
                this.animations.play('goombaIdle');
                break;
            }
        }
    }
    else //animaciones cuando esta en el aire
    {
        
    }
}

Mario.prototype.handleAnimations = function() {
    if(!this.capture)//si no hay enemigo capturado se ponen las animaciones de mario
    {
        if(this._facing == 1) //animaciones Derecha
        {
            if(!this._hurt)
            {
                if(!this._thrown)
                    this.MarioAnims('Right','','');
                else
                    this.MarioAnims('Right','Cappy','');
            }
            else
            {
                if(!this._thrown)
                    this.MarioAnims('Right','','Hurt');
                else
                    this.MarioAnims('Right','Cappy','Hurt');
            }
        }
        else //animaciones Izquierda
        {
            if(!this._hurt)
            {
                if(!this._thrown)
                    this.MarioAnims('Left','','');
                else
                    this.MarioAnims('Left','Cappy','');
            }
            else
            {
                if(!this._thrown)
                    this.MarioAnims('Left','','Hurt');
                else
                    this.MarioAnims('Left','Cappy','Hurt');                
            }
        }
    }
    else//Cuando hay enemigo capturado
    {
        if(this._facing == 1) //animaciones Derecha
        {
            this.EnemyAnims('Right');
        }
        else
        {
            this.EnemyAnims('Left');
        }
    }
}

module.exports = Mario;
