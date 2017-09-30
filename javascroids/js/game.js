// --------------------------------------------- GAME CLASS ------------------------------------------------------//

var GAME;

function Game () {

	this.pressedKeys = {'w': false, 'a': false, 's': false, 'd': false,
					'q': false, 'e': false, 'l': false, 'k': false,
					'h': false, 'p': false,
					'shft': false, 'ctrl': false },

	this.Init = function (_size, _player) {

		if (this.DOM_canvas) this.DOM_canvas.parentNode.removeChild(this.DOM_canvas);

		this.enemies = [];
		this.playerBullets = [];
		this.textPopups = [];
		this.level = 0;

		var canvas = document.createElement('canvas');

		canvas.width = _size.x;
		canvas.height = _size.y;
		canvas.id = 'main_canvas';

		document.body.appendChild(canvas);

		this.shipsprite = document.getElementById('shipsprite');
		this.asteroidsprite = document.getElementById('asteroidsprite');
		this.junksprite = document.getElementById('junksprite');

		this.ctx = canvas.getContext('2d');
		this.asteroidTexture = this.ctx.createPattern(this.asteroidsprite, 'repeat');
		this.junkTexture = this.ctx.createPattern(this.junksprite, 'repeat');

		this.DOM_canvas = canvas;
		this.DOM_intro = document.getElementById('intro');
		this.DOM_outro = document.getElementById('outro');
		this.DOM_hiscores = document.getElementById('hi-scores');
		this.DOM_player = document.getElementById('player_name_out');
		this.DOM_lives = document.getElementById('lives');
		this.DOM_health = document.getElementById('health');
		this.DOM_level = document.getElementById('level');
		this.DOM_score = document.getElementById('score');
		this.DOM_endscore = document.getElementById('player_score');
		this.DOM_paused = document.getElementById('paused');
		this.DOM_resume = document.getElementById('resume_btn');
		this.DOM_clear = document.getElementById('clear_data_btn');

		// TODO: need a suitable input for mobile (probably onscreen buttons or touch controlled, 
		//		 ideally accelerometer though unlikely)
		window.addEventListener('keydown', KeyDown);
		window.addEventListener('keyup', KeyUp);

		this.size = _size;
		this.ctx = canvas.getContext('2d');
		this.player = _player;

		this.running = true;

		var obj = this;

		if (!this.loop) StartLoop();

		this.WinLevel();

		//this.DOM_lives.innerHTML = this.player.lives;
		this.DOM_health.innerHTML = this.player.health;
		this.DOM_player.innerHTML = this.player.Name;
		HideIntro();
		HideOutro();

		this.DOM_canvas.style.cursor = 'none';

	}

	this.Loop = function () {

		if (this.running) {

			this.Update();

		} else {

			this.DOM_paused.style.display = 'block';

		}

	}

	this.WinLevel = function () {

		this.player.invinci += 50;
		if (this.player.lives > 0) this.player.score += (this.level) * 1000;

		// reset player age to see if it helps with crashes:
		this.player.age = 0;

		this.level++;
		this.DOM_level.innerHTML = this.level;

		var obj = this;

		this.textPopups.push(new TextPopup('LEVEL '+ obj.level,'rgba(255,255,255,', 64, {'x': obj.size.x/2, 'y': obj.size.y/2}));

		this.AddEnemies();

	}

	this.Lose = function () {

		if (typeof(Storage) !== 'undefined') {

			var stored = localStorage.getItem('scores');

			if (stored) {

				var scores = JSON.parse(stored);

			} else var scores = {'scores':[]};

			var score = {

				'player': this.player.Name,
				'score': this.player.score,
				'level': this.level,
				'ship': this.player.ship.type

			};

			scores.scores.push(score);

			scores.scores.sort(function (a, b) {

				return b.score - a.score;

			});

			localStorage.setItem('scores', JSON.stringify(scores));

			score.thistime = true;

			// handle unlocking new ships:

			var stored = localStorage.getItem('unlocked'),
				unlocked = (stored) ? JSON.parse(stored).ships : [];

			for (var i in SHIPS) {

				var s = SHIPS[i];

				if (s.locked && score.score > s.requirement) {

					unlocked.push(i);
				}

			}

			localStorage.setItem('unlocked', JSON.stringify({'ships':unlocked}));

			this.ShowHiScores(true, scores);

		}

	}

	this.ShowHiScores = function (_final, _scores) {

		var table = this.DOM_hiscores || document.getElementById('hi-scores'),
			intro = this.DOM_intro || document.getElementById('intro'),
			outro = this.DOM_outro || document.getElementById('outro'),
			resume = this.DOM_resume || document.getElementById('resume_btn'),
			retry = this.DOM_retry || document.getElementById('retry_btn'),
			clear = this.DOM_clear || document.getElementById('clear_data_btn');

		if (GAME.running || !this.player) {

			if (!_final) this.running = false;

			if (typeof(Storage) !== 'undefined') {

				var stored = localStorage.getItem('scores');

				if (stored) {

					var scores = _scores || JSON.parse(stored);

				} else var scores = {'scores':[]};

				if (!_final && this.player) {

					var score = {

						'player': this.player.Name,
						'score': this.player.score,
						'level': this.level,
						'ship': this.player.ship.type

					};

					scores.scores.push(score);

					score.thistime = true;

				}

				scores.scores.sort(function (a, b) {

					return b.score - a.score;

				});

				if (this.player) this.DOM_endscore.innerHTML = this.player.score;

				WriteHiScoreTable(scores, table);

				outro.style.opacity = 1;
				outro.style.height = '100%';
				outro.style.display = 'block';

				HideIntro();

				if (_final || !this.player) {

					if (!this.player) {

						document.getElementById('main-score').style.display = 'none';
						retry.style.display = 'none';
						clear.style.display = 'inline-block';

					} else {

						document.getElementById('main-score').style.display = 'block';
						retry.style.display = 'inline-block';
						clear.style.display = 'none';

					}

					resume.style.display = 'none';

				} else {

					document.getElementById('main-score').style.display = 'block';
					resume.style.display = 'inline-block';
					retry.style.display = 'inline-block';
					clear.style.display = 'none';

				}

			}

		} else {

			this.running = true;

			HideOutro();

		}

	}

	this.AddEnemies = function () {

		// new level:
		var n = Math.min(3 + Math.floor(this.level/2), 12);

		for (var i = 0; i < n; i++) {

			if (this.level <= 5) {

				this.enemies.push(new Asteroid());

			} else {

				if (i < this.level - 5) {

					this.enemies.push(new SpaceJunk());

				} else {

					this.enemies.push(new Asteroid());

				}

			}

		}

		for (var i = 0; i < Math.floor(this.level/2 * Math.random()); i++) {

			this.enemies.push(new EnemyFighter());

		}

	}

	this.Update = function () {

		// TODO: D.R.Y.
		var ctx = this.ctx;

		ctx.clearRect(0,0,this.size.x,this.size.y);

		this.HandleCollisions();

		if (this.enemies.length === 0) {

			this.WinLevel();

		} else {

			for (var i = this.enemies.length - 1; i >= 0; i--) {

				var enemy = this.enemies[i];

				if(!enemy.active) {

					enemy.expTimer--;

					if (enemy.expTimer <= 0) this.enemies.splice(i, 1);

				}

				enemy.Update(this.size);

				if (enemy instanceof SpaceJunk) {

					enemy.Draw(ctx, this.junkTexture);

				} else if (enemy instanceof Asteroid) {

					enemy.Draw(ctx, this.asteroidTexture);

				} else {

					enemy.Draw(ctx, this.shipsprite);

				}

			}

		}

		if (!this.player.active) {

			this.player.expTimer--;

			if (this.player.expTimer === 0) {

				if (this.player.lives > 0) {

					this.player.active = true;
					this.player.expTimer = 10;
					this.player.invinci += 100;

				} else {

					this.Lose();

				}

			}

		}

		this.player.Update(this.pressedKeys, this.size);

		// TODO: decide whether to draw bullets first,
		//		 or the player.
		//		 (currently player => bullets for the RailGun)

		this.player.Draw(ctx, this.shipsprite);

		for (var i = this.playerBullets.length - 1; i >= 0; i--) {

			var bullet = this.playerBullets[i];

			if (!bullet.active) {

				bullet.expTimer--;

				if (bullet.expTimer <= 0) this.playerBullets.splice(i, 1);

			}

			bullet.Update(this.size);

			bullet.Draw(ctx);

		}

		var newPopups = this.textPopups.slice(0);

		for (var i in this.textPopups) {

			if (!this.textPopups[i].active) newPopups.splice(i, 1);

			this.textPopups[i].Draw(ctx);

		}

		this.textPopups = newPopups;

		this.DOM_score.innerHTML = this.player.score;

		if (this.DOM_paused.style.display !== 'none') this.DOM_paused.style.display = 'none';

	}

	this.HandleCollisions = function () {

		for (var j in this.enemies) {

			var enemy = this.enemies[j];

			for (var i in this.playerBullets) {

				var bullet = this.playerBullets[i];

				if (bullet.active && enemy.active && Collides(bullet, enemy)) {

					if (bullet.exploding !== false) {

						if (this.player.lives > 0) this.player.score += Math.floor(500/enemy.size);

						bullet.Destroy();
						if (!bullet.proxyfused) enemy.Damage(bullet.damage * bullet.damage);

					} else {

						bullet.Destroy();

					}

				}

			}

			if (enemy.active && Collides(this.player, enemy)) {

				var dmg = Math.ceil(enemy.size);
				this.player.Damage(dmg);
				enemy.Destroy();

				if (!this.player.invinci) this.textPopups.push(new TextPopup('-' + dmg, false, 16, {'x': enemy.posn.x, 'y': enemy.posn.y}));
				if (this.player.invinci) this.player.score += Math.floor(500/enemy.size);

				//this.DOM_lives.innerHTML = this.player.lives;
				this.DOM_health.innerHTML = Math.floor(this.player.health);

			}

		}

	}

}

function GameLoop () {

	GAME.Loop();

}

function StartLoop () {

	GAME.loop = setInterval(GameLoop, 1000 / 30);

}

function StopLoop () {

	clearInterval(GAME.loop);

}

function TextPopup (text, color, size, posn) {
// TODO: should really extend GameObject
// TODO: sort out colors!!!

	this.active = true;
	this.txt = text;
	this.color = color || 'rgba(255,48,0,';
	this.posn = posn;
	this.size = size;

	this.age = 25;

	this.Draw = function (ctx) {

		if (this.age <= 0) {

			this.active = false;

		} else {

			ctx.beginPath();
			ctx.fillStyle = this.color + (this.age / 25) + ')';
			ctx.font = this.size + "px Droid Sans Mono";
			var dim = ctx.measureText(this.txt);
			ctx.fillText(this.txt, this.posn.x - dim.width/2, this.posn.y);
			ctx.fill();

			this.age--;

		}

	}

}

// ----------------------------------------- COLLISION DETECTION ----------------------------------------- //

function Collides (a, b) {

	if (a.centers.length > 1) {

		for (var i in a.centers) {

			var aposn = a.centers[i];

			if (b.centers.length > 1) {

				for (var j in b.centers) {

					var bposn = b.centers[j],
						res = InstanceCollides (a, b, aposn, bposn);

					if (res) return true;

				}

			} else return InstanceCollides (a, b, aposn, b.posn);

		}

	} else if (b.centers.length > 1) {

		for (var i in b.centers) {

			var bposn = b.centers[i],
				res = InstanceCollides (a, b, a.posn, bposn);

			if (res) return true;

		}

	} else {

		return InstanceCollides (a, b, a.posn, b.posn);

	}

	return false;
}

function InstanceCollides (a, b, aposn, bposn) {

	// vector between centers:
	var V = {'x': aposn.x - bposn.x, 'y': aposn.y - bposn.y},
		bsize = (a.proxyfused && b.size <= 20) ? 15 : b.size;

	if (a.active && b.active &&
		(V.x) * (V.x) + (V.y) * (V.y) <
		(a.size + bsize) * (a.size + bsize) * 2) {

		if (a.proxyfused && b.size <= 20) {

			//console.log('proxyfuse go BOOM at ' + a.posn.x + ',' + a.posn.y);
			return true;

		}

		var velocity = {'x': a.velo.x, 'y': a.velo.y};

		if (a.circular) {

			A = {'circular': true,
				 'posn': {'x': aposn.x, 'y': aposn.y},
				 'bPosn': {'x': bposn.x, 'y': bposn.y},
				 'r': a.size};
			B = TranslatePoints(b.points, b.theta, b.posn);

			return PolyInPoly(A, B, velocity);

		} else if (a.compositePoints) {

			for (var i in a.compositePoints) {

				var points = a.compositePoints[i];

				A = TranslatePoints(points, a.theta, aposn);
				B = TranslatePoints(b.points, b.theta, bposn);

				if (PolyInPoly(A, B, velocity)) return true;

			}

		} else {

			A = TranslatePoints(a.points, a.theta, aposn);
			B = TranslatePoints(b.points, b.theta, bposn);

			return PolyInPoly(A, B, velocity);

		}

	}

	return false;

}

function TranslatePoints (_arr, _theta, _center) {

	var res = [];

	for (var i in _arr) {

		var point = _arr[i],
			x = Math.cos(_theta)*(point.x) - Math.sin(_theta)*(point.y),
			y = Math.cos(_theta)*(point.y) + Math.sin(_theta)*(point.x);

		res.push({'x': x + _center.x, 'y': y + _center.y});

	}

	return res;

}

// http://www.isogenicengine.com/2010/10/13/spotlight-detecting-polygon-collision-in-javascript/
// DO NOT DELETE UNTIL CERTAIN WE HAVE BETTER!!
// TENDS TO BE V. SLOW!!
function PointInPoly (polyCords, point) {
 
	var i, j, c = 0;
 
	for (i = 0, j = polyCords.length - 1; i < polyCords.length; j = i++) {
 
		if (
			((polyCords[i].y > point.y) != (polyCords[j].y > point.y))
			 && 
			(point.x < (polyCords[j].x - polyCords[i].x) * (point.y - polyCords[i].y)
			 / (polyCords[j].y - polyCords[i].y) + polyCords[i].x)) {
			c = !c;
		}
 
	}
 
	return c;
 
}

function NormaliseVector (v) {

	// TODO: nasty, nasty Math.sqrt (not currently in use)
	var sum = Math.sqrt((v.x * v.x) + (v.y * v.y));

	return {'x': v.x/sum, 'y': v.y/sum};

}
function DotProduct(a, b) {

	return a.x * b.x + a.y * b.y;

}

// for details on this dark sourcery [sic] see:
// http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection
function IntervalDistance(A, B) {
    if (A.min < B.min) {
        return B.min - A.max;
    } else {
        return A.min - B.max;
    }
}

function ProjectPolygon (axis, poly) {
// return projection along given axis

	var dotProduct = DotProduct(axis, poly[0]),
		min = dotProduct,
		max = dotProduct;

	for (var i in poly) {

		var dotProduct = DotProduct(axis, poly[i]);

		if (dotProduct < min) {

			min = dotProduct;

		} else if (dotProduct > max) {

			max = dotProduct;

		}

	}

	return {'min': min, 'max': max};

}
function PolyInPoly (a, b, velo) {

	var res = true,
		edgeCountA = a.length,
		edgeCountB = b.length;

	// only one loop for speed:
	for (var i = 0; i < edgeCountA + edgeCountB; i++) {

		if (i < edgeCountA) {

			var i1 = (i === 0) ? edgeCountA - 1 : i - 1;
				edge = 	{'x': a[i].x - a[i1].x, 'y': a[i].y - a[i1].y};

		} else {

			var i1 = (i === edgeCountA) ? edgeCountB - 1 : i - edgeCountA - 1;
				edge = 	{'x': b[i- edgeCountA].x - b[i1].x, 'y': b[i- edgeCountA].y - b[i1].y};

		}

		var axis = {'x': - edge.y, 'y': edge.x},
			aProj = ProjectPolygon (axis, a),
			bProj = ProjectPolygon (axis, b);

		if (IntervalDistance(aProj, bProj) > 0) return false

		// test for posn + velo:
		/*var velocityProjection = DotProduct(axis, {'x': velo.x, 'y': velo.y});

		if (velocityProjection < 0) {

			aProj.min += velocityProjection;

		} else {

			aProj.max += velocityProjection;

		}

		if (IntervalDistance(aProj, bProj) > 0) return false*/

	} return true;

}
