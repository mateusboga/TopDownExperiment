	
	/*
		-----------------
		Global Variables
		-----------------
	*/
	
	var canvas = document.getElementById('mainc');
	var C = {width:canvas.width,height:canvas.height,fps:33}; C.centerX = C.width/2; C.centerY = C.height/2;
	var mouse = {x:0,y:0}, player = {x:600,y:50,velx:0,vely:0,speed:5,rot:0,laser:false,fire:0,trigger:3,recoil:2,ammo:150,health:100,hit:15,alive:true, cooldown: 0}, move = {a:false,w:false,s:false,d:false};
	var ctx = canvas.getContext("2d"); var mousepress = false; var HOpaque = 0.0; var Stealth = 0; var Supress = 50;
	var GameObjects = [];
	var LC = {};
	
	var shotsourcefile = "sounds/shot.wav";
	var spr_player = new Image();
	spr_player.src = "sprites/armguard1.png";
	var spr_muzzle = new Image();
	spr_muzzle.src = "sprites/flash.png";
	var spr_flash = new Image();
	spr_flash.src = "sprites/flashhalo.png";
	var spr_expl1 = new Image(), spr_expl2 = new Image(), spr_expl3 = new Image(), spr_expl4 = new Image();
	spr_expl1.src = "sprites/explosion1.png",spr_expl2.src = "sprites/explosion2.png",spr_expl3.src = "sprites/explosion3.png",spr_expl4.src = "sprites/explosion4.png";
	var robotsprite = new Image(); robotsprite.src = "sprites/robot1.png"; var barrelsprite = new Image(); barrelsprite.src="sprites/barrel.png";
	var spr_spark1 = new Image(); spr_spark1.src="sprites/spark1.png"; var spr_spark2 = new Image(); spr_spark2.src="sprites/spark2.png"; var spr_spark3 = new Image(); spr_spark3.src="sprites/spark3.png";
	
	var riflesprite = "sprites/armguard1.png", cannonsprite = "sprites/armguardcanon.png", shotgunsprite = "sprites/armguardbarrel.png",silencesprite = "sprites/armguardsilence.png"
	var s_ricochet1 = "sounds/ricochet1.wav", s_ricochet2 = "sounds/ricochet2.wav", s_ricochet3 = "sounds/ricochet3.wav", s_ricochet4 = "sounds/ricochet4.wav";
	var s_hit1 = "sounds/hit1.wav", s_hit2 = "sounds/hit2.wav", s_hit3 = "sounds/hit3.wav", s_hit4 = "sounds/hit4.wav", s_hit5 = "sounds/hit5.wav";
	var s_explode = "sounds/explosion.wav";
	var s_empty = "sounds/empty.wav";
	
	/*
		------
		Clock
		------
	*/
	
	setInterval(function() {
		LCenter = getCenter();
		draw();
		player.x += player.velx; if(player.velx > 0){ player.velx--}else if(player.velx < 0){ player.velx++};
		player.y += player.vely; if(player.vely > 0){ player.vely--}else if(player.vely < 0){ player.vely++};
		moving();
		if(player.velx < 1 && player.velx > -1){ player.velx = 0 }
		if(player.vely < 1 && player.vely > -1){ player.vely = 0 }
		if(player.fire > 0){player.fire--}; if( Stealth > 0.5 ){ Stealth-= 0.1 }else{ Stealth=0}; if( player.cooldown > 0 ){ player.cooldown-- };
	},1000/C.fps)
	
	/*
		---------------------
		Game Constructors
		---------------------
	*/
	
	function gameConstruct(){
		
		var Enemy1 = new Enemy("Robot1", "bot", robotsprite, 120, 250, 60, 60, 0.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 10, 5, true, 300);
		var Enemy2 = new Enemy("Robot2", "bot", robotsprite, 250, 300, 60, 60, 1.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 20, 10, true, 300);
		var Enemy3 = new Enemy("Robot3", "bot", robotsprite, 200, 350, 60, 60, 2.0, 0.03, 0.01, 0, 100, 0.0, 0.0, 0, 20, 10, true, 300);
		var Barrel = new G_Object("Barrel1", "explosive", barrelsprite, 500, 350, 40, 40, true, 20);
		GameObjects.push(Enemy1);GameObjects.push(Enemy2);GameObjects.push(Enemy3);GameObjects.push(Barrel);
	};gameConstruct();
	
	function Enemy(name, t, sprite, x, y, w, h, r, rv, rd, s, hp, ho, hito, fi, tri, dmg, d, range){
		return {name: name, type: t, spr: sprite, x: x, y: y, w: w, h: h, rot: r, rotv: rv, rotd: rd, speed: s, hp: hp, ho: ho, hito: hito, fire: fi, trigger: tri, dmg: dmg, alive: d, range: range}
	}
	function G_Object(name, t, sprite, x, y, w, h, destr, hp){
		return {name: name, type: t, sprite: sprite, x: x, y: y, w: w, h: h, candestroy: destr, hp: hp}
	}
	
	function getCenter(){
		_x = mouse.x/2+player.x/2; _y = mouse.y/2+(player.y)/2;
		return {x: _x, y: _y, x0: _x-C.width/2, y0: _y-C.height/2 }
	}
	
	/*
		---------------------
		Drawing the canvas
		---------------------
	*/
	
	function draw(){
		ctx.clearRect(0,0,C.width,C.height);
		drawObjects();
		drawplayer(player.x,player.y,player.rot);
		AI();
		drawGUI();
		drawcursor(mouse.x,mouse.y);
	}
	
	function drawcursor(x,y){
		ctx.fillStyle = "rgba(255,255,255,0.7)"
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i];
			if( mouse.x < obj.x+(obj.w/2) && mouse.x > obj.x-(obj.w/2) && mouse.y < obj.y+(obj.h/2) && mouse.y > obj.y-(obj.h/2)  ){
				if( obj.type == "bot" && obj.alive == true ){
					ctx.fillStyle = "rgba(255,0,0,0.7)";
					ctx.font = "bold 15px serif";
					ctx.fillText(""+obj.type,mouse.x+10,mouse.y+15);
				}
				if( player.fire == player.trigger ){
					drawspark(x,y);
				}
			}
		}
		ctx.fillRect(x-1,y-1,2,2);
		ctx.fillRect(x-10,y-1,6,2);
		ctx.fillRect(x+10,y-1,-6,2);
		ctx.fillRect(x-1,y-10,2,6);
		ctx.fillRect(x-1,y+10,2,-6);
		ctx.fillRect(LCenter.x-1,LCenter.y-1,2,2)
	}
	
	function drawspark(x,y){
		ctx.save();
		ctx.translate(x,y);
		ctx.rotate((Math.random()*3));
		ctx.translate(0, 0);
		_spr = Math.ceil(Math.random()*3);
		switch(_spr){
			case 1: sparksprite = spr_spark1; break;
			case 2: sparksprite = spr_spark2; break;
			case 3: sparksprite = spr_spark3; break;
		}
		ctx.drawImage(sparksprite,-60,-60,120,120)
		ctx.restore();
	}
	
	function drawGUI() {
		ctx.font = "bold 15px serif";
		ctx.fillStyle = "rgba(255,255,255,0.7)"; if (player.ammo < 20){ ctx.fillStyle = "rgba(255,255,0,0.7)"; if (player.ammo < 10){ ctx.fillStyle = "rgba(255,50,0,0.8)"; } }
		ctx.fillText(""+player.ammo,mouse.x+10,mouse.y-10)
	}
	
	function drawObjects(){
		//ctx.fillRect(200,200,200,200)
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i];
			if (obj.type == "explosive"){
				ctx.save();
				ctx.translate(obj.x,obj.y);
				ctx.translate(0, 0);
				ctx.shadowColor = 'rgba(0,0,0,0.5)';
				ctx.shadowBlur = 20;
				ctx.shadowOffsetX = (obj.x - C.centerX)/15;
				ctx.shadowOffsetY = (obj.y - C.centerY)/15;
				ctx.drawImage(barrelsprite,0-obj.w/2,0-obj.h/2,obj.w,obj.h)
				ctx.shadowColor = 'rgba(0,0,0,0)';
				ctx.restore();
			}
			if (obj.type == "bot"){
				var laser = ctx.createLinearGradient(0,0,500,0); laser.addColorStop(0,"rgba(255,20,0,0.4)"); laser.addColorStop(1,"rgba(255,20,0,0)");
				ctx.save();
				ctx.translate(obj.x,obj.y);
				ctx.rotate(obj.rot);
				ctx.fillStyle = "#ff0000"
				ctx.translate(0, 0);
				ctx.shadowColor = 'rgba(0,0,0,0.5)';
				ctx.shadowBlur = 20;
				ctx.shadowOffsetX = (obj.x - C.centerX)/15;
				ctx.shadowOffsetY = (obj.y - C.centerY)/15;
				ctx.drawImage(obj.spr,0-obj.w/2,0-obj.h/2,obj.w,obj.h)
				ctx.shadowColor = 'rgba(0,0,0,0)';
				if ( obj.alive == true ){
					ctx.fillStyle = laser
					ctx.fillRect(10,-2,3000,1);}
				
				if(obj.fire == obj.trigger){
					ctx.strokeStyle = "#fff8a6";
					ctx.drawImage(spr_flash,-50,-100,200,200)
					ctx.shadowColor = 'rgba(250,200,100,1)';
					ctx.shadowBlur = 25;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2;
					ctx.stroke();
					ctx.drawImage(spr_muzzle,20,-20,60,40)
					ctx.shadowColor = 'rgba(0,0,0,0)';
				}
				
				if( obj.expl ){
					switch(obj.expl){
						case 1: ctx.drawImage(spr_expl1,-60,-60,120,120); break;
						case 2: ctx.drawImage(spr_expl2,-60,-60,120,120); break;
						case 3: ctx.drawImage(spr_expl3,-60,-60,120,120); break;
						case 4: ctx.drawImage(spr_expl4,-60,-60,120,120); break;
						 
					}obj.expl++;
				}
				
				ctx.beginPath();
				ctx.strokeStyle = "rgba(20,20,20,"+obj.ho+")";
				ctx.arc(0, 0, 34, Math.PI/2, Math.PI*1+Math.PI/2, false);
				ctx.lineWidth = 4;
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(0, 0, 34, Math.PI/2, Math.PI*(obj.hp/100)+Math.PI/2, false);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgba(255,0,0,"+obj.ho+")"; if( obj.hp < 1) { ctx.strokeStyle = "rgba(0,0,0,0)"; }
				ctx.stroke();
				/*ctx.beginPath();
				ctx.arc(0, 0, obj.range+obj.range*Stealth/10, Math.PI, Math.PI*4, false);
				ctx.lineWidth = 5;
				ctx.fillStyle = "rgba(0,200,200,0.01)"
				ctx.fill();*/
				
				if (obj.ho > 0.0) { obj.ho -= 0.005 }
				if(obj.fire > 0){obj.fire--}
				
				ctx.restore();
			}
		}
	}
	
	function drawplayer(x,y,r){
		var dx = mouse.x - player.x;
		var dy = mouse.y - player.y;
		var laser = ctx.createLinearGradient(0,0,500,0); laser.addColorStop(0,"rgba(255,20,0,0.4)"); laser.addColorStop(1,"rgba(255,20,0,0)");
		if(player.alive == true){player.rot = Math.atan2(dy, dx);}
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(r);
		ctx.fillStyle = "#34aaff"
		ctx.shadowColor = 'rgba(0,0,0,0.5)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = (player.x - C.centerX)/15;
		ctx.shadowOffsetY = (player.y - C.centerY)/15;
		ctx.drawImage(spr_player,-30,-20,60,40)
		ctx.shadowColor = 'rgba(0,0,0,0)';
		if(player.laser == true){
			ctx.fillStyle = laser
			ctx.fillRect(10,-2,3000,1);
		}
		if(player.fire == player.trigger){
			ctx.strokeStyle = "#fff8a6"; ctx.fillStyle = "#fff8a6"
			ctx.drawImage(spr_flash,-50,-100,200,200)
			ctx.shadowColor = 'rgba(250,200,100,1)';
			ctx.shadowBlur = 25;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget();
			if(shotsourcefile == "sounds/darkshot.wav"){ ctx.lineWidth = 6; } ctx.stroke();
			ctx.drawImage(spr_muzzle,20,-20,60,40)
			if(player.scatter > 0){
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
				ctx.rotate(Math.random()*(player.scatter/10)-(player.scatter/10)/2);
				ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(C.width*2, 0); ctx.lineWidth = 2; testforTarget(); ctx.stroke();
			}
			ctx.shadowColor = 'rgba(0,0,0,0)';
		}
		
		ctx.beginPath();
		ctx.strokeStyle = "rgba(20,20,20,"+HOpaque+")";
		ctx.arc(0, 0, 34, Math.PI/2, Math.PI*1+Math.PI/2, false);
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, 34, Math.PI/2, Math.PI*(player.health/100)+Math.PI/2, false);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255,0,0,"+HOpaque+")";if( player.alive == false ){ ctx.strokeStyle = "rgba(255,0,0,0)" }
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, 30, Math.PI/2, Math.PI*(Stealth/100)+Math.PI/2, false);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(100,255,255,0.2)";
		ctx.stroke();
		
		if (HOpaque > 0.0) { HOpaque -= 0.001 }
		
		ctx.translate(0, 0);
		ctx.restore();
	}
	
	/*
		------
		Guns
		------
	*/
	
	function equipRifle() {
		player.trigger=5;player.recoil=2;player.scatter=0;player.fire=0;player.hit=15;Supress = 30;
		spr_player.src = riflesprite;shotsourcefile = "sounds/shot.wav";
		s_equip = new Audio("sounds/equip2.wav"); s_equip.play();
	}
	function equipRifleSilence() {
		player.trigger=5;player.recoil=2;player.scatter=0;player.fire=0;player.hit=15;Supress = 5;
		spr_player.src = silencesprite;shotsourcefile = "sounds/shotsilenced.wav";
		s_equip = new Audio("sounds/equip2.wav"); s_equip.play();
	}
	function equipCanon() {
		player.trigger=50;player.recoil=5;player.scatter=0;player.fire=0;player.hit=40;Supress = 50;
		spr_player.src = cannonsprite;shotsourcefile = "sounds/darkshot.wav";
		s_equip = new Audio("sounds/equip3.wav"); s_equip.play();
	}
	function equipShotgun() {
		player.trigger=40;player.recoil=2;player.scatter=5;player.fire=0;player.hit=10;Supress = 50;
		spr_player.src = shotgunsprite;shotsourcefile = "sounds/barrel.wav";
		s_equip = new Audio("sounds/equip1.wav"); s_equip.play();
	}
	
	
	/*
		-------------------
		Events & Controls
		-------------------
	*/
	
	//Target detection
	function testforTarget(){
		target = getTarget();
	}
	function getTarget(){
		
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i]
			var dx = obj.x - player.x;
			var dy = obj.y - player.y;
			var dx1 = (obj.x-obj.w) - player.x;
			var dy1 = (obj.y-obj.h) - player.y;
			var dx2 = (obj.x+obj.w) - player.x;
			var dy2 = (obj.y+obj.h) - player.y;
			if( mouse.x < obj.x+(obj.w/2) && mouse.x > obj.x-(obj.w/2) && mouse.y < obj.y+(obj.h/2) && mouse.y > obj.y-(obj.h/2) ){
				sound = Math.floor(Math.random()*5)+1; s_hit = new Audio();
				switch (sound){
					case 1: s_hit.src = s_hit1; break;
					case 2: s_hit.src = s_hit2; break;
					case 3: s_hit.src = s_hit3; break;
					case 4: s_hit.src = s_hit4; break;
					case 5: s_hit.src = s_hit5; break;
				} s_hit.play();
			}
			if( obj.alive == true && mouse.x < obj.x+(obj.w/2) && mouse.x > obj.x-(obj.w/2) && mouse.y < obj.y+(obj.h/2) && mouse.y > obj.y-(obj.h/2)  ){
			//if( obj.alive == true && player.rot > Math.atan2(dx1, dy1) && player.rot < Math.atan2(dx2, dy2) ){
				obj.hp -= player.hit; obj.ho = 1.0;
				
				if( obj.hp < 1 ){
					var robotspritedead = new Image(); robotspritedead.src = "sprites/robot1dead.png"; s_explosion = new Audio(s_explode);
					s_explosion.play();
					obj.spr = robotspritedead;
					obj.alive = false
					obj.expl = 1;
				}
			}
			//if( obj.x <  )
		}
		
		//if (ctx.isPointInPath)
		//return { x: , y: , width: , height: }
	}
	
	function AI() {
		for(i = 0; i < GameObjects.length; i++){ obj = GameObjects[i]
			if( obj.type == "bot" && obj.alive == true ){
				if ( ( player.alive == true && player.x < obj.x+obj.range && player.x > obj.x-obj.range && player.y < obj.y+obj.range && player.y > obj.y-obj.range) || ( player.alive == true && Stealth > 0  && player.x < obj.x+obj.range+obj.range*Stealth/10 && player.x > obj.x-obj.range-obj.range*Stealth/10 && player.y < obj.y+obj.range+obj.range*Stealth/10 && player.y > obj.y-obj.range-obj.range*Stealth/10 ) ){
					var dx = player.x - obj.x;
					var dy = player.y - obj.y;
					var dx1 = player.x-20 - obj.x;
					var dy1 = player.y-20 - obj.y;
					var dx2 = player.x+20 - obj.x;
					var dy2 = player.y+20 - obj.y;
																	if( obj.rot > Math.atan2(dy, dx) ){
																		obj.rot-=obj.rotv
																	}else if( obj.rot+obj.rotv < Math.atan2(dy, dx) ){
																		obj.rot+=obj.rotv/2
																	}else if( obj.rot+=obj.rotv/2 > Math.atan2(dy, dx) ){obj.rot=Math.atan2(dy, dx)}
																	else if(obj.rot < Math.atan2(dy, dx) ){
																		obj.rot+=obj.rotv
																	}
					if( obj.fire < 1 ){
						var thisshot = new Audio("sounds/shot.wav");
						obj.hito = 0.2;
						obj.fire = obj.trigger; thisshot.play();
						if( obj.rot == Math.atan2(dy, dx) ){
							//Player was hit
							obj.hito = 0.5; sound = Math.floor(Math.random()*4)+1; s_ricochet = new Audio();
							switch (sound){
								case 1: s_ricochet.src = s_ricochet1; break;
								case 2: s_ricochet.src = s_ricochet2; break;
								case 3: s_ricochet.src = s_ricochet3; break;
								case 4: s_ricochet.src = s_ricochet4; break;
							} s_ricochet.play();
							player.health -= obj.dmg; HOpaque = 1.0;Stealth = 50;
						if( player.alive == true && player.x < obj.x+obj.range && player.x > obj.x-obj.range && player.y < obj.y+obj.range && player.y > obj.y-obj.range ){ Stealth = 50; }
							if (player.health < 1){
								player.alive = false;
								move = {a:false,w:false,s:false,d:false};
							}
						}
					}
				}else{
					obj.rot += obj.rotd;
					if( obj.rot > 4 || obj.rot < -4){
						obj.rotd = -obj.rotd;
					}
				}
				ctx.save();
				var dx = player.x - obj.x;
				var dy = player.y - obj.y;
				ctx.translate(player.x, player.y);
				r = Math.atan2(dy, dx);
				ctx.rotate(r);
				ctx.beginPath();
				ctx.arc(0, 0, 50, Math.PI/1.1, Math.PI/10+Math.PI, false);
				ctx.lineWidth = 10;
				ctx.strokeStyle = "rgba(255,0,0,"+obj.hito+")";
				ctx.stroke();
				ctx.translate(0, 0);
				ctx.restore();
				if( obj.hito > 0 ){ obj.hito -= 0.01 }
				
			}
		}
	}
	
	
	
	function getMousePos(canvas, evt) {
		//Update the mouse position
        var rekt = canvas.getBoundingClientRect();
        return {x: evt.clientX - rekt.left, y: evt.clientY - rekt.top}
      }

	canvas.addEventListener('mousemove', function(evt) {
		//When the mouse is moved
		mouse = getMousePos(canvas, evt);
	}, false);
	canvas.onmousedown = function(){
		mouseclick();
	};
	$('#mainc').on('mousedown mouseup', function mouseState(e) {
		if (e.type == "mousedown") {
			mousepress = true;
			mouseclick();
		}else{
			mousepress = false;
		}
	});
	
	window.onkeydown = function (e){
		key = e.keyCode ? e.keyCode : e.which;
		//console.log(key)
		if( player.alive == true )
		switch(key){
			case 65:
				move.a = true; break;
			case 68:
				move.d = true; break;
			case 87:
				move.w = true; break;
			case 83:
				move.s = true; break;
			case 82:
				if(player.laser == false){player.laser = true}else{player.laser = false}
			case 49:
				if( shotsourcefile != "sounds/shot.wav" && player.cooldown == 0 )
				equipRifle(); player.cooldown = 5;  break;
			case 50:
				if( shotsourcefile != "sounds/darkshot.wav" && player.cooldown == 0 )
				equipCanon(); player.cooldown = 5; break;
			case 51:
				if( shotsourcefile != "sounds/barrel.wav" && player.cooldown == 0 )
				equipShotgun(); player.cooldown = 5; break;
			case 52:
				if( shotsourcefile != "sounds/shotsilenced.wav" && player.cooldown == 0 )
				equipRifleSilence(); player.cooldown = 5; break;
		}
	}
	window.onkeyup = function (e){
		key = e.keyCode ? e.keyCode : e.which;
		switch(key){
			case 65:
				move.a = false; break;
			case 68:
				move.d = false; break;
			case 87:
				move.w = false; break;
			case 83:
				move.s = false; break;
		}
	}
	
	function moving(){
		if(move.a == true && move.d == false){
			player.velx = -player.speed;
		};
		if(move.d == true && move.a == false){
			player.velx = player.speed;
		};
		if(move.w == true && move.s == false){
			player.vely = -player.speed;
		};
		if(move.s == true && move.w == false){
			player.vely = player.speed;
		};
		if(move.a == true && move.w == true && move.d == false && move.s == false){
			player.velx = -player.speed/Math.sqrt(2);
			player.vely = -player.speed/Math.sqrt(2);
		};
		if(move.d == true && move.s == true && move.a == false && move.w == false){
			player.velx = player.speed/Math.sqrt(2);
			player.vely = player.speed/Math.sqrt(2);
		};
		if(move.w == true && move.d == true && move.a == false && move.s == false){
			player.velx = player.speed/Math.sqrt(2);
			player.vely = -player.speed/Math.sqrt(2);
		};
		if(move.s == true && move.a == true && move.w == false && move.d == false){
			player.velx = -player.speed/Math.sqrt(2);
			player.vely = player.speed/Math.sqrt(2);
		};
	}

	function mouseclick(){
		//When the mouse is clicked
			if( player.alive == true && player.fire < 1 && player.ammo > 0){
				x = mouse.x-player.x; y = mouse.y-player.y;
				player.fire = player.trigger
				if (  x > y*2 && x < -y*2  )   {player.vely = player.recoil;}  //top triangle
				else if (  x < y*2 && x > -y*2  )   {player.vely = -player.recoil;}  //bottom triangle
				if (  -y > x*2 && -y < -x*2  )   {player.velx = player.recoil;}  //left triangle
				else if(  -y < x*2 && -y > -x*2  )    {player.velx = -player.recoil;}  //right triangle
				
				var s_shot1 = new Audio(shotsourcefile);
				s_shot1.play();
				player.ammo--; if( Stealth < Supress ){ Stealth = Supress }
			}
			if( player.alive == true && player.fire < 1 && player.ammo == 0){
				var s_click = new Audio(s_empty);
				s_click.play();
			}
	};