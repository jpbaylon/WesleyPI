const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')

var txt = 'lmao';

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
});


client.login('token');
