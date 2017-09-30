// MAIN GameObject AND PLAYER

function GameObject (_color, _size, _posn, _velo, _accel, _heading) {

	this.color = _color || '#fec';
	this.size = _size || 5;

	this.health = this.size;

	this.points = [{'x':this.size, 'y': this.size},{'x': this.size, 'y': -this.size},
					{'x': -this.size, 'y': -this.size},{'x': -this.size, 'y': this.size}];

	this.posn = _posn || {'x': 250, 'y': 250 };
	this.velo = _velo || {'x':0, 'y': 0, 'theta': 0 };
	this.accel = _accel || 0.1;
	this.theta = _heading || 0;
	this.centers = [this.posn];

	this.thrust = {'f': false, 'b': false, 'l': false, 'r': false};

	this.age = 0;
	this.expTimer = 10;
	this.expTimerMax = this.expTimer;
	this.active = true;
	this.invinci = 0;
	this.beingDamaged = 0;

}

GameObject.prototype.Update = function (_bounds) {

	this.age++;

	if (this.active) {

		var adj = {'x': 0, 'y': 0},
			centers = [{'x': this.posn.x, 'y': this.posn.y }];

		if (this.invinci > 0) this.invinci--;

		if (this.posn.x >= _bounds.x - this.size) {

			adj.x = -_bounds.x;

		} else if (this.posn.x <= this.size) {

			adj.x = _bounds.x;

		}

		if (this.posn.y >= _bounds.y - this.size) {

			adj.y = -_bounds.y;

		} else if (this.posn.y <= this.size) {

			adj.y = _bounds.y;

		}

		if (adj.x !== 0) centers.push({'x': this.posn.x + adj.x, 'y': this.posn.y });
		if (adj.y !== 0) centers.push({'x': this.posn.x, 'y': this.posn.y + adj.y });
		if (adj.x !== 0 && adj.y !== 0) centers.push({'x': this.posn.x + adj.x, 'y': this.posn.y + adj.y });

		this.centers = centers;

		if (this.velo.theta) this.theta += this.velo.theta;

		if (this.posn.x > _bounds.x) {

			this.posn.x -= _bounds.x;

		} else if (this.posn.x < 0) {

			this.posn.x += _bounds.x;

		}

		if (this.posn.y > _bounds.y) {

			this.posn.y -= _bounds.y;

		} else if (this.posn.y < 0) {

			this.posn.y += _bounds.y;

		}

		this.posn.x += this.velo.x;
		this.posn.y += this.velo.y;

	}

}

GameObject.prototype.Draw = function (ctx, _sprite) {

	ctx.save();

	// handle 'offscreen' portions:
	// TODO: optimise!

	for (var i in this.centers) {

		var posn = this.centers[i];

		ctx.save();

		ctx.translate(posn.x, posn.y);
		ctx.rotate(this.theta);

		// force antialiasing:
		ctx.scale(0.99, 0.99);

		if (this.active) {

			if (this.CustomDraw) {

				this.CustomDraw(ctx, _sprite);

			}
			if (!this.CustomDraw || this.invinci > 0 || this.beingDamaged || DEBUGGING) {

				if (this.beingDamaged > 0) {

					this.BasicDraw(ctx, 'rgba(255,48,0,' + Math.min(this.beingDamaged/10, 0.75) + ')');
					this.beingDamaged--;

				} else {

					this.BasicDraw(ctx);

				}

			}

		} else if (this.expTimer >= 0) {

			this.DrawExplosion(ctx);

		}

		ctx.restore();

	}

}

GameObject.prototype.Damage = function (_DMG) {

	if (!this.invinci) {

		this.health -= _DMG;
		if (this.beingDamaged < 10) this.beingDamaged += 5;

		if (this.health <= 0) this.Destroy();

	}

}

GameObject.prototype.Destroy = function () {

	if (!this.invinci) this.active = false;

}

GameObject.prototype.BasicDraw = function (ctx, _color) {

	var color = _color || this.color;

	ctx.fillStyle = color;
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 1;

	if (this.compositePoints && DEBUGGING) {

		//console.log('compositePoints');

		for (var i in this.compositePoints) {

			var pointSet = this.compositePoints[i];

			//console.log(pointSet);

			ctx.beginPath();

			ctx.moveTo(pointSet[0].x, pointSet[0].y);

			for (var i in pointSet) {

				ctx.lineTo(pointSet[i].x, pointSet[i].y);

			}

			ctx.lineTo(pointSet[0].x, pointSet[0].y);

			ctx.fill();
			ctx.stroke();

		}

	} else {

		ctx.beginPath();

		ctx.moveTo(this.points[0].x, this.points[0].y);

		for (var i in this.points) {

			ctx.lineTo(this.points[i].x, this.points[i].y);

		}

		ctx.lineTo(this.points[0].x, this.points[0].y);

		ctx.fill();
		ctx.stroke();

	}

}

GameObject.prototype.DrawExplosion = function (ctx, _size) {

	var size = (_size) ? _size : (this.expTimerMax + 1 - this.expTimer) / 10 * this.size;

	ctx.beginPath();
	ctx.fillStyle = '#fc0';
	ctx.strokeStyle = '#f30';
	ctx.lineWidth = size / 3;
	ctx.arc(0, 0, size, 0, Math.PI*2, true);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle = '#fff';
	ctx.arc(0, 0, size / 3, 0, Math.PI*2, true);
	ctx.fill();

}

function Player (_name, _ship, _posn) {

	this.ship = _ship || SHIPS['scout'];

	// parent constructor:
	GameObject.call(this, 'rgba(64,128,255,0.5)', _ship.size, _posn, false, _ship.accel, Math.PI);

	this.points = this.ship.points;
	this.compositePoints = this.ship.compositePoints;
	this.sprite = this.ship.sprite;
	this.health = this.ship.health;

	this.handling = this.ship.handling;

	this.guns = [];

	for (var i in this.ship.guns) {

		var gun = this.ship.guns[i];

		this.guns[i] = new window[gun[0]](gun[1], gun[2], gun[3], gun[4]);

	}

	this.Name = _name;

	this.score = 0;

	this.lives = 1;

	this.health = this.ship.health;

	this.invinci = 0;

	this.reload = 0;

	this.Update = function (_keys, _bounds) {

		if (_keys.spce && _keys.shft) {

			this.Shoot('all');

		} else if (_keys.shft) {

			//console.log('k');

			this.Shoot('2');

		} else if (_keys.spce) {

			//console.log('l');

			this.Shoot('1');

		} else {

			//console.log('none');

			this.Shoot();

		}

		if (_keys.a) {

			// turn left:

			this.velo.theta -= this.accel * this.handling / 100;

			this.thrust.sr = false;
			this.thrust.sl = true;

		} else if (_keys.d) {

			// turn right:

			this.velo.theta += this.accel * this.handling / 100;

			this.thrust.sr = true;
			this.thrust.sl = false;

		} else {

			this.thrust.sr = false;
			this.thrust.sl = false;

		}

		if (_keys.q) {

			// thrust left:
			this.velo.x -= this.accel * this.handling/4 * Math.sin(this.theta - Math.PI/2);
			this.velo.y += this.accel * this.handling/4 * Math.cos(this.theta - Math.PI/2);

			this.thrust.r = true;
			this.thrust.l = false;

		} else if (_keys.e) {

			// thrust right:
			this.velo.x -= this.accel * this.handling/4 * Math.sin(this.theta + Math.PI/2);
			this.velo.y += this.accel * this.handling/4 * Math.cos(this.theta + Math.PI/2);

			this.thrust.r = false;
			this.thrust.l = true;

		} else {

			this.thrust.r = false;
			this.thrust.l = false;

		}

		if (_keys.w) {

			// accelerate:
			this.velo.x -= this.accel * Math.sin(this.theta);
			this.velo.y += this.accel * Math.cos(this.theta);

			this.thrust.f = true;
			this.thrust.b = false;

		} else if (_keys.s) {

			// deccelerate:
			this.velo.x += this.accel * this.handling/4 * Math.sin(this.theta);
			this.velo.y -= this.accel * this.handling/4 * Math.cos(this.theta);

			this.thrust.f = false;
			this.thrust.b = true;

		} else {

			this.thrust.f = false;
			this.thrust.b = false;

		}

		Player.prototype.Update.call(this, _bounds);

	}

	this.CustomDraw = function (ctx, _sprite) {

		if (DEBUGGING) {

			ctx.beginPath();
			ctx.fillStyle = '#fff';
			ctx.arc(0,0,this.size,0,Math.PI*2,true);
			ctx.fill();

		}

		var r = 3*this.size/4 + (this.size/4 * Math.random());

		if (this.thrust.f || this.thrust.b) {

		}

		ctx.drawImage(_sprite, this.sprite.x * 64, this.sprite.y * 64, 64, 64, -32, -32, 64, 64);

	}

	this.Shoot = function (_btn) {

		//console.log(_btn);

		for (var i in this.ship.guns) {

			var gun = this.guns[i];

			if (gun.reload === 0) {

				if (_btn === gun.btn || _btn === 'all') gun.Shoot(this.posn, this.theta, this.velo);

			} else {

				gun.reload--;

			}

		}

	}

	this.Destroy = function () {

		if (this.active && !this.invinci) this.lives--;

		Player.prototype.Destroy.call(this);

	}

}
Player.prototype = new GameObject();
