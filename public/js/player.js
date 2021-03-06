Player = function(posX,posY,imgPath,commands)
{
	this.rect = new Rectangle(posX, posY, 32, 48);
	this.rect.color.r = 0;
	this.rect.color.g = 0;
	this.comandi = commands;
	this.animation = new Animation(32, 48, 0, 0, 4, imgPath, 8, 4, 4);

	this.moving = false;

	this.SetPosition = function(x, y, mod)
	{
		if (mod == null || !mod)
		{
			if (x != null)
				this.rect.x = x;
			if (y != null)
				this.rect.y = y;
		}
		else
		{
			if (x != null)
				this.rect.x += x;
			if (y != null)
				this.rect.y += y;
		}
	};

	this.Update = function()
	{
		this.moving = false;
		console.log(this.comandi);
		if (input[this.comandi.right] && !input[this.comandi.left])
		{	
			this.animation.SetRow(2);
			//Controlla se il giocatore stia collidendo con qualcosa a destra
			if(!(solidi.checkCollision(2,1,this.rect) || this.rect.x +this.rect.width > gMap.pixelSize.x)){
				//controlla se il giocatore stia collidendo con qualcosa a destra
				this.rect.x += 1;
				this.moving = true;
			}
		}
		
		if (input[this.comandi.left] && !input[this.comandi.rigth])
		{	
			this.animation.SetRow(1);
			//controlla se il giocatore stia collidendo con qualcosa a sinistra
			if(!(solidi.checkCollision(1,1,this.rect) || this.rect.x < 0)){
				this.rect.x -= 1;
				this.moving = true;
			}
		}
		if (input[this.comandi.up] && !input[this.comandi.down])
		{	
			this.animation.SetRow(3);
			//Controlla se il giocatore stia collidendo conn qualcosa in alto
			if(!(solidi.checkCollision(3,1,this.rect) || this.rect.y < 0 )){
				this.rect.y -= 1;
				this.moving = true;
			}
		}
		if (input[this.comandi.down] && !input[this.comandi.up])
		{
			//Controlla se il giocatore stia collidendo con qualcosa in basso
			this.animation.SetRow(0);
			if(!(solidi.checkCollision(0,1,this.rect) || this.rect.y + this.rect.height > gMap.pixelSize.y )){
				this.rect.y += 1;
				this.moving = true;
			}
		}

		this.animation.position.Set(this.rect.x, this.rect.y);
		gMap.centerAt(this.rect.x,this.rect.y,canvas.width,canvas.height);
		if (this.moving)
			this.animation.Update();
		else
			this.animation.SetColumn(0);
	};

	this.Draw = function(ctx)
	{
		this.animation.Draw(ctx);
	};
};
