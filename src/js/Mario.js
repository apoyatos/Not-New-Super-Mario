'use strict';
var Cappy= require('./Cappy.js');

function Mario(game,x,y,name,cappyName)
{
    this.cappy=null;
    this.cappyName=cappyName;
    this._cappyTime=50;
    this._cappyTimer=0;

    this._life=3;

    this._velocity=200;
    this._facing=1;//1 derecha, -1 izquierda

    this._jumpVelocity=400;
    this._tackles=0;

    this._bombJump=false;
    this._tackling=false;
    this._swimming=false;
    this._crouching=false;
    this._moving=false;
    this._thrown=false;
    this._cappyStopped=false;

    Phaser.Sprite.call(this,game,x,y,name);
    this.scale.setTo(2,2);
    this.game.world.addChild(this);

    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
  

    this.frame=5;
    this.animations.add('runLeft',[4,3,2],8,true);
    this.animations.add('runRight',[5,6,7],8,true);
    this.animations.add('jumpLeft',[1],10,false);
    this.animations.add('jumpRight',[8],10,false);
    this.animations.add('idleLeft',[4],10,false);
    this.animations.add('idleRight',[5],10,false);
    this.animations.add('crouchLeft',[0],10,false);
    this.animations.add('crouchRight',[9],10,false);
    this.animations.add('tackleLeft',[32],10,false);
    this.animations.add('tackleRight',[37],10,false);
    this.animations.add('swimLeft',[33,32,31],8,true);
    this.animations.add('swimRight',[36,37,38],8,true);
    this.animations.add('bombLeft',[12],10,false);
    this.animations.add('bombRight',[17],10,false);
}
Mario.prototype=Object.create(Phaser.Sprite.prototype);
Mario.constructor=Mario;

Mario.prototype.Move=function(dir)
{
    this._facing=dir;
    if(!this._bombJump)//en el salto bomba no hay movimiento
    {
        this._moving=true;
        if(!this._crouching)//si no esta agachado se mueve normal
            this.body.velocity.x=this._facing*this._velocity;
        else//si esta agachado la velocidd es n tercio de la original
            this.body.velocity.x=this._facing*(this._velocity/3);
    }
    this.handleAnimations();
}
Mario.prototype.NotMoving=function()
{
    this.body.velocity.x=0;    
    this._moving=false;
    this.handleAnimations();
}

Mario.prototype.Jump=function()
{
    if(this.body.onFloor()&&!this._crouching)//si esta en el suelo y no esta agachado puede saltar
    {   
        this._swimming=false;
        this.game.physics.arcade.gravity.y=400;

        this._tackling=false;
        this._tackles=1;
        this.body.velocity.y=-this._jumpVelocity;

        this.handleAnimations();            
    }
}
Mario.prototype.Tackle=function()
{
    if(!this.body.onFloor()&&this._tackles>0)
    {    
        this.body.velocity.y=-this._jumpVelocity/2;
        this.body.velocity.x=this._facing*(this._velocity/2);

        this._tackles--;
        this._tackling=true;

        this.handleAnimations();
    }
}

Mario.prototype.Crouch=function()
{
    if(!this._swimming)//solo puede agacharse o hacer salto bomba si no esta nadando
    {
        if(this.body.onFloor())
        {
            this._crouching=true;
        }
        else
        {
            this.body.velocity.y=600;
            this.body.velocity.x=0;
            this._tackles=0;
            this._bombJump=true;  
        }

        this.handleAnimations();
    }
}
Mario.prototype.NotCrouching=function()
{
    this._crouching=false;
}

Mario.prototype.Swim=function()
{
    this._swimming=true;
    this.game.physics.arcade.gravity.y=600;

    if(this.body.velocity.y>= 0)
    {     
        this.body.velocity.y=-200;
    } 

    this.handleAnimations();
}

Mario.prototype.ThrowCappy=function()
{
    if(!this._thrown)
    {
        this.cappy=new Cappy(this.game,this.body.x+45,this.body.y,this.cappyName,this._facing);
        this.cappy.Throw();
        this._thrown=true;
    }
}
Mario.prototype.CheckCappy=function()
{
    if(this._thrown&&!this._cappyStopped)
    {
        if(this._cappyTimer<this._cappyTime)
            this._cappyTimer++;
        else
        {
            this.cappy.Stop();
            this._cappyStopped=true;            
        }
    }
    else if(this._cappyStopped)
    this.game.physics.arcade.moveToObject(this.cappy,this,500);
}
Mario.prototype.CappyCollision=function()
{
    if(this.game.physics.arcade.overlap(this.cappy,this) && this._cappyStopped)
    {        
        this._cappyStopped=false;
        this._thrown=false;
        this._cappyTimer=0;
        this.cappy.kill();
    }
}
    


Mario.prototype.Die=function()
{
    console.log("Muerto");
}

Mario.prototype.Hurt=function()
{
    if(this._life>1)
    this._life--;
    else
    Mario.Muerto();
}

Mario.prototype.handleAnimations=function()
{
    if(this._facing==1)//animaciones Derecha
    {
        if(this._swimming)//Animaciones cuando esta nadando
            this.animations.play('swimRight');
        else if(this.body.onFloor())//Animaciones cuando esta en el suelo
        {
            this._bombJump=false;
            if(this._crouching)
                this.animations.play('crouchRight');
            else if(this._moving)
                this.animations.play('runRight');
            else
                this.animations.play('idleRight');
        }
        else //Animaciones cuando esta en el aire
        {
            if(this._bombJump)
                this.animations.play('bombRight');
            else if(this._tackling)
                this.animations.play('tackleRight');
            else
                this.animations.play('jumpRight');
        }
    }
    else//Animaciones Izquierda
    {
        if(this._swimming)
            this.animations.play('swimLeft');
        else if(this.body.onFloor())
        {
            this._bombJump=false;
            if(this._crouching)
                this.animations.play('crouchLeft');
            else if(this._moving)
                this.animations.play('runLeft');
            else
                this.animations.play('idleLeft');
        }
        else
        {
            if(this._bombJump)
                this.animations.play('bombLeft');  
            else if(this._tackling)
                this.animations.play('tackleLeft');
            else
                this.animations.play('jumpLeft');
                
        }
    }
}
module.exports=Mario;
