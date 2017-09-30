// ENEMIES:

function Asteroid (_posn, _velo, _size) {

	var posn = (_posn) ? _posn :
		{

			'x': (GAME) ? Math.round(Math.random()*GAME.size.x) : 0, 
			'y': (GAME) ? Math.round(Math.random()*GAME.size.y) : 0 

		},
		velo = (_velo) ? _velo :
		{

			'x': (GAME) ? Math.random()*(0.9+GAME.level/10) : 0, 
			'y': (GAME) ? Math.random()*(0.9+GAME.level/10) : 0, 
			'theta': (0.5-Math.random()) * 0.25 

		},
		lvl = (GAME) ? GAME.level : 0,
		size = _size || 35 + 5*(Math.random()*8 + lvl/4);

	GameObject.call(this, '#ddd', size, posn, velo, 0, false);

	this.sides = 4 + Math.ceil(Math.random() * (2 + this.size / 30));
	this.points = [];

	var pointangles = [];

	for (var i = 0; i < this.sides; i++) {

		pointangles.push(Math.random()*Math.PI/this.sides + i*Math.PI/this.sides*2);

	}

	for (var i = 0; i < this.sides; i++) {

		var r = this.size/3 + (2*Math.random()*this.size/3),
			P = {'x': r * Math.cos(pointangles[i]), 'y': r * Math.sin(pointangles[i]) };

		this.points[i] = P;

	}

	this.FindCOMass = function () {

		// http://www.members.shaw.ca/FLYAWAYTOO/math/centroid/centroid.html

		var p0 = this.points[0],
			n = this.points.length,
			centroids = [],
			totalArea = 0,
			totalCenter = {'x': 0, 'y': 0};

		for (var i = 1; i <= n - 2; i++) {

			var p1 = this.points[i],
				p2 = this.points[i + 1],
				center = {'x': (p0.x + p1.x + p2.x)/3, 'y': (p0.y + p1.y + p2.y)/3},
				area = (((p1.x - p0.x) * (p2.y - p0.y)) - ((p2.x - p0.x) * (p1.y - p0.y)))/2;

			centroids.push({'area': area, 'center': center});

			totalArea += area;

		}

		for (var i in centroids) {

			var C = centroids[i],
				fraction = C.area / totalArea;

			totalCenter.x += C.center.x * fraction;
			totalCenter.y += C.center.y * fraction;

		}

		var maxSize = 0;

		for (var i in this.points) {

			var P = this.points[i];

			P.x -= totalCenter.x;
			P.y -= totalCenter.y;

			if ((P.x * P.x) + (P.y * P.y) > maxSize) maxSize = (P.x * P.x) + (P.y * P.y);

		}

		//if (maxSize * maxSize > this.size * this.size) 
		this.size = Math.sqrt(maxSize);

	}

	// call on construction:
	this.FindCOMass();

	this.Update = function (_bounds) {

		Asteroid.prototype.Update.call(this, _bounds);

	}

	this.Destroy = function () {

		if (this.size >= 30 && this.active) {

			var posn = this.posn,
				velo = this.velo;

			for (var i = 0; i < 3 + Math.round(Math.random() * 3); i++) {

				var xshift = Math.random()-0.5,
					yshift = Math.random()-0.5;

				GAME.enemies.push(

					new Asteroid(
						{
							'x':posn.x + (this.size * xshift), 
							'y':posn.y + (this.size * yshift) 
						}, {

							'x': velo.x + xshift*2, 
							'y': velo.y + yshift*2, 
							'theta': (xshift*yshift*2) * 0.25 

						}, 
						this.size/4 + Math.floor(Math.random()*this.size/3)
					)

				);

			}

		}

		Asteroid.prototype.Destroy.call(this);

	}

	this.CustomDraw = function (ctx, ptrn) {

		this.color = ptrn;

		Asteroid.prototype.BasicDraw.call(this, ctx);

	}

}
Asteroid.prototype = new GameObject();

function SpaceJunk (_posn, _velo, _size) {

	Asteroid.call(this, _posn, _velo, _size);

	this.health = this.size * 4;

	this.Destroy = function () {

		if (this.size >= 30 && this.active) {

			var posn = this.posn,
				velo = this.velo;

			for (var i = 0; i < 3 + Math.round(Math.random() * 3); i++) {

				var xshift = Math.random()-0.5,
					yshift = Math.random()-0.5;

				GAME.enemies.push(

					new SpaceJunk(
						{
							'x':posn.x + (this.size * xshift), 
							'y':posn.y + (this.size * yshift) 
						}, {

							'x': velo.x + xshift*2, 
							'y': velo.y + yshift*2, 
							'theta': (xshift*yshift*2) * 0.25 

						}, 
						this.size/4 + Math.floor(Math.random()*this.size/3)
					)

				);

			}

		}

		Asteroid.prototype.Destroy.call(this);

	}

}
SpaceJunk.prototype = new Asteroid();

function EnemyFighter (_ship, _posn, _velo) {

	var posn = (_posn) ? {'x': _posn.x, 'y': _posn.y} :
				{'x': Math.round(Math.random()*GAME.size.x), 'y': Math.round(Math.random()*GAME.size.y) },
		velo = (_velo) ? {'x': _velo.x, 'y': _velo.y, 'theta': _velo.theta} : {'x': 0, 'y': 0, 'theta': 0 },
		ship = ship = _ship || SHIPS['scout'];

	GameObject.call(this, '#f30', ship.size, posn, velo, 0, Math.random()*Math.PI*2);

	this.ship = ship;

	this.accel = ship.accel;

	this.points = this.ship.points;

	this.sprite = {'x': this.ship.sprite.x, 'y': 4 };

	this.Update = function (_bounds) {

		var target = GAME.player,
			t = {'x': target.posn.x, 'y': target.posn.y },
			d = {'x': t.x - this.posn.x, 'y': t.y - this.posn.y },
			theta = Math.atan(d.y/d.x) - Math.PI/2;

		if (d.x < 0) theta += Math.PI;

		if (this.velo.theta * this.velo.theta < 0.25) {

			if (this.theta > theta) {

				this.velo.theta -= this.accel/100;

			} else {

				this.velo.theta += this.accel/100;

			}

		}

		//if ((this.velo.x * this.velo.x) + (this.velo.y * this.velo.y) < 5) {

			this.velo.x += -this.accel * Math.sin(this.theta);
			this.velo.y += this.accel * Math.cos(this.theta);

		//}

		EnemyFighter.prototype.Update.call(this, _bounds);

	}

	this.CustomDraw = function (ctx, _sprite) {

		//EnemyFighter.prototype.BasicDraw.call(this, ctx);

		ctx.drawImage(_sprite, this.sprite.x * 64, this.sprite.y * 64, 64, 64, -32, -32, 64, 64);

	}

}
EnemyFighter.prototype = new GameObject();
