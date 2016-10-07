//Oggetto che contiene tutto ci� che � solido
function SolidList(){
	this.lista=[];

	//restituisce il numero di solidi inseriti
	// this.lunghezza=function(){
	// 	return this.lista.length;
	// };

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
				context.fillRect(canPos.x,canPos.y,this.lista[I].width,this.lista[I].height);
				flag=true;
			}else{
				//context.drawImage(this.lista[I].img,0,0,this.lista[I].width,this.lista[I].height,this.lista[I].x,this.lista[I].y,this.lista[I].width,this.lista[I].height);
				canPos.x=this.lista[I].x - gMap.viewRect.x;
				canPos.y=this.lista[I].y - gMap.viewRect.y;
				context.fillRect(canPos.x,canPos.y,this.lista[I].width,this.lista[I].height);
			}
		}
		if(flag==false){
			giocatore.Draw(context);
		}
	};

	//aggiunge un solido
	this.addSolid=function(x,y,width,height,image){
		//BISOGNA CAMBIARE L'ID
		//Cerca un id valido, sicuramente ce ne sar� uno tra 0 e lista.lenght compresa
		var supportArray=new Array(this.lista.length+1); //vettore di supporto che avr� tutti 0 come elementi ed � lungo 1 pi� di array
 		//azzero tutti gli elementi dell'array di supporto
		for(var I=0;I<=supportArray.lenght;I++){
			supportArray[I]=0;
		}
		//lo riempio di uno nella posizione corrispondente
		// for(var I=0;I<this.lista.lenght;I++){
		// 	if(this.lista[I].id<supportArray.lenght){
		// 		supportArray[this.lista[I].id]=1;
		// 	}
		// }
		//DA CONTINUARE, NON L'HO FINITO

		this.lista[this.lista.length]=new Rectangle(x,y,width,height,image);
	};

	//elimina un solido datogli l'id, se lo elimina restituisce true, se non lo trova restituisce false
	this.deleteSolid=function(id){
		var I;
		for(I=0; I<this.lista.length; I++){
			if(lista[I].id==id){
				lista.splice(I,1);
				return true;
			}
		}
		return false;
	};


	//CONTROLLA SE COLLIDE CON QUALCHE OGGETTO NELLA DIREZIONE DESIDERATA NELLA LISTA,
	//SE S� RESTITUISCE TRUE, SE NO RESTITUISCE FALSE
	this.checkCollision=function(direzione,speed,rectPlayer){
		for (var I=0;I<this.lista.length;I++){
			switch(direzione){                    //0 basso,1 sinistra,2 destra, 3 alto)
				case 0:
					for(var I=0;I<this.lista.length;I++){
						//controlla se c'� un intersezione nell'asse delle x
						if(((rectPlayer.x < this.lista[I].x +this.lista[I].width) && ((rectPlayer.x+rectPlayer.width) > this.lista[I].x))){
							//Controlla se c'� un intersezione nell'asse dell y
							if(!((rectPlayer.y+speed > this.lista[I].y +this.lista[I].height) || ((rectPlayer.y+rectPlayer.height+speed) < this.lista[I].y))){
								return true;
							}
						}
					}
					return false;
					break;

				case 1:   //Sinistra
					for(var I=0;I<this.lista.length;I++){
						//controlla se c'� un intersezione nell'asse delle x
						if(((rectPlayer.x -speed < this.lista[I].x +this.lista[I].width) && ((rectPlayer.x+rectPlayer.width-speed) > this.lista[I].x))){
							//Controlla se c'� un intersezione nell'asse dell y
							if(!((rectPlayer.y > this.lista[I].y +this.lista[I].height) || ((rectPlayer.y+rectPlayer.height) < this.lista[I].y))){
								return true;
							}
						}
					}
					return false;
					break;

				case 2:  //Destra
					for(var I=0;I<this.lista.length;I++){
						//controlla se c'� un intersezione nell'asse delle x
						if(((rectPlayer.x +speed < this.lista[I].x +this.lista[I].width) && ((rectPlayer.x+rectPlayer.width+speed) > this.lista[I].x))){
							//Controlla se c'� un intersezione nell'asse dell y
							if(!((rectPlayer.y > this.lista[I].y +this.lista[I].height) || ((rectPlayer.y+rectPlayer.height) < this.lista[I].y))){
								return true;
							}
						}
					}
					return false;
					break;

				case 3:  //basso
					for(var I=0;I<this.lista.length;I++){
						//controlla se c'� un intersezione nell'asse delle x
						if(((rectPlayer.x < this.lista[I].x +this.lista[I].width) && ((rectPlayer.x+rectPlayer.width) > this.lista[I].x))){
							//Controlla se c'� un intersezione nell'asse dell y
							if(!((rectPlayer.y-speed > this.lista[I].y +this.lista[I].height) || ((rectPlayer.y+rectPlayer.height-speed) < this.lista[I].y))){
								return true;
							}
						}
					}
					return false;
					break;
			}
		}
	};
}
var solidi=new SolidList();
