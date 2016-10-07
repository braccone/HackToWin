// Questa parte serve per l'ottimizzazione dell'immagini
// invece di caricare ogni volta la mappa sul server la salva all'inizio sulla cache
// e riutilizza Questa
CanvasTile = function(){
	this.x = 0;
	this.y = 0;
	this.w = 100;
	this.h = 100;
	this.cvsHdl = null;
	this.ctx = null;

	//-------------------------------------
	this.create = function(width,height){
		this.x = -1;
		this.y = -1;
		this.w = width;
		this.h = height;
		var can2 = document.createElement('canvas');
		can2.width = width;
		can2.height = height;
		this.cvsHdl = can2;
		this.ctx = can2.getContext("2d");
	},

	this.isVisible = function(){
		var r2 = gMap.viewRect;
		var r1 = this;

		return gMap.intersectRect({
			top: r1.y,
			left: r1.x,
			bottom: r1.y + r1.h,
			right: r1.x + r1.w
		},
		{
			top: r2.y,
			left: r2.x,
			bottom: r2.y + r2.h,
			right: r2.x + r2.w
		});
	}
};


TILEDmap = function(){
	this.currMapData= null;
	this.tileSets= [];

	this.viewRect={
		"x":0,
		"y":0,
		"w":500,
		"h":500,
	};

	this.numXTiles=100;
	this.numYTIles=100;

	this.tileSize= {
		"x" : 32,
		"y" : 32
	};

	this.pixelSize= {
		"x" : 32,
		"y" : 32
	};

	this.imgLoadCount= 0;
	this.caricata = false;
	this.canvasTileSize={"x":4048,"y":4048}; //era 2048
	this.canvasTileArray = [];


	//Nuovo metodo, forse da cancellare
	this.aggiungiOggetto=function(imageObject,solid,indice)
	{
		oggetti.addObject(solid[indice].x,(solid[indice].y-solid[indice].height),imageObject);
	},
	//----------------------------------->


	//------------------------------
	this.load = function(){

		$.get( "/map", function( data ) {
			$(document).load(gMap.parseMapJSON(data.mappa));
		});
	},

	//------------------------------
	this.parseMapJSON= function(mapJSON){
		this.currMapData = JSON.parse(mapJSON);
		var map = this.currMapData;
		this.numXTiles = map.width;
		this.numYTiles = map.height;
		this.tileSize.x = map.tilewidth;
		this.tileSize.y = map.tileheight;
		this.pixelSize.x = this.numXTiles * this.tileSize.x;
		this.pixelSize.y = this.numYTiles * this.tileSize.y;

		//Carica i nostri tileset se siamo client
		var gMap = this;

		for(var i =0; i<map.tilesets.length; i++){

			var img = new Image();
			img.onload = function(){
				gMap.imgLoadCount++;
				if(gMap.imgLoadCount === gMap.tileSets.length){
					gMap.preDrawCache();
				}
			};
			// c'è da modificare con il percorso giusto
			img.src = "../img/" + map.tilesets[i].image.replace(/^.*[\\\/]/,'');
			//console.log(img.src);
			var ts = {
				"firstgid": map.tilesets[i].firstgid,
				"image": img,
				"imageheight": map.tilesets[i].imageheight,
				"imagewidth": map.tilesets[i].imagewidth,
				"name": map.tilesets[i].name,
				"numXTiles": Math.floor(map.tilesets[i].imagewidth / this.tileSize.x),
				"numYTiles": Math.floor(map.tilesets[i].imageheight / this.tileSize.y)
			};

			this.tileSets.push(ts);
		}
	},

	//--------------------------------------
	this.getTilePacket= function(tileIndex){
		// Usage= getTIlePacket(167) should return the pkt object which
		// contains the atlas image and x,y index for the tile
		var pkt = {
			"img": null,
			"px": 0,
			"py": 0
		};

		var i = 0;
		for(i=this.tileSets.length-1;i>=0;i--){
			if(this.tileSets[i].firstgid <= tileIndex) break;
		}

		pkt.img = this.tileSets[i].image;
		var localIdx = tileIndex - this.tileSets[i].firstgid;
		var lTileX = Math.floor(localIdx % this.tileSets[i].numXTiles);
		var lTileY = Math.floor(localIdx / this.tileSets[i].numXTiles);
		pkt.px = (lTileX * this.tileSize.x);
		pkt.py = (lTileY * this.tileSize.y);
		//console.log("pkt.px="+ pkt.px);
		//console.log("pkt.py="+ pkt.py);
		return pkt;
	},

	//------------------------------------------
	this.intersectRect = function(r1, r2){
		return !(r2.left > r1.right || r2.right < r1.left ||
						 r2.top > r1.bottom || r2.bottom < r1.top);
	},

	//-------------------------------------------
	this.centerAt = function(x,y,canvas_width,canvas_height){
		gMap.viewRect.w = canvas_width;
		gMap.viewRect.h = canvas_height;

		if(x - (canvas_width/2)<=0){
			//console.log("so arrivato alla fine sinistra");
			gMap.viewRect.x = 0;
		}
		else if(x - (canvas_width/2)>0){
			//console.log("so arrivato alla fine sinistra sull'else");
			gMap.viewRect.x = x - (canvas_width/2);
		}
		if(y - (canvas_height/2)<=0){
			//console.log("so arrivato alla fine alto");
			gMap.viewRect.y = 0;
		}
		else if(y - (canvas_height/2)>0){
			gMap.viewRect.y = y - (canvas_height / 2);
		}
		//Controlla se il rettangolo arriva alla fine della mappa
		if(x + (canvas_width/2)>gMap.pixelSize.x){
			gMap.viewRect.x = gMap.pixelSize.x - gMap.viewRect.w;
		}
		if(gMap.viewRect.y+gMap.viewRect.h>gMap.pixelSize.y){
			gMap.viewRect.y = gMap.pixelSize.y - gMap.viewRect.h;
		}
	},

	//--------------------------------------------------
	this.draw = function(ctx){
		if(!this.caricata) return;
		var flag=false;
		// vedere se il nostro viewRect collide con questo canvas

		for(var q = 0; q < this.canvasTileArray.length; q++){
			var r1 = this.canvasTileArray[q];
			if(r1.isVisible()){
				ctx.drawImage(r1.cvsHdl, r1.x - this.viewRect.x, r1.y - this.viewRect.y);
 			}
		}
	},

	//-----------------------------------------------------------------
	this.preDrawCache = function(){
		var xCanvasCount = 1 + Math.floor(this.pixelSize.x / this.canvasTileSize.x);
		var yCanvasCount = 1 + Math.floor(this.pixelSize.y / this.canvasTileSize.y);
		//console.log("sono entrato :"+ xCanvasCount);
		for(var yC = 0; yC < yCanvasCount; yC++){
			for(var xC = 0; xC < xCanvasCount; xC++){
				var k = new CanvasTile();
				k.create(this.canvasTileSize.x, this.canvasTileSize.y);
				k.x = xC * this.canvasTileSize.x;
				k.y = yC * this.canvasTileSize.y;
				this.canvasTileArray.push(k);
				this.fillCanvasTile(k);
			}
		}
		gMap.caricata = true;
	},


	//-----------------------------------------------------------------------
	this.fillCanvasTile = function(ctile){
		var ctx = ctile.ctx;
		ctx.fillRect(0,0,ctile.w,ctile.h);
		var vRect = {
			top: ctile.y,
			left: ctile.x,
			bottom: ctile.y + ctile.h,
			right: ctile.x + ctile.w
		};
		//prova------------------------------------

		// var flag=false; //Flag appena aggiunto 1/6/2016
		//prova ------------------ 03/06/2016
		for(var layerIdx = 0; layerIdx < this.currMapData.layers.length;layerIdx++)
		{
			if(this.currMapData.layers[layerIdx].type != "objectgroup") continue;
			var solido = this.currMapData.layers[layerIdx].objects;
			for(var objIdx=0; objIdx < solido.length; objIdx++)
			{
				// Serve per vedere se l'oggetto ha un Immagine
				// se ce l'ha vuol dire che non è solido
				if(solido[objIdx].gid == null){
					solidi.addSolid(solido[objIdx].x,solido[objIdx].y,solido[objIdx].width,solido[objIdx].height);
				}
				else
				{
					for(var imgIdx=0; imgIdx < this.currMapData.tilesets.length; imgIdx++)
					{
						if(this.currMapData.tilesets[imgIdx].firstgid <= solido[objIdx].gid && solido[objIdx].gid<this.currMapData.tilesets[imgIdx].firstgid+this.currMapData.tilesets[imgIdx].tilecount )
						{

							var imageObj ={
								img: new Image(),  //imgSrc:"",
								w:0,
								h:0,
								px:0,
								py:0
							};

							imageObj.img.onload=this.aggiungiOggetto(imageObj,solido,objIdx);
							imageObj.img.src = "./img/" + this.currMapData.tilesets[imgIdx].name +".png";

							imageObj.w = solido[objIdx].width;
							imageObj.h = solido[objIdx].height;
							imageObj.px =Math.floor(((solido[objIdx].gid -this.currMapData.tilesets[imgIdx].firstgid)%this.currMapData.tilesets[imgIdx].columns) * this.currMapData.tilesets[imgIdx].tilewidth);
							imageObj.py = Math.floor(((solido[objIdx].gid -this.currMapData.tilesets[imgIdx].firstgid)/this.currMapData.tilesets[imgIdx].columns) * this.currMapData.tilesets[imgIdx].tileheight);
							//oggetti.lista[oggetti.lista.length]=new Rectangle(solido[objIdx].x,(solido[objIdx].y-solido[objIdx].height),imageObj.w,imageObj.h,imageObj);

						}
					}

				}

			}

		}
		//prova ----------------- 03/06/2016

		for(var layerIdx = 0; layerIdx < this.currMapData.layers.length;layerIdx++){
			if(this.currMapData.layers[layerIdx].type != "tilelayer") continue;

			var dat = this.currMapData.layers[layerIdx].data;
			//console.log(dat);
			//find what the tileIndexOffser is for this layer

			for(var tileIDX =0; tileIDX < dat.length; tileIDX++){
				var tID = dat[tileIDX];
				if(tID === 0) continue;

				var tPKT = this.getTilePacket(tID);

				//Test is this tile is within our world bounds
				var worldX = Math.floor(tileIDX % this.numXTiles) * this.tileSize.x;
				var worldY = Math.floor(tileIDX / this.numXTiles) * this.tileSize.y;
				// player.Draw(ctx);
				var visible = this.intersectRect(vRect,{
					top: worldY,
					left: worldX,
					bottom: worldY + this.tileSize.y,
					rigth: worldX + this.tileSize.x
				});
				if(!visible) continue;

				worldX -= vRect.left;
				worldY -= vRect.top;
				ctx.drawImage(tPKT.img, tPKT.px, tPKT.py, this.tileSize.x,this.tileSize.y,
					worldX,worldY,this.tileSize.x,this.tileSize.y);

			}
		}
		//player.Draw(ctx);
	}
};
var gMap = new TILEDmap();
