const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')

var txt = 'lmao';
var runningID = 0;
var challenges = [];

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
});

client.on('message', msg => {
	// basic ping
	if (msg.content === 'ping') {
		msg.channel.send('@everyone');
	}

	// read abc.txt
	if (msg.content === 'readfile') {
		txt = fs.readFileSync('./abc.txt', {"encoding": "utf-8"});
		msg.channel.send(txt);
	}

	// write to abc.txt
	if (msg.content == 'writefile') {
		fs.appendFile('./abc.txt', '\ngood morning', (err) => {
			if (err) throw err;
		});
	}

	if (msg.content == 'yes') { // accepted challenge
		var foundChallenge = challenges.find(function(challenge) { // find the challenge
			return challenge.getChallenged == msg.author.id;
		});

		if (foundChallenge != undefined) {
			msg.channel.send("<@" + foundChallenge.getChallenger + ">, <@" + msg.author.id + "> has accepted your challenge. Initiating game..."); // accepted challenge
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

			else { 
				challenges.push(new Challenge(msg.author.id, msg.mentions.members.first().id)); // add a new challenge to the array
				msg.channel.send("" + splitMessage[1] + ", <@" + msg.author.id + "> has challenged you!\nDo you accept the challenge? Reply with 'yes' or 'no'"); // notify the user that they have been challenged
				console.log('Challenges size: ' + challenges.length);
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
	}
});


client.login('token');
