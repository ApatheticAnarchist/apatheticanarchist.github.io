// GUNS AND SHIPS:

function Gun (_posn, _theta, _rof, _btn) {

	this.posn = _posn;
	this.rof = _rof;
	this.theta = _theta;
	this.btn = _btn;

	this.reload = 0;

	this.Shoot = function (_posn, _theta, _velo) {

		var velo = {'x': _velo.x, 'y': _velo.y, 'theta': _velo.theta},
			theta = _theta + this.theta,
			posn = TranslatePoints([this.posn], _theta, _posn)[0];

		this.Fire(posn, theta, velo);

		this.reload = this.rof;

	}

	this.Fire = function (_posn, _theta, _velo) {

		GAME.playerBullets.push(new Bullet(_posn, _velo, _theta, 10, 7));

	}

}

function Bullet (_posn, _velo, _theta, _speed, _dmg) {

	GameObject.call(this, '#fe3', 2, _posn, _velo, 0, _theta);

	this.speed = _speed;

	this.damage = _dmg

	this.maxAge = 40 + Math.floor(Math.random()*20);

	this.points = [{'x': 0, 'y': this.size },{'x': -this.size, 'y': 0 },
					{'x': 0, 'y': -this.size },{'x': this.size, 'y': 0 }];

	this.velo.x += -this.speed * Math.sin(this.theta);
	this.velo.y += this.speed * Math.cos(this.theta);

	this.Update = function (_bounds) {

		Bullet.prototype.Update.call(this, _bounds);

		if (this.active && this.age > this.maxAge) this.Destroy();

	}

	this.CustomDraw = function (ctx) {

		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(0,0,this.size,0,Math.PI*2,true);
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = '#fff';
		ctx.arc(0,0,this.size/2,0,Math.PI*2,true);
		ctx.fill();

	}

}
Bullet.prototype = new GameObject();

function MissileLauncher (_posn, _theta, _rof, _btn) {

	Gun.call(this, _posn, _theta, _rof, _btn);

	this.Fire = function (_posn, _theta, _velo) {

		GAME.playerBullets.push(new Missile(_posn, _velo, _theta, 10, 1));

	}

}
MissileLauncher.prototype = new Gun();

function Missile (_posn, _velo, _theta, _speed, _dmg) {

	var vx = _velo.x, vy = _velo.y;

	Bullet.call(this, _posn, _velo, _theta, _speed, _dmg);

	this.maxAge = 75 + Math.round(Math.random()*50);

	this.velo.x = vx;
	this.velo.y = vy;
	this.velo.theta = 0;
	this.color = '#aaa';

	this.size = 5;

	this.points = [{'x': 0, 'y': this.size },{'x': -this.size/3, 'y': 2*this.size/3 },
					{'x': -this.size/3, 'y': -this.size },{'x': this.size/3, 'y': -this.size },
					{'x': this.size/3, 'y': 2*this.size/3 }];

	this.accel = this.speed / 20;

	this.proxyfused = true;

	this.Update = function (_bounds) {

		if (this.age < this.maxAge/3) {

			if (this.velo.theta * this.velo.theta < 0.25) this.velo.theta += (Math.random()-0.5) / 30;

			this.velo.x += -this.accel * Math.sin(this.theta);
			this.velo.y += this.accel * Math.cos(this.theta);

			this.thrust = true;

		} else this.thrust = false;

		Missile.prototype.Update.call(this, _bounds);

	}

	this.CustomDraw = function (ctx) {

		if (this.thrust) {

			var r = this.size + (Math.random() * this.size);

			ctx.beginPath();
			ctx.strokeStyle = '#f30';
			ctx.lineWidth = 2;
			ctx.moveTo(0, 0);
			ctx.lineTo(0, -r);
			ctx.stroke();

		}

		Missile.prototype.BasicDraw.call(this, ctx);

	}

	this.Destroy = function () {

		for (var i = 0; i < 11; i++) {

			var angle = Math.PI/6 * i,
				theta = angle + this.theta,
				velo = {'x': 0, 'y': 0, 'theta': 0},
				posn = {'x': this.posn.x, 'y': this.posn.y};

			GAME.playerBullets.push(new MissileShard(posn, velo, theta, 5, 5));

		}

		Missile.prototype.Destroy.call(this);

	}

}
Missile.prototype = new Bullet();

function MissileShard (_posn, _velo, _theta, _speed, _dmg) {

	Bullet.call(this, _posn, _velo, _theta, _speed, _dmg);

	this.maxAge = 5 + Math.floor(Math.random()*5);

	this.color = '#666';

}
MissileShard.prototype = new Bullet();

function VortexLauncher (_posn, _theta, _rof, _btn) {

	Gun.call(this, _posn, _theta, _rof, _btn);

	this.Fire = function (_posn, _theta, _velo) {

		GAME.playerBullets.push(new Vortex(_posn, _velo, _theta, 5, 3));

	}

}
VortexLauncher.prototype = new Gun();

function Vortex (_posn, _velo, _theta, _speed, _dmg) {

	Bullet.call(this, _posn, _velo, _theta, _speed, _dmg);

	this.size = 5;
	this.maxAge = 100;
	this.invinci = 100;

	this.expTimer = 0;

	this.GetPoints = function () {

		this.points = [

			{'x': 0, 'y': this.size },{'x': this.size/4, 'y': this.size/2 },
			{'x': this.size/8, 'y': this.size/4 },{'x': -this.size/2, 'y': this.size/2 },
			{'x': -this.size, 'y': 0 },{'x': -this.size/2, 'y': this.size/4 },
			{'x': -this.size/4, 'y': this.size/8 }, {'x': -this.size/2, 'y': -this.size/2 },
			{'x': 0, 'y': -this.size },{'x': -this.size/4, 'y': -this.size/2 },
			{'x': -this.size/8, 'y': -this.size/4 },{'x': this.size/2, 'y': -this.size/2 },
			{'x': this.size, 'y': 0 },{'x': this.size/2, 'y': -this.size/4 },
			{'x': this.size/4, 'y': -this.size/8 }, {'x': this.size/2, 'y': this.size/2 }

		];

	}

	this.Update = function (_bounds) {

		this.velo.theta -= 0.01;

		this.size += 1/4;

		this.GetPoints();

		Vortex.prototype.Update.call(this, _bounds);

	}

	this.CustomDraw = this.BasicDraw;

}
Vortex.prototype = new Bullet();

function RailGun (_posn, _theta, _rof, _btn) {

	this.startPosn = _posn[0];
	this.endPosn = _posn[1];

	Gun.call(this, _posn[0], _theta, _rof, _btn);

	this.Fire = function (_posn, _theta, _velo) {

		GAME.playerBullets.push(new RailGunShot(_posn, [this.startPosn, this.endPosn], _velo, _theta, 10, 10));

	}

}
RailGun.prototype = new Gun();

function RailGunShot (_posn, _startEnd, _velo, _theta, _speed, _dmg) {

	this.startEnd = _startEnd;
	this.start = _startEnd[0];
	this.end = _startEnd[1];
	this.railVector = {'x': this.start.x - this.end.x, 'y': this.start.y - this.end.y};
	this.railLength2 = ((this.start.x - this.end.x) * (this.start.x - this.end.x))
						 + ((this.start.y - this.end.y) * (this.start.y - this.end.y));

	var vx = _velo.x, vy = _velo.y;

	Bullet.call(this, _posn, _velo, _theta, _speed, _dmg);

	this.maxAge = 75 + Math.round(Math.random()*50);

	this.velo.x = vx;
	this.velo.y = vy;

	this.accel = 1.5;//this.speed / 10;

	this.Update = function (_bounds) {

		RailGunShot.prototype.Update.call(this, _bounds);

		var dx = this.posn.x - GAME.player.posn.x,
			dy = this.posn.y - GAME.player.posn.y,
			d2 = dx * dx + dy * dy;

		if (!this.fired && (d2 <= this.railLength2 || this.finalAccel)) {

			// sum n = n(n-1)/2
			var d = ((this.age - 1) * (this.age) / 2) * this.accel;

			var posn = TranslatePoints([{'x': this.start.x, 'y': this.start.y + d}], GAME.player.theta, GAME.player.posn)[0];

			this.posn = posn;

			this.velo.x += -this.accel * Math.sin(GAME.player.theta);
			this.velo.y += this.accel * Math.cos(GAME.player.theta);

			this.thrust = true;

			 this.finalAccel = (d2 <= this.railLength2);

		} else {

			this.thrust = false;
			this.fired = true;

		}

	}

	this.CustomDraw = function (ctx) {

		if (this.thrust) {

			ctx.fillStyle = '#8cf';
			ctx.strokeStyle = '#00f';
			ctx.lineWidth = 2;

			ctx.beginPath();
			ctx.moveTo(-this.size,0);
			ctx.arc(0, 0, (Math.random()*2), 0, Math.PI*2, true);
			ctx.stroke();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(this.size,0);
			ctx.arc(0, 0, (Math.random() + 1), 0, Math.PI*2, true);
			ctx.stroke();
			ctx.fill();

		}

		RailGunShot.prototype.BasicDraw.call(this, ctx);

	}

}
RailGunShot.prototype = new Bullet();

function Teleport (_posn, _theta, _rof, _btn) {

	Gun.call(this, _posn, _theta, _rof, _btn);

	this.Fire = function (_posn, _theta, _velo) {

		GAME.player.posn = {'x': Math.random() * GAME.size.x, 'y': Math.random() * GAME.size.y};
		GAME.player.invinci += 25;

	}

}
Teleport.prototype = new Gun();

function Sheild (_posn, _theta, _rof, _btn) {

	Gun.call(this, _posn, _theta, _rof, _btn);

	this.Fire = function (_posn, _theta, _velo) {

		GAME.player.invinci += Math.round(this.rof/5);

	}

}
Sheild.prototype = new Gun();

// ------------------------------------------- SHIPS ------------------------------------------- //

var SHIPS = {

	'scout': {

		'type': 'Scout',
		'id': 'scout',
		'locked': false,
		'size': 25,
		'points': [
			{'x': -1, 'y': 25},
			{'x': -18, 'y': -10}, {'x': -18, 'y': -17},
			{'x': -17, 'y': -17}, {'x': -17, 'y': -16},
			{'x': -11, 'y': -16}, {'x': -11, 'y': -15},
			{'x': -5, 'y': -15}, {'x': -3, 'y': -18},
			{'x': 3, 'y': -18}, {'x': 5, 'y': -15},
			{'x': 11, 'y': -15}, {'x': 11, 'y': -16},
			{'x': 17, 'y': -16}, {'x': 17, 'y': -17}, 
			{'x': 18, 'y': -17}, {'x': 18, 'y': -10},
			{'x': 1, 'y': 25}
		],
		'compositePoints': [
			[// left wing
				{'x': 0, 'y': 25}, {'x': -1, 'y': 25},
				{'x': -18, 'y': -10}, {'x': -18, 'y': -17},
				{'x': -17, 'y': -17}, {'x': -17, 'y': -16},
				{'x': -11, 'y': -16}, {'x': -11, 'y': -15},
				{'x': -5, 'y': -15}, {'x': 0, 'y': -15}
			],
			[// right wing
				{'x': 0, 'y': -15}, {'x': 5, 'y': -15},
				{'x': 11, 'y': -15}, {'x': 11, 'y': -16},
				{'x': 17, 'y': -16}, {'x': 17, 'y': -17}, 
				{'x': 18, 'y': -17}, {'x': 18, 'y': -10},
				{'x': 1, 'y': 25}, {'x': 0, 'y': 25}
			],
			[// engine
				{'x': -5, 'y': -15}, {'x': -3, 'y': -18},
				{'x': 3, 'y': -18}, {'x': 5, 'y': -15}
			]

		],
		'accel': 0.2,
		'handling': 1.25,
		'health': 50,
		'guns': [['Gun', {'x': 0, 'y': 24}, 0, 10, '1'], ['Teleport', {'x': 0, 'y': -10}, 0, 200, '2']],
		'secondary': 'teleport',
		'sprite': {'x': 0, 'y': 0}

	},

	'light_shuttle': {

		'type': 'Light Shuttle',
		'id': 'light_shuttle',
		'locked': false,
		'requirement': 2500,
		'size': 21,
		'points': [
			{'x': -3, 'y': 20}, {'x': -7, 'y': 16},
			{'x': -7, 'y': 13}, {'x': -6, 'y': 12},
			{'x': -6, 'y': 11}, {'x': -8, 'y': 9}, 
			{'x': -9, 'y': 9}, {'x': -12, 'y': 6},
			{'x': -21, 'y': -12}, {'x': -21, 'y': -19},
			{'x': -12, 'y': -19}, {'x': -6, 'y': -16},
			{'x': -5, 'y': -17}, {'x': -2, 'y': -17},
			{'x': -2, 'y': -20}, {'x': 2, 'y': -20},
			{'x': 2, 'y': -17}, {'x': 5, 'y': -17},
			{'x': 6, 'y': -16}, {'x': 12, 'y': -19},
			{'x': 21, 'y': -19}, {'x': 21, 'y': -12},
			{'x': 12, 'y': 6}, {'x': 9, 'y': 9},
			{'x': 8, 'y': 9}, {'x': 6, 'y': 11},
			{'x': 6, 'y': 12}, {'x': 7, 'y': 13},
			{'x': 7, 'y': 16}, {'x': 3, 'y': 20}
		],
		'compositePoints': [
			[// cockpit
				{'x': -3, 'y': 20}, {'x': -7, 'y': 16},
				{'x': -7, 'y': 13}, {'x': -6, 'y': 12},
				{'x': -6, 'y': 11}, {'x': 6, 'y': 11},
				{'x': 6, 'y': 12}, {'x': 7, 'y': 13},
				{'x': 7, 'y': 16}, {'x': 3, 'y': 20}
			],
			[// right wing
				{'x': -6, 'y': 11}, {'x': -8, 'y': 9},
				{'x': -9, 'y': 9}, {'x': -12, 'y': 6},
				{'x': -21, 'y': -12}, {'x': -21, 'y': -19},
				{'x': -12, 'y': -19}, {'x': -6, 'y': -16}
			],
			[// left wing
				{'x': 6, 'y': -16}, {'x': 12, 'y': -19},
				{'x': 21, 'y': -19}, {'x': 21, 'y': -12},
				{'x': 12, 'y': 6}, {'x': 9, 'y': 9},
				{'x': 8, 'y': 9}, {'x': 6, 'y': 11}
			],
			[// fuselage
				{'x': -6, 'y': 11}, {'x': -6, 'y': -16},
				{'x': -5, 'y': -17}, {'x': 5, 'y': -17},
				{'x': 6, 'y': -16}, {'x': 6, 'y': 11}
			],
			[// tailfin
				{'x': -2, 'y': -17},
				{'x': -2, 'y': -20}, {'x': 2, 'y': -20},
				{'x': 2, 'y': -17}
			]

		],
		'accel': 0.1,
		'handling': 1,
		'health': 150,
		'guns': [['Gun', {'x': 0, 'y': 20}, 0, 10, '1'], ['Sheild', {'x': 0, 'y': 0}, 0, 500, '2']],
		'secondary': 'shield',
		'sprite': {'x': 0, 'y': 1}

	},

	'basic_fighter': {

		'type': 'Fighter',
		'id': 'basic_fighter',
		'locked': true,
		'requirement': 5000,
		'size': 29,
		'points': [
			{'x': -3, 'y': 12},
			{'x': -29, 'y': -1}, {'x': -29, 'y': -8},
			{'x': -23, 'y': -8}, {'x': -23, 'y': -7},
			{'x': -11, 'y': -7}, {'x': -11, 'y': -6},
			{'x': -5, 'y': -6}, {'x': -3, 'y': -9},
			{'x': 3, 'y': -9}, {'x': 5, 'y': -6},
			{'x': 11, 'y': -6}, {'x': 11, 'y': -7},
			{'x': 23, 'y': -7}, {'x': 23, 'y': -8},
			{'x': 29, 'y': -8}, {'x': 29, 'y': -1},
			{'x': 3, 'y': 12}
		],
		'compositePoints': [
			[// right wing
				{'x': 0, 'y': 12}, {'x': -3, 'y': 12},
				{'x': -29, 'y': -1}, {'x': -29, 'y': -8},
				{'x': -23, 'y': -8}, {'x': -23, 'y': -7},
				{'x': -11, 'y': -7}, {'x': -11, 'y': -6},
				{'x': 0, 'y': -6},
			],
			[// left wing
				{'x': 0, 'y': -6},
				{'x': 11, 'y': -6}, {'x': 11, 'y': -7},
				{'x': 23, 'y': -7}, {'x': 23, 'y': -8},
				{'x': 29, 'y': -8}, {'x': 29, 'y': -1},
				{'x': 3, 'y': 12}, {'x': 0, 'y': 12}
			],
			[// engine
				{'x': -5, 'y': -6}, {'x': -3, 'y': -9},
				{'x': 3, 'y': -9}, {'x': 5, 'y': -6},
			]
		],
		'accel': 0.125,
		'handling': 1.5,
		'health': 100,
		'guns': [['Gun', {'x': 16, 'y': 4}, 0, 10, '1'], ['Gun', {'x': -16, 'y': 4}, 0, 10, '1'],
				['VortexLauncher', {'x': 0, 'y': 12}, 0, 50, '2']],
		'secondary': 'vortex',
		'sprite': {'x': 1, 'y': 0}

	},

	'heavy_shuttle': {

		'type': 'Heavy Shuttle',
		'id': 'heavy_shuttle',
		'locked': true,
		'requirement': 10000,
		'size': 26,
		'points': [
			{'x': -3, 'y': 21}, {'x': -7, 'y': 17},
			{'x': -7, 'y': 14}, {'x': -6, 'y': 13},
			{'x': -7, 'y': 12}, {'x': -11, 'y': 12},
			{'x': -14, 'y': 10}, {'x': -16, 'y': 7},
			{'x': -26, 'y': -11}, {'x': -26, 'y': -18},
			{'x': -17, 'y': -18}, {'x': -11, 'y': -15},
			{'x': -9, 'y': -16}, {'x': -2, 'y': -16},
			{'x': -2, 'y': -19}, {'x': 2, 'y': -19},
			{'x': 2, 'y': -16}, {'x': 9, 'y': -16},
			{'x': 11, 'y': -15}, {'x': 17, 'y': -18},
			{'x': 26, 'y': -18}, {'x': 26, 'y': -11},
			{'x': 16, 'y': 7}, {'x': 14, 'y': 10},
			{'x': 11, 'y': 12}, {'x': 7, 'y': 12},
			{'x': 6, 'y': 13}, {'x': 7, 'y': 14},
			{'x': 7, 'y': 17}, {'x': 3, 'y': 21}
		],
		'compositePoints': [
			[// cockpit
				{'x': -3, 'y': 21}, {'x': -7, 'y': 17},
				{'x': -7, 'y': 14}, {'x': -6, 'y': 13},
				{'x': -6, 'y': 12}, {'x': 6, 'y': 12},
				{'x': 6, 'y': 13}, {'x': 7, 'y': 13},
				{'x': 7, 'y': 17}, {'x': 3, 'y': 21}
			],
			[// right wing
				{'x': -11, 'y': 12},
				{'x': -14, 'y': 10}, {'x': -16, 'y': 7},
				{'x': -26, 'y': -11}, {'x': -26, 'y': -18},
				{'x': -17, 'y': -18}, {'x': -11, 'y': -15}
			],
			[// left wing
				{'x': 11, 'y': -15}, {'x': 17, 'y': -18},
				{'x': 26, 'y': -18}, {'x': 26, 'y': -11},
				{'x': 16, 'y': 7}, {'x': 14, 'y': 10},
				{'x': 11, 'y': 12}
			],
			[// fuselage
				{'x': -11, 'y': 12}, {'x': -11, 'y': -15},
				{'x': -9, 'y': -16}, {'x': 9, 'y': -16},
				{'x': 11, 'y': -15}, {'x': 11, 'y': 12}
			],
			[// tailfin
				{'x': -2, 'y': -16},
				{'x': -2, 'y': -19}, {'x': 2, 'y': -19},
				{'x': 2, 'y': -16}
			]

		],
		'accel': 0.085,
		'handling': 0.9,
		'health': 250,
		'guns': [['Sheild', {'x': 0, 'y': 0}, 0, 500, '2'],
			['Gun', {'x': 9, 'y': 12}, -Math.PI/64, 10, '1'],
			['Gun', {'x': -9, 'y': 12}, Math.PI/64, 10, '1']
		],
		'secondary': 'shield',
		'sprite': {'x': 2, 'y': 1}

	},

	'adv_fighter': {

		'type': 'Interceptor',
		'id': 'adv_fighter',
		'locked': true,
		'requirement': 20000,
		'size': 22,
		'points': [
			{'x': -1, 'y': 22},
			{'x': -2, 'y': 20}, {'x': -3, 'y': 17},
			{'x': -4, 'y': 12}, {'x': -5, 'y': 0},
			{'x': -11, 'y': -3}, {'x': -12, 'y': -4},
			{'x': -14, 'y': -5}, {'x': -15, 'y': -4},
			{'x': -16, 'y': -4}, {'x': -16, 'y': -14},
			{'x': -15, 'y': -14}, {'x': -10, 'y': -13},
			{'x': -6, 'y': -12}, {'x': -3, 'y': -15},
			{'x': 3, 'y': -15}, {'x': 6, 'y': -12},
			{'x': 10, 'y': -13}, {'x': 15, 'y': -14},
			{'x': 16, 'y': -14}, {'x': 16, 'y': -4},
			{'x': 15, 'y': -4}, {'x': 14, 'y': -5},
			{'x': 12, 'y': -4}, {'x': 11, 'y': -3},
			{'x': 5, 'y': 0}, {'x': 4, 'y': 12},
			{'x': 3, 'y': 17}, {'x': 2, 'y': 20},
			{'x': 1, 'y': 22}
		],
		'compositePoints': [
			[// fuselage
				{'x': -1, 'y': 22},
				{'x': -2, 'y': 20}, {'x': -3, 'y': 17},
				{'x': -4, 'y': 12}, {'x': -5, 'y': 0},
				{'x': -5, 'y': -13}, {'x': -3, 'y': -15},
				{'x': 3, 'y': -15}, {'x': 5, 'y': -13},
				{'x': 5, 'y': 0}, {'x': 4, 'y': 12},
				{'x': 3, 'y': 17}, {'x': 2, 'y': 20},
				{'x': 1, 'y': 22}

			],
			[// right wing
				{'x': -5, 'y': 0},
				{'x': -11, 'y': -3}, {'x': -12, 'y': -4},
				{'x': -14, 'y': -5}, {'x': -15, 'y': -4},
				{'x': -16, 'y': -4}, {'x': -16, 'y': -14},
				{'x': -15, 'y': -14}, {'x': -10, 'y': -13},
				{'x': -5, 'y': -13}
			],
			[// left wing
				{'x': 5, 'y': -13},
				{'x': 10, 'y': -13}, {'x': 15, 'y': -14},
				{'x': 16, 'y': -14}, {'x': 16, 'y': -4},
				{'x': 15, 'y': -4}, {'x': 14, 'y': -5},
				{'x': 12, 'y': -4}, {'x': 11, 'y': -3},
				{'x': 5, 'y': 0}
			]
		],
		'accel': 0.175,
		'handling': 1.75,
		'health': 125,
		'guns': [['Gun', {'x': 12, 'y': -5}, 0, 8, '1'], 
				['Gun', {'x': -12, 'y': -5}, 0, 8, '1'], 
				['MissileLauncher', {'x': 14, 'y': -8}, 0, 50, '2'], 
				['MissileLauncher', {'x': -14, 'y': -8}, 0, 50, '2'] ],
		'secondary': 'missiles',
		'sprite': {'x': 2, 'y': 0}

	},

	'x101': {

		'type': 'X101-R',
		'id': 'x101',
		'locked': true,
		'requirement': 40000,
		'size': 32,
		'points': [
			{'x': -2, 'y': 6}, {'x': -2, 'y': 32},
			{'x': -8, 'y': 32}, {'x': -8, 'y': -6},
			{'x': -9, 'y': -6}, {'x': -21, 'y': -12},
			{'x': -24, 'y': -13}, {'x': -25, 'y': -14},
			{'x': -25, 'y': -23}, {'x': -21, 'y': -23},
			{'x': -6, 'y': -20}, {'x': -4, 'y': -22},

			{'x': 4, 'y': -22}, {'x': 6, 'y': -20},
			{'x': 21, 'y': -23}, {'x': 25, 'y': -23},
			{'x': 25, 'y': -14}, {'x': 24, 'y': -13},
			{'x': 21, 'y': -12}, {'x': 9, 'y': -6},
			{'x': 8, 'y': -2}, {'x': 7, 'y': 1},
			{'x': 6, 'y': 3}, {'x': 3, 'y': 6}
		],
		'compositePoints': [
			[// left wing
				{'x': 6, 'y': -20},
				{'x': 21, 'y': -23}, {'x': 25, 'y': -23},
				{'x': 25, 'y': -14}, {'x': 24, 'y': -13},
				{'x': 21, 'y': -12}, {'x': 9, 'y': -6}
			],
			[// right wing
				{'x': -9, 'y': -6}, {'x': -21, 'y': -12},
				{'x': -24, 'y': -13}, {'x': -25, 'y': -14},
				{'x': -25, 'y': -23}, {'x': -21, 'y': -23},
				{'x': -6, 'y': -20}
			],
			[// fuselage
				{'x': -9, 'y': -6}, {'x': -6, 'y': -20},
				{'x': -4, 'y': -22}, {'x': 4, 'y': -22},
				{'x': 6, 'y': -20}, {'x': 9, 'y': -6},
				{'x': 8, 'y': -2}, {'x': 7, 'y': 1},
				{'x': 6, 'y': 3}, {'x': 3, 'y': 6},
				{'x': -2, 'y': 6}
			],
			[// railgun
				{'x': -2, 'y': 6}, {'x': -2, 'y': 32},
				{'x': -8, 'y': 32}, {'x': -8, 'y': -6}
			]
		],
		'accel': 0.1,
		'handling': 1,
		'health': 150,	// TODO: change this!!
		'guns': [
			['RailGun', [{'x': -4.5, 'y': -10}, {'x': -4.5, 'y': 30}], 0, 6, '1']
		],
		'secondary': 'none',
		'sprite': {'x': 4, 'y': 0}

	},

	'dropship': {

		'type': 'Dropship',
		'id': 'dropship',
		'locked': true,
		'requirement': 40000,
		'size': 26,
		'points': [
			{'x': -24, 'y': 19}, {'x': -26, 'y': 17},
			{'x': -26, 'y': -12}, {'x': -25, 'y': -14},
			{'x': -24, 'y': -15}, {'x': -23, 'y': -16},
			{'x': -21, 'y': -17}, {'x': -6, 'y': -17},
			{'x': -3, 'y': -20}, {'x': 3, 'y': -20},
			{'x': 6, 'y': -17}, {'x': 21, 'y': -17},
			{'x': 23, 'y': -16}, {'x': 24, 'y': -15},
			{'x': 25, 'y': -14}, {'x': 26, 'y': -12},
			{'x': 26, 'y': 17}, {'x': 24, 'y': 19}
		],
		'compositePoints': [
			[// fuselage
				{'x': -24, 'y': 19}, {'x': -26, 'y': 17},
				{'x': -26, 'y': -12}, {'x': -25, 'y': -14},
				{'x': -24, 'y': -15}, {'x': -23, 'y': -16},
				{'x': -21, 'y': -17}, {'x': 21, 'y': -17},
				{'x': 23, 'y': -16}, {'x': 24, 'y': -15},
				{'x': 25, 'y': -14}, {'x': 26, 'y': -12},
				{'x': 26, 'y': 17}, {'x': 24, 'y': 19}
			],
			[// engine
				{'x': -6, 'y': -17},
				{'x': -3, 'y': -20}, {'x': 3, 'y': -20},
				{'x': 6, 'y': -17}
			]
		],
		'accel': 0.075,
		'handling': 1,
		'health': 300,
		'guns': [['Gun', {'x': 12, 'y': 19}, -Math.PI/16, 10, '1'], ['Gun', {'x': -12, 'y': 19}, Math.PI/16, 10, '1'],
				['Gun', {'x': 0, 'y': 19}, 0, 10, '1'], ['Sheild', {'x': 0, 'y': 0}, 0, 500, '2']],
		'secondary': 'shield',
		'sprite': {'x': 1, 'y': 1}

	},

	'cruiser': {

		'type': 'Cruiser',
		'id': 'cruiser',
		'locked': true,
		'requirement': 80000,
		'size': 32,
		'points': [
			{'x': -2, 'y': 32},
			{'x': -12, 'y': 27}, {'x': -13, 'y': 26},
			{'x': -13, 'y': 20}, {'x': -10, 'y': 20},
			{'x': -9, 'y': 21}, {'x': -7, 'y': 21},
			{'x': -6, 'y': 20}, {'x': -6, 'y': 16},
			{'x': -7, 'y': 15}, {'x': -9, 'y': -12},
			{'x': -21, 'y': -18}, {'x': -23, 'y': -18},
			{'x': -23, 'y': -15}, {'x': -25, 'y': -15},
			{'x': -25, 'y': -29}, {'x': -21, 'y': -29},
			{'x': -6, 'y': -26}, {'x': -4, 'y': -28},

			{'x': 4, 'y': -28}, {'x': 6, 'y': -26},
			{'x': 21, 'y': -29}, {'x': 25, 'y': -29},
			{'x': 25, 'y': -15}, {'x': 23, 'y': -15},
			{'x': 23, 'y': -18}, {'x': 21, 'y': -18},
			{'x': 9, 'y': -12}, {'x': 7, 'y': 15},
			{'x': 6, 'y': 16}, {'x': 6, 'y': 20},
			{'x': 7, 'y': 21}, {'x': 9, 'y': 21},
			{'x': 10, 'y': 20}, {'x': 13, 'y': 20},
			{'x': 13, 'y': 26}, {'x': 12, 'y': 27},
			{'x': 2, 'y': 32}
		],
		'compositePoints': [
			[// front right winglet
				{'x': -2, 'y': 32},
				{'x': -12, 'y': 27}, {'x': -13, 'y': 26},
				{'x': -13, 'y': 20}, {'x': -6, 'y': 21}
			],
			[// front left winglet
				{'x': 6, 'y': 21}, {'x': 13, 'y': 20},
				{'x': 13, 'y': 26}, {'x': 12, 'y': 27},
				{'x': 2, 'y': 32}
			],
			[// main right wing
				{'x': -9, 'y': -12},
				{'x': -21, 'y': -18}, {'x': -23, 'y': -18},
				{'x': -23, 'y': -15}, {'x': -25, 'y': -15},
				{'x': -25, 'y': -29}, {'x': -21, 'y': -29},
				{'x': -7, 'y': -26}
			],
			[// main left wing
				{'x': 7, 'y': -26},
				{'x': 21, 'y': -29}, {'x': 25, 'y': -29},
				{'x': 25, 'y': -15}, {'x': 23, 'y': -15},
				{'x': 23, 'y': -18}, {'x': 21, 'y': -18},
				{'x': 9, 'y': -12}
			],
			[// fuselage
				{'x': -2, 'y': 32}, {'x': -6, 'y': 21},
				{'x': -9, 'y': -12}, {'x': -7, 'y': -26},
				{'x': -6, 'y': -26}, {'x': -4, 'y': -29}, 
				{'x': 4, 'y': -29}, {'x': 6, 'y': -26}, 
				{'x': 7, 'y': -26}, {'x': 9, 'y': -12},
				{'x': 6, 'y': 21}, {'x': 2, 'y': 32}
			]
		],
		'accel': 0.1,
		'handling': 1,
		'health': 200,
		'guns': [
			['Gun', {'x': 2, 'y': 31}, 0, 8, '1'],
			['Gun', {'x': -2, 'y': 31}, 0, 8, '1'],
			//['Gun', {'x': 22, 'y': -12}, 0, 10, '1'],
			//['Gun', {'x': -22, 'y': -12}, 0, 10, '1'],
			['MissileLauncher', {'x': 6, 'y': 7}, -Math.PI/6, 50, '2'], 
			['MissileLauncher', {'x': -6, 'y': 7}, Math.PI/6, 50, '2'], 
			['MissileLauncher', {'x': 7, 'y': -3}, -Math.PI/4, 50, '2'], 
			['MissileLauncher', {'x': -7, 'y': -3}, Math.PI/4, 50, '2'] 
		],
		'secondary': 'missiles',
		'sprite': {'x': 3, 'y': 0}

	}

};
