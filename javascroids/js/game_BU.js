// --------------------------------------------- GAME CLASS ------------------------------------------------------//

function Game () {

	this.pressedKeys = {'w': false, 'a': false, 's': false, 'd': false,
					'q': false, 'e': false, 'l': false, 'k': false,
					'h': false, 'p': false},

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
		this.DOM_intro.style.opacity = 0;
		this.DOM_intro.style.height = 0;
		this.DOM_outro.style.opacity = 0;
		this.DOM_outro.style.height = 0;

		this.DOM_canvas.style.cursor = 'none';

	}

	this.Loop = function () {

		if (this.running) {

			this.Update();

			this.Draw();

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
			this.ShowHiScores(true, scores);

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

		}

	}

	this.ShowHiScores = function (_final, _scores) {

		var table = this.DOM_hiscores || document.getElementById('hi-scores'),
			intro = this.DOM_intro || document.getElementById('intro'),
			outro = this.DOM_outro || document.getElementById('outro'),
			resume = this.DOM_resume || document.getElementById('resume_btn'),
			retry = this.DOM_retry || document.getElementById('retry_btn');

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

					} else {

						document.getElementById('main-score').style.display = 'block';
						retry.style.display = 'inline-block';

					}

					resume.style.display = 'none';

				} else {

					document.getElementById('main-score').style.display = 'block';
					resume.style.display = 'inline-block';
					retry.style.display = 'inline-block';

				}

			}

		} else {

			this.running = true;

			HideOutro();

		}

	}

	this.AddEnemies = function () {

		// new level:

		for (var i = 0; i < 3 + Math.floor(this.level/5); i++) {

			this.enemies.push(new Asteroid());
			this.enemies.push(new SpaceJunk());

		}

		for (var i = 0; i < Math.floor(this.level/2 * Math.random()); i++) {

			this.enemies.push(new EnemyFighter());

		}

	}

	this.Update = function () {

		// TODO: D.R.Y.

		this.HandleCollisions();

		this.player.Update(this.pressedKeys, this.size);

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

		if (this.enemies.length === 0) {

			this.WinLevel();

		} else {

			for (var i in this.enemies) {

				var enemy = this.enemies[i];

				enemy.Update(this.size);

				if(!enemy.active) {

					enemy.expTimer--;

					if (enemy.expTimer === 0) this.enemies.splice(i, 1);

				}

			}

		}

		for (var i in this.playerBullets) {

			var bullet = this.playerBullets[i];

			bullet.Update(this.size);

			if(!bullet.active) {

				bullet.expTimer--;

				if (bullet.expTimer === 0) this.playerBullets.splice(i, 1);

			}

		}

		for (var i in this.textPopups) {

			if (!this.textPopups[i].active) this.textPopups.splice(i, 1);

		}

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

				if (!this.player.invinci) this.textPopups.push(new TextPopup('-' + dmg, false, {'x': enemy.posn.x, 'y': enemy.posn.y}));
				if (this.player.invinci) this.player.score += Math.floor(500/enemy.size);

				//this.DOM_lives.innerHTML = this.player.lives;
				this.DOM_health.innerHTML = Math.floor(this.player.health);

			}

		}

	}

	this.Draw = function () {

		var ctx = this.ctx,
			bounds = this.size,
			sprite = this.shipsprite;

		ctx.clearRect(0,0,this.size.x,this.size.y);

		for (var i in this.enemies) {

			if (this.enemies[i] instanceof SpaceJunk) {

				this.enemies[i].Draw(ctx, bounds, this.junkTexture);

			} else if (this.enemies[i] instanceof Asteroid) {

				this.enemies[i].Draw(ctx, bounds, this.asteroidTexture);

			} else {

				this.enemies[i].Draw(ctx, bounds, sprite);

			}

		}

		for (var i in this.playerBullets) {

			this.playerBullets[i].Draw(ctx, bounds);

		}

		this.player.Draw(ctx, bounds, sprite);

		for (var i in this.textPopups) {

			this.textPopups[i].Draw(ctx);

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

function TextPopup (text, color, posn) {
// TODO: should really extend GameObject

	this.active = true;
	this.txt = text;
	this.color = color || 'rgba(255,48,0,';
	this.posn = posn;

	this.age = 25;

	this.Draw = function (ctx) {

		if (this.age <= 0) {

			this.active = false;

		} else {

			ctx.beginPath();
			ctx.fillStyle = this.color + (this.age / 25) + ')';
			ctx.font = "16px Droid Sans Mono";
			var dim = ctx.measureText(this.txt);
			ctx.fillText(this.txt, this.posn.x - dim.width/2, this.posn.y);
			ctx.fill();

			this.age--;

		}

	}

}

// ----------------------------------------- COLLISION DETECTION ----------------------------------------- //

function Collides (a, b) {

	// find vector between centers:
	var V = {'x': a.posn.x - b.posn.x, 'y': a.posn.y - b.posn.y};

	if (a.active && b.active &&
		(V.x) * (V.x) + (V.y) * (V.y) <
		(a.size + b.size) * (a.size + b.size) * 2) {

		if (a.proxyfused) return true;

		var velocity = {'x': a.velo.x, 'y': a.velo.y};

		if (a.circular) {

			A = {'circular': true,
				 'posn': {'x': a.posn.x, 'y': a.posn.y},
				 'bPosn': {'x': b.posn.x, 'y': b.posn.y},
				 'r': a.size};
			B = TranslatePoints(b.points, b.theta, b.posn);

			return PolyInPoly(A, B, velocity);

		} else {

			A = TranslatePoints(a.points, a.theta, a.posn);
			B = TranslatePoints(b.points, b.theta, b.posn);

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

// for details on this dark sourcery [sic] see:
// http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection
function DotProduct(a, b) {

	return a.x * b.x + a.y * b.y;

}

function NormaliseVector (v) {

	// TODO: nasty, nasty Math.sqrt
	var sum = Math.sqrt((v.x * v.x) + (v.y * v.y));

	return {'x': v.x/sum, 'y': v.y/sum};

}

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
		var velocityProjection = DotProduct(axis, {'x': velo.x, 'y': velo.y});

		if (velocityProjection < 0) {

			aProj.min += velocityProjection;

		} else {

			aProj.max += velocityProjection;

		}

		if (IntervalDistance(aProj, bProj) > 0) return false

	} return true;

}
