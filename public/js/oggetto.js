// Classe utilizzata per visualizzare l'ordine corretto degli oggetti visibili
//Oggetto che contiene tutto ci� che � solido
function Oggetto(){
	this.lista=[];

	//ordina gli oggetti, i primi saranno quelli che avranno la base pi� in alto
	//cos� da venire stampatii prima degli altri
	this.sortByY=function(){
		this.lista.sort(function(a,b)
		{
			return (a.y+a.height)-(b.y+b.height)
		});
	};

	//Stampa tutti i solidi nella lista ed il giocatore
	this.Draw=function(context,giocatore){
		var canPos={x:0, y:0};
		var flag=false; //serve per vedere se il giocatore sia gi� stato stampato
		//giocatore.Draw(context);
		for(var I=0;I<this.lista.length;I++){
			if(this.lista[I].y>giocatore.rect.y && !flag){
				giocatore.Draw(context);
				canPos.x=this.lista[I].x - gMap.viewRect.x;
				canPos.y=this.lista[I].y - gMap.viewRect.y;
				ctx.drawImage(this.lista[I].image.img,this.lista[I].image.px,this.lista[I].image.py,this.lista[I].image.w,this.lista[I].image.h,canPos.x,canPos.y,this.lista[I].image.w,this.lista[I].image.h);
				flag=true;
			}else{
				canPos.x=this.lista[I].x - gMap.viewRect.x;
				canPos.y=this.lista[I].y - gMap.viewRect.y;
				ctx.drawImage(this.lista[I].image.img,this.lista[I].image.px,this.lista[I].image.py,this.lista[I].image.w,this.lista[I].image.h,canPos.x,canPos.y,this.lista[I].image.w,this.lista[I].image.h);
			}
		}
		if(flag==false){
			giocatore.Draw(context);
		}
	};

	//aggiunge un oggetto non solido
	this.addObject=function(x,y,image){
		this.lista[this.lista.length]=new Rectangle(x,y,image.w,image.h,image);
		this.sortByY();
	};

}
var oggetti=new Oggetto();
