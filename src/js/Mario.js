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
    this.animations.add('runLeft', [4, 3, 2], 8, true);
    this.animations.add('runRight', [5, 6, 7], 8, true);
    this.animations.add('jumpLeft', [1], 10, false);
    this.animations.add('jumpRight', [8], 10, false);
    this.animations.add('idleLeft', [4], 10, false);
    this.animations.add('idleRight', [5], 10, false);
    this.animations.add('crouchLeft', [0], 10, false);
    this.animations.add('crouchRight', [9], 10, false);
    this.animations.add('tackleLeft', [23], 10, false);
    this.animations.add('tackleRight', [26], 10, false);
    this.animations.add('swimLeft', [24, 23, 22], 8, true);
    this.animations.add('swimRight', [35, 36, 37], 8, true);
    this.animations.add('bombLeft', [12], 10, false);
    this.animations.add('bombRight', [17], 10, false);
    this.animations.add('hurtingLeft',[ 16, 4], 8, true);
    this.animations.add('hurtingRight', [16, 5], 8, true);
    
    this.animations.add('goombaWalk',[34,35],8,true);
    this.animations.add('goombaIdle',[34],8,false)
    this.animations.add('goombaHurting',[33,34],8,true);
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
        if(this.body.onFloor());
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
    if(this.game.time.totalElapsedSeconds() > this._cappyCooldownTimer)
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
Mario.prototype.MarioAnims=function(dir)//string con la direccion
{
    if(this._swimming) //animaciones cuando esta nadando
        this.animations.play('swim'+dir);
    else if(this._hurt)
        this.animations.play('hurting'+dir);
    else if(this.body.onFloor()) //animaciones cuando esta en el suelo
    {
        this._bombJump = false;
        if(this._crouching)
            this.animations.play('crouch'+dir);
        else if(this._moving)
            this.animations.play('run'+dir);
        else
            this.animations.play('idle'+dir);
    }
    else //animaciones cuando esta en el aire
    {
        if(this._bombJump)
            this.animations.play('bomb'+dir);
        else if(this._tackling)
            this.animations.play('tackle'+dir);
        else
            this.animations.play('jump'+dir);
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
            this.MarioAnims('Right');
        }
        else //animaciones Izquierda
        {
            this.MarioAnims('Left');
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
