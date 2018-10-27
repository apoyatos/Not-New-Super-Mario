function Mario(game,x,y,name)
{
    this._x=x;
    this._y=y;
    this._life=3;
    this._velocity=200;
    this._jumpHeight=400;
    this._crouching=false;
    this._bombJumps=1;
    this._facing=1;//1 derecha, -1 izquierda
    Phaser.Sprite.call(this,game,x,y,name);
    this.game.physics.arcade.enable(this);
}
Mario.prototype=Object.create(Phaser.Sprite.prototype);
Mario.constructor=Mario;

Mario.prototype.Move=function(dir)
{
    this._facing=dir;
    this.body.velocity.x=this._facing*this._velocity;
}
Mario.prototype.NotMoving=function()
{
    this.body.velocity.x=0;
}

Mario.prototype.Jump=function()
{
    this.game.physics.arcade.gravity.y=400;
    if(this.body.onFloor())
    {    
        this._bombJumps=1;
        this.body.velocity.y=-this._jumpHeight;
    }
}
Mario.prototype.BombJump=function()
{
    if(!this.body.onFloor()&&this._bombJumps>0)
    {    
        this.body.velocity.y=-this._jumpHeight/2;
        this.body.velocity.x=this._facing*(this._velocity/2);
        this._bombJumps--;
    }
}

Mario.prototype.Crouch=function()
{
    if(this.body.onFloor())
        this._crouching=true;
    else
    {
        this.body.velocity.y=600;
        this._bombJumps=0;
    }
}
Mario.prototype.NotCrouching=function()
{
    this._crouching=false;
}

Mario.prototype.Swim=function()
{
    this.game.physics.arcade.gravity.y=600;
    if(this.body.velocity.y>= 0)
    {     
        this.body.velocity.y=-200;
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

module.exports=Mario;
