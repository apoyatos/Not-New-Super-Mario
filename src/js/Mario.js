function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Mario(position,velocity,jumpHeight,life)
{
    this._position=position;
    this._life=life;
    this._velocity=velocity;
    this._jumpHeight=jumpHeight;
}

Mario.prototype.Move=function()
{
    this._position.x+=this._velocity;
}
Mario.prototype.Jump=function()
{
    this._position.y+=this._jumpHeight;
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
