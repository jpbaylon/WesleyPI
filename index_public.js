const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')

var txt = 'lmao';
var runningID = 0;
var challenges = [];
var validMoves = ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"];

class Challenge {
	constructor(challengerID, challengedID) {
		this.challengerID = challengerID;
		this.challengedID = challengedID;
	}
	
	get getChallenger() {
		return this.challengerID;
	}

	get getChallenged() {
		return this.challengedID;
	}
}

class GameManager {
	constructor() {
		this.ongoingGames = [];
	}

	gameFile(id) {
		var pair = this.ongoingGames.find(pair => pair.getID == id);
		if (pair == undefined)
			return undefined;
		else
			return pair.getGameFile;
	}

	contains(id) {
		var pair = this.ongoingGames.find(pair => pair.getID == id);
		if (pair == undefined)
			return false;
		else
			return true;
	}

	remove(id) {
		var pair = this.ongoingGames.find(pair => pair.getID == id);
		if (pair != undefined)
			this.ongoingGames = removeA(this.ongoingGames, pair);
	}

	add(id, gameFile) {
		this.ongoingGames.push(new GameIDPair(id, gameFile));
	}

	get length() {
		return this.ongoingGames.length;
	}
}

var gameManager = new GameManager();

// dictionary, the user's ID points to the gamefile they are involved in
class GameIDPair {
	constructor(userID, gameFile) {
		this.userID = userID;
		this.gameFile = gameFile;
	}

	get getID() {
		return this.userID;
	}

	get getGameFile() {
		return this.gameFile;
	}
}

// class to read a file, write to it, and make moves on the game
class GameInterpreter {
	constructor(fileArguments) {
		this.crossID = fileArguments[0];
		this.circleID = fileArguments[1];
		this.currentTurn = parseInt(fileArguments[2]);
		this.gameBoard = new Array(3);
		for (var i = 0; i < 3; i++) {
			this.gameBoard[i] = new Array(3);
		}

		var counter = 0; // parse through the board
		this.usedSpaces = 0;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				this.gameBoard[i][j] = fileArguments[3].charAt(counter);
				if (fileArguments[3].charAt(counter) != 2)
					this.usedSpaces++;
				counter++;
			}
		}
	}

	get getCrossID() {
		return this.crossID;
	}

	get getCircleID() {
		return this.circleID;
	}

	get getCurrentTurn() {
		return this.currentTurn;
	}

	// make move to the board
	move(id, row, col) {
		if ((this.crossID != this.circleID) && (((this.crossID == id) && (this.currentTurn == 1)) || ((this.circleID == id) && (this.currentTurn == 0))))
			throw "wait";

		if (this.gameBoard[row][col] != 2)
			throw "used";
		// make move
		this.gameBoard[row][col] = this.currentTurn;
		this.usedSpaces++;

		// check for win
		if (row == col) { // check for left diagonal
			if (this.gameBoard[0][0] == this.gameBoard[1][1] && this.gameBoard[1][1] == this.gameBoard[2][2]) {
				throw "" + this.currentTurn + " victory";
			}
		}

		if ((row == 1 && col == 1) || (row == 2 && col == 0) || (row == 0 && col == 2)) { // check for right diagonal
			if (this.gameBoard[2][0] == this.gameBoard[1][1] && this.gameBoard[1][1] == this.gameBoard[0][2])
				throw "" + this.currentTurn + " victory";
		}

		if (this.gameBoard[row][0] == this.gameBoard[row][1] && this.gameBoard[row][1] == this.gameBoard[row][2]) { // check for row victory
			throw "" + this.currentTurn + " victory";
		}
		
		if (this.gameBoard[0][col] == this.gameBoard[1][col] && this.gameBoard[1][col] == this.gameBoard[2][col]) { // check for column victory
			throw "" + this.currentTurn + " victory";
		}
		
		// check for draw
		if (this.usedSpaces == 9)
			throw "draw";

		// change the turn and move AI if neccessary
		if (this.currentTurn == 0) {
			this.currentTurn = 1;
			if (this.circleID == -1) {
				var nextMove = parseInt(this.easyTTT()); // get a move to play
				console.log(nextMove);
				this.move(-1, Math.floor(nextMove / 3), nextMove % 3); // recurssive call to make the move
			}
		}
		else {
			this.currentTurn = 0;
			if (this.crossID == -1) {
				var nextMove = parseInt(this.easyTTT()); // get a move to play
				console.log(nextMove);
				this.move(-1, Math.floor(nextMove / 3), nextMove % 3); // recurssive call to make the move
			}
		}
	}

	// write to file
	writeToFile(filename) {
		var data = "" + this.crossID + "\n" + this.circleID + "\n" + this.currentTurn + "\n";
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				data = data.concat(this.gameBoard[i][j]);
			}
		}
		fs.writeFileSync(filename, data);
	}

	// convert the board to a displayable board post
	get toString() {
		console.log(this.gameBoard);
		var result = "```  1   2   3\n    |   |\nA ";
		for (var i = 0; i < 2; i++) {
			result = result.concat(this.numberToLetter(this.gameBoard[0][i]) + " | ");
		}
		result = result.concat(this.numberToLetter(this.gameBoard[0][2]) + "\n    |   |\n --- --- ---\n    |   |\nB ");
		for (var i = 0; i < 2; i++) {
			result = result.concat(this.numberToLetter(this.gameBoard[1][i]) + " | ");
		}
		result = result.concat(this.numberToLetter(this.gameBoard[1][2]) + "\n    |   |\n --- --- ---\n    |   |\nC ");
		for (var i = 0; i < 2; i++) {
			result = result.concat(this.numberToLetter(this.gameBoard[2][i]) + " | ");
		}
		result = result.concat(this.numberToLetter(this.gameBoard[2][2]) + "\n    |   |```");
		console.log(result);
		return result;
	}

	// convert gamespace numbers to characters
	numberToLetter(x) {
		switch(x) {
			case 0:
				return 'X';
				break;
			case "0":
				return 'X';
				break;
			case 1:
				return 'O';
				break;
			case "1":
				return 'O';
				break;
			default:
				return ' ';
		}
	}

	// easy Tic-Tac-Toe AI
	// find the open spaces and fill a space
	easyTTT() {
		var openSpaces = []; // 1d array to keep track of the open spaces
		var counter = 0; // keep track of spaces
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (this.gameBoard[i][j] == '2' || this.gameBoard[i][j] == 2)
					openSpaces.push(counter);
				counter++;
			}
		}

		return openSpaces[Math.floor(Math.random() * openSpaces.length)]; // return a random space to play in
	}
}

// function to remove an element from an array
// stolen from stackoverflow
function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax=arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}


client.on('ready', () => {
	console.log('Logged in as ${client.user.tag}!');
	client.user.setActivity("job, your job", {type: 'PLAYING'});
});

client.on('message', msg => {
	// basic ping
	if (msg.content === 'ping') {
		msg.channel.send('@everyone');
	}

	if (msg.content == 'yes') { // accepted challenge
		var foundChallenge = challenges.find(function(challenge) { // find the challenge
			return challenge.getChallenged == msg.author.id;
		});

		if (foundChallenge != undefined) {
			msg.channel.send("<@" + foundChallenge.getChallenger + ">, <@" + msg.author.id + "> has accepted your challenge. Initiating game..."); // accepted challenge

			var firstTurn = Math.floor(Math.random() * 2); // determine who has to go first
			var gameFileName;
			var currentGame;
			if (firstTurn == 0) { // challenger goes first
				gameFileName = "" + foundChallenge.getChallenger + ".txt";
				fs.writeFileSync(gameFileName, foundChallenge.getChallenger + "\n" + msg.author.id + "\n0\n222222222", (err) => { // write to the new data file
					if (err) throw err;
				});
				currentGame = new GameInterpreter([foundChallenge.getChallenger, msg.author.id, "0", "222222222"]);
			}
			else { // challenger goes second
				gameFileName = "" + msg.author.id + ".txt";
				fs.writeFileSync(gameFileName, msg.author.id + "\n" + foundChallenge.getChallenger + "\n0\n222222222", (err) => {
					if (err) throw err;
				});
				currentGame = new GameInterpreter([msg.author.id, foundChallenge.getChallenger, "0", "222222222"]);
			}

			// point user IDs to the gamefile
			gameManager.add(msg.author.id, gameFileName);
			gameManager.add(foundChallenge.getChallenger, gameFileName);
			console.log('Game Manager size: ' + gameManager.length);

			// generate post for initiated game
			console.log(gameFileName);
			var post = currentGame.toString;

			post = post.concat("\n<@" + currentGame.getCrossID + ">, it is your turn!\nMove with commands such as 'a1', 'c3', etc\nEnter &abort to end the game.");

			msg.channel.send(post);

			removeA(challenges, foundChallenge); // remove challenge
			console.log('Challenges size: ' + challenges.length);
		}
	}

	if (msg.content == 'no') { // rejected challenge
		var foundChallenge = challenges.find(function(challenge) { // find the challenge
			return challenge.getChallenged == msg.author.id;
		});

		if (foundChallenge != undefined) {
			msg.channel.send("<@" + foundChallenge.getChallenger + ">, <@" + msg.author.id + "> has declined your challenge."); // decline challenge
			removeA(challenges, foundChallenge); // remove challenge
			console.log('Challenges size: ' + challenges.length);
		}
	}

	if (validMoves.includes(msg.content)) { // tic-tac-toe move
		if (gameManager.contains(msg.author.id)) { // they are playing a game currently
			var contents = fs.readFileSync(gameManager.gameFile(msg.author.id), "utf8"); 
			console.log(contents);
			var currentGame = new GameInterpreter(contents.split("\n"));
			try {
				currentGame.move(msg.author.id, msg.content.charCodeAt(0) - "a".charCodeAt(0), msg.content.charCodeAt(1) - "1".charCodeAt(0)); // run the move on the game
				
				// normal result with ongoing game
				var post = currentGame.toString;

				if (currentGame.getCurrentTurn == 0) {
					post = post.concat("\n<@" + currentGame.getCrossID + ">, it is your turn.");
				} else {
					post = post.concat("\n<@" + currentGame.getCircleID + ">, it is your turn.");
				}

				msg.channel.send(post);
				currentGame.writeToFile(gameManager.gameFile(msg.author.id));
			}
			catch(err) {
				switch (err) { // various results
					case "wait":
						msg.channel.send("Wait for your turn!");
						break;
					case "used":
						msg.channel.send("That spot is already used!");
						break;
					case "0 victory":
						var post = currentGame.toString;
						if (currentGame.getCircleID == -1)
							post = post.concat("\n<@" + currentGame.getCrossID + ">, I've lost the game. Good game.");
						else if (currentGame.getCrossID == -1)
							post = post.concat("\nYes! <@" + currentGame.getCircleID + ">, I've won. Good game.");
						else
							post = post.concat("\n<@" + currentGame.getCircleID + ">, " + "<@" + currentGame.getCrossID + "> has won the game!");
						msg.channel.send(post);
						fs.unlinkSync(gameManager.gameFile(msg.author.id));
						gameManager.remove(currentGame.getCrossID);
						gameManager.remove(currentGame.getCircleID);
						console.log("Game Manager size: " + gameManager.length);
						break;
					case "1 victory":
						var post = currentGame.toString;
						if (currentGame.getCrossID == -1)
							post = post.concat("\n<@" + currentGame.getCircleID + ">, I've lost the game. Good game.");
						else if (currentGame.getCircleID == -1)
							post = post.concat("\nYes! <@" + currentGame.getCrossID + ">, I've won. Good game.");
						else
							post = post.concat("\n<@" + currentGame.getCrossID + ">, " + "<@" + currentGame.getCircleID + "> has won the game!");
						msg.channel.send(post);
						fs.unlinkSync(gameManager.gameFile(msg.author.id));
						gameManager.remove(currentGame.getCrossID);
						gameManager.remove(currentGame.getCircleID);
						console.log("Game Manager size: " + gameManager.length);
						break;
					case "draw":
						var post = currentGame.toString;
						if (currentGame.getCrossID == -1 || currentGame.getCircleID == -1)
							post = post.concat("\n<@" + msg.author.id + ">, looks like we drew. Good game.");
						else
							post = post.concat("\n<@" + currentGame.getCrossID + "> and " + "<@" + currentGame.getCircleID + ">, this game ends in a draw!");
						msg.channel.send(post);
						fs.unlinkSync(gameManager.gameFile(msg.author.id));
						gameManager.remove(currentGame.getCrossID);
						gameManager.remove(currentGame.getCircleID);
						console.log("Game Manager size: " + gameManager.length);
				}
			}
		}
	}

	// check for identifier character
	if (msg.content.charAt(0) == '&') {
		var modMessage = msg.content; // get a copy of the message to edit
		modMessage = modMessage.substring(1);
		var splitMessage = modMessage.split(" "); // split up the arguments into separate array values
		if (splitMessage[0] == 'challenge') {
			if (splitMessage.length != 2) // unexpected number of arguments
				msg.channel.send("Expected 1 argument");

			else if (msg.mentions.members.first() == null) // no one was challenged
				msg.channel.send("You have to challenge someone!");

			else if (challenges.find(function(challenge) {
				return challenge.getChallenger == msg.author.id;
			}) != undefined) // user has already sent a challenge
				msg.channel.send("You have already issued a challenge.");

			else if (challenges.find(function(challenge) {
				return challenge.getChallenged == msg.mentions.members.first().id;
			}) != undefined) // user was already challenged
				msg.channel.send("" + msg.mentions.members.first().user.username + " has already been challenged.");

			else if (challenges.find(function(challenge) {
				return challenge.getChallenged == msg.author.id;
			}) != undefined) // user has to answer a challenge
				msg.channel.send("" + msg.author.username + ", please answer your challenge before challenging another.");
			else if (gameManager.contains(msg.author.id)) { // challenge author is already in a game
				msg.channel.send("You are already in a game!");
			}
			else if (gameManager.contains(msg.mentions.members.first().id)) {
				msg.channel.send(msg.mentions.members.first().user.username + " is already in a game.");
			}
			else { 
				msg.channel.send("" + splitMessage[1] + ", <@" + msg.author.id + "> has challenged you!\nDo you accept the challenge? Reply with 'yes' or 'no'\n(Enter &cancel to cancel the challenge)"); // notify the user that they have been challenged
				if (msg.mentions.members.first().id == client.user.id) { // challenging the bot
					msg.channel.send("Oh, you're challenging me? Game on then."); // accepted challenge

					
					var firstTurn = Math.floor(Math.random() * 2); // determine who has to go first
					
					var gameFileName;
					var currentGame;
					
					 if (firstTurn == 0) { // challenger goes first
						gameFileName = "" + msg.author.id + ".txt";
						fs.writeFileSync(gameFileName, msg.author.id + "\n-1\n0\n222222222", (err) => { // write to the new data file
							if (err) throw err;
						});
						currentGame = new GameInterpreter([msg.author.id, -1, "0", "222222222"]);
					 }
					
					else { // challenger goes second
						gameFileName = "" + msg.author.id + ".txt";
						currentGame = new GameInterpreter([-1, msg.author.id, "0", "222222222"]);

						var nextMove = parseInt(currentGame.easyTTT()); // get a move to play
						console.log(nextMove);
						currentGame.move(-1, Math.floor(nextMove / 3), nextMove % 3); // recurssive call to make the move
						currentGame.writeToFile(gameFileName);
					}
					

					// point user ID to the gamefile
					gameManager.add(msg.author.id, gameFileName);
					console.log('Game Manager size: ' + gameManager.length);

					// generate post for initiated game
					var post = currentGame.toString;

					post = post.concat("\n<@" + msg.author.id + ">, it is your turn!\nMove with commands such as 'a1', 'c3', etc\nEnter &abort to end the game.");

					msg.channel.send(post);

				}
				else { // challenging a user
					challenges.push(new Challenge(msg.author.id, msg.mentions.members.first().id)); // add a new challenge to the array
					console.log('Challenges size: ' + challenges.length);
				}
			}
		}
		if (splitMessage[0] == 'cancel') { // cancel a challenge
			var cancel = challenges.find(function(challenge) { // find the user's challenge to cancel
				return challenge.getChallenger == msg.author.id;
			});

			if (cancel != undefined) {
				msg.channel.send("Challenge cancelled.");
				removeA(challenges, cancel);
				console.log('Challenges sizes: ' + challenges.length);
			}
		}
		if (splitMessage[0] == 'abort') { // exit a game
			if (gameManager.contains(msg.author.id)) {
				var contents = fs.readFileSync(gameManager.gameFile(msg.author.id), "utf8"); 
				var currentGame = new GameInterpreter(contents.split("\n"));
				msg.channel.send("Game aborted.");
				fs.unlinkSync(gameManager.gameFile(msg.author.id));
				gameManager.remove(currentGame.getCrossID);
				gameManager.remove(currentGame.getCircleID);
			}
		}
	}
});


client.login('token');
