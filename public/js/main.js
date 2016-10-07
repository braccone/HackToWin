var canvas = document.getElementById("gioco");
var ctx	= canvas.getContext('2d');
//canvas.width		= document.body.clientWidth;
//canvas.height		= document.body.clientHeight;
canvas.width = 700;
canvas.height = 500;
canvas.style = " border: 1px solid #000";
input.offset = new Vector2(GetLeft(canvas), GetTop(canvas));

var player = new Player();
var color = new Color(0, 0, 0, 1);
//var solid = new Rectangle(400,400,30,30,color);

//aggiungo qualche solido
// solidi.addSolid(500,500,40,40);
// solidi.addSolid(0,0,40,40);
// solidi.addSolid(700,200,300,300);
// solidi.addSolid(3000,500,120,20);


var Update = setInterval(function()
{
	var collided = false;
	var precedente = new Vector2(player.rect.x,player.rect.y);

	player.Update();

}, 1);

(function(){
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	window.requestAnimationFrame = requestAnimationFrame;
})();
var requestId = 0;

function Draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);

//solid.Draw(ctx);
	//solidi.stampaSolidi(ctx);

	gMap.draw(ctx);
	//player.Draw(ctx);
	//solidi.stampaSolidi(ctx);
	//solidi.Draw(ctx,player);
	oggetti.Draw(ctx,player);
	requestId = window.requestAnimationFrame(Draw);

}

function Start()
{
	gMap.load();
	requestId = window.requestAnimationFrame(Draw);
}

function Stop()
{
	if (requestId)
		window.cancelAnimationFrame(requestId);

	requestId = 0;
}

Start();
