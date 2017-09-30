function SetupDOM (_alert) {

	var ship_select = document.getElementById('ship_select'),
		default_ship = 'scout';

	// Feature detection:
	if (!Storage && _alert) {

		alert('Your browser doesn\'t support localStorage, so high scores won\'t work. Sorry!');

	} else if (Storage) {

		var stored = localStorage.getItem('scores'),
			scores = (stored) ? JSON.parse(stored) : {'scores':[]},
			ships = localStorage.getItem('unlocked'),
			unlocked = (ships) ? JSON.parse(ships).ships : [];
			score_table = document.getElementById('hi-scores'),
			player_name = sessionStorage.getItem('player_name'),
			player_ship = sessionStorage.getItem('ship');

		WriteHiScoreTable(scores, score_table);

		for (var i in unlocked) SHIPS[unlocked[i]].locked = false;
		

		if (player_ship) default_ship = player_ship;

		if (player_name) {

			document.getElementById('player_name').value = player_name;
			document.getElementById('player_name_out').innerHTML = player_name;

		}

	}

	if (SHIPS[default_ship].locked) default_ship = 'scout';

	ship_select.innerHTML = '';

	for (var i in SHIPS) {

		var ship = SHIPS[i],
			div = OutputShipInfoDiv(ship);
			input = document.createElement('input'),
			label = document.createElement('label'),
			txt = document.createTextNode(ship.type);

		if (ship.locked) {

			var req = document.createElement('span');

			req.appendChild(document.createTextNode(ship.requirement + ' points'));
			req.className = 'lockedSpan';

			label.appendChild(req);

		}

		input.id = ship.id;
		input.type = 'radio';
		input.name = 'ship';
		input.value = ship.id;
		label.htmlFor = ship.id;

		input.addEventListener('focus', ShipFocusScroll);

		label.appendChild(div);
		label.appendChild(txt);
		ship_select.appendChild(input);
		ship_select.appendChild(label);

		if (i == default_ship) {

			input.checked = 'true';
			input.autofocus = 'true';
			ShipFocusScroll({'target': input});

		}

		if (ship.locked) input.disabled = 'true';

	}

}

function OutputShipInfoDiv (ship, addClass) {

	var div = document.createElement('div'),
		speed_wrap = document.createElement('div'),
		speed_txt = document.createElement('p'),
		speed = document.createElement('div'),
		health_wrap = document.createElement('div'),
		health_txt = document.createElement('p'),
		health = document.createElement('div'),
		guns = document.createElement('p'),
		secondary = document.createElement('p');

	div.style.backgroundPosition = ship.sprite.x * -64 + 'px ' + ship.sprite.y * -64 + 'px, left bottom';

	// stats:

	// TODO: use actual max values to get %ages

	speed.style.width = ship.accel / 0.2 * 100 + '%';
	speed_wrap.appendChild(speed);
	speed_txt.appendChild(document.createTextNode('speed'));
	speed_wrap.appendChild(speed_txt);
	div.appendChild(speed_wrap);

	health.style.width = ship.health / 300 * 100 + '%';
	health_wrap.appendChild(health);
	health_txt.appendChild(document.createTextNode('hull'));
	health_wrap.appendChild(health_txt);
	div.appendChild(health_wrap);

	var G = 0;

	for (var i in ship.guns) {

		var g = ship.guns[i];

		if (g[4] === '1') {

			G += 1;

		}

	}

	guns.appendChild(document.createTextNode(G + ' gun' + ((G === 1) ? '' : 's')));
	div.appendChild(guns);

	secondary.appendChild(document.createTextNode(ship.secondary));
	div.appendChild(secondary);

	// :end stats

	if (addClass) div.className = 'shipdisplay';

	return div;

}

function WriteHiScoreTable(scores, table) {

	table.innerHTML = '';

	//console.log(scores);

	for (var i in scores.scores.slice(0, 10)) {

		var s = scores.scores[i],
			tr = document.createElement('tr')
			td1 = document.createElement('td'),
			td2 = document.createElement('td'),
			td3 = document.createElement('td'),
			td4 = document.createElement('td');

		td1.innerHTML = s.player;
		td2.innerHTML = s.ship;
		td3.innerHTML = 'Level ' + s.level;
		td4.innerHTML = s.score;

		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);

		if (s.thistime) tr.className = 'last_game';

		table.appendChild(tr);

	}

}

function ShowIntro (e) {

	if (e) CancelEvent(e);

	var intro = document.getElementById('intro');

	if (GAME.player) {
	
		// clear current game for new one:

		StopLoop();
		document.body.removeChild(GAME.DOM_canvas);
		GAME = new Game();

	}

	HideOutro();
	HideHelp();

	// reset ships and stuff:
	SetupDOM(false);

	intro.style.opacity = 1;
	intro.style.height = '100%';
	intro.style.fontSize = '1em';
	
}
function HideIntro (e) {

	if (e) CancelEvent(e);

	var intro = document.getElementById('intro');

	intro.style.opacity = 0;
	intro.style.height = 0;
	intro.style.fontSize = 0;

}

function ShowOutro (e) {

	if (e) CancelEvent(e);

	var outro = document.getElementById('outro');

	HideIntro();

	outro.style.opacity = 1;
	outro.style.height = '100%';
	outro.style.fontSize = '1em';
	
}
function HideOutro (e) {

	if (e) CancelEvent(e);

	var outro = document.getElementById('outro');

	outro.style.opacity = 0;
	outro.style.height = 0;
	outro.style.fontSize = '1em';

}

function ShowHelp (e) {

	if (e) CancelEvent(e);

	var help = document.getElementById('help');

	HideIntro();

	help.style.opacity = 1;
	help.style.height = '100%';
	help.style.fontSize = '1em';
	
}
function HideHelp (e) {

	if (e) CancelEvent(e);

	var help = document.getElementById('help');

	help.style.opacity = 0;
	help.style.height = 0;
	help.style.fontSize = 0;

}
