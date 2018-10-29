function Cappy(game,x,y,name,dir)
{
    this._dir=dir;
    this._velocity=150;
    
    Phaser.Sprite.call(this,game,x,y,name);
    this.game.world.addChild(this);  
    this.scale.setTo(0.2,0.2);

    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.allowGravity=false;
}

Cappy.prototype=Object.create(Phaser.Sprite.prototype);
Cappy.constructor=Cappy;

Cappy.prototype.Throw=function()
{
    this.body.velocity.x=this._velocity*this._dir;
}

Cappy.prototype.Stop=function()
{
    this.body.velocity.x=0;
}
Cappy.prototype.Return=function()
{
    this.body.velocity.x=this._velocity*(this._dir*-1);
}

module.exports=Cappy;