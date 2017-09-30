// --------------------------------------------- GLOBALS ------------------------------------------------------//

var GAME = new Game();

var DEBUGGING = false;

// --------------------------------------------- INITIALISATION ------------------------------------------------------//

function Init () {

	var ship_select = document.getElementById('ship_select'),
		retry_btn = document.getElementById('retry_btn'),
		resume_btn = document.getElementById('resume_btn'),
		menu_btn = document.getElementById('menu_btn'),
		help_back_btn = document.getElementById('help-back'),
		hiscores = document.getElementById('hi-score-link'),
		help = document.getElementById('help-link'),
		clear_btn = document.getElementById('clear_data_btn'),
		start_form = document.getElementById('intro_form'),
		default_ship = 'scout';

	// Feature detection:
	if (!document.createElement('canvas').getContext('2d')) {

		alert('Your browser doesn\'t support canvas so the game won\'t work. Sorry!');

		window.location.href = '/';

	} else {

		SetupDOM(true);

		retry_btn.addEventListener('click', Start);
		resume_btn.addEventListener('click', HiScores);
		hiscores.addEventListener('click', HiScores);
		help.addEventListener('click', ShowHelp);
		help_back_btn.addEventListener('click', ShowIntro);
		menu_btn.addEventListener('click', ShowIntro);
		clear_btn.addEventListener('click', ClearData);
		start_form.addEventListener('submit', Start);

	}

}

function Start (e) {

	CancelEvent(e);

	// prevent unwanted 'enter' behavior
	// TODO: improve!
	if (e.type === 'submit' && GAME.player && GAME.player.lives > 0) return;

	var size = {'x': window.innerWidth, 'y': window.innerHeight },
		player_name = document.getElementById('player_name').value || 'PLAYER 1';

	sessionStorage.setItem('player_name', player_name);
	
	for (var i in SHIPS) {

		var SHIP = SHIPS[i],
			rad = document.getElementById(SHIP.id);

		if (rad.checked) {

			var ship = SHIP;

			sessionStorage.setItem('ship', i);

		}

	}
		
	GAME.Init(size, new Player(player_name, ship, {'x': size.x/2, 'y': 3*size.y/4 }));

}

window.addEventListener('load', Init);

// --------------------------------------------- EVENTS ------------------------------------------------------//

function CancelEvent(e) {

    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;

    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;

}

function KeyDown (e) {

	var key = GetKey(e.keyCode);

	if (key) GAME.pressedKeys[key] = true;

	//console.log(e.keyCode);

}

function KeyUp (e) {

	var key = GetKey(e.keyCode);

	if (key) GAME.pressedKeys[key] = false;

	if (key === 'p') GAME.running = !GAME.running;

	if (key === 'h') GAME.ShowHiScores(false);

}

function ShipFocusScroll (e) {

	var id = e.target.id,
		fieldset = e.target.parentNode,
		labels = fieldset.getElementsByTagName('label'),
		label = null;

	for (var i in labels) {

		if (labels[i].htmlFor === id) {

			label = labels[i];

		}

	}

	label.scrollIntoView(true);

}

function HiScores(e) {

	CancelEvent(e);

	GAME.ShowHiScores();

}

function ClearData(e) {

	CancelEvent(e);

	if (confirm('Are you sure you want to delete all scores and unlocked ships?')) {

		localStorage.removeItem('unlocked');
		localStorage.removeItem('scores');

		window.location.href = window.location.href;

	}

}

function GetKey (_code) {

	switch (_code) {

		case 16:
			return 'shft';
			break;
		case 17:
			return 'ctrl';
			break;
		case 32:
			return 'spce';
			break;
		case 65:
		case 37:	// left arrow
			return 'a';
			break;
		case 68:
		case 39:	// right arrow
			return 'd';
			break;
		case 69:
			return 'e';
			break;
		case 72:
			return 'h';
			break;
		case 75:
			return 'k';
			break;
		case 76:
			return 'l';
			break;
		case 80:
			return 'p';
			break;
		case 81:
			return 'q';
			break;
		case 83:
		case 40:	// down arrow
			return 's';
			break;
		case 87:
		case 38:	// up arrow
			return 'w';
			break;
		default:
			return false;
			break;
	}	

}

