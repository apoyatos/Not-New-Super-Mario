function Mario(game,x,y,name)
{
    this._x=x;
    this._y=y;
    this._life=3;
    this._velocity=1;
    this._jumpHeight=2;
    this._jumping=false;
    Phaser.Sprite.call(this,game,x,y,name);
    this.game.physics.arcade.enable(this);
}
Mario.prototype=Object.create(Phaser.Sprite.prototype);
Mario.constructor=Mario;
Mario.prototype.Move=function(dir)
{
    this.body.velocity.x=dir*200;
}
Mario.prototype.Jump=function()
{
    console.log(this.body.velocity.y) 
    if(!this._jumping )
    {    
        this.body.velocity.y=-200;
        this._jumping=true;
    }
    else if(this.body.velocity.y>=0)
         this._jumping=false;
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
Mario.prototype.update()
{
  
}
module.exports=Mario;
