/*
READ ME!

Alot of code was removed from this project to ensure privacy of users. However in the process this may have broken some things. If you encounter a bug i'll be of support until 
2/1/2020
MM/DD/YY


*/
const express = require('express');
const app = express();
const Discord = require('discord.js');

var Glitch = false

let UnhandledHook = new Discord.WebhookClient("WebHOOKID", "webhook TOKEN!")

process.on('unhandledRejection', async (reason, p) => {
  let Embed = new Discord.RichEmbed()
  
  Embed.setTitle(":x: Unhandled Promise Rejection")
  Embed.setDescription("There has been an unhandled promise rejection caught")
  Embed.addField("Reason", reason.stack && reason.stack.substring(0, 1500) || reason)
  Embed.setColor("#ff0000")
  
  UnhandledHook.send(Embed).catch(function() {
    console.log(reason, reason.stack)
  })
}); 

let MainClient = null
let MainJS = require(`./main.js`)
let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');
let fs = require('fs')

app.use(express.static('public'));



















//process.env.PORT
if (!Glitch) {
  app.listen(3010)
} else {
  app.listen(process.env.PORT)
}



function boot(){
  let Client = new Discord.Client();
  
  if (Glitch) { // This was used for a testing enviroment. 
    Client.login('TOKEN').catch(error => {
      console.log("Failed to login to beta bot.", error)
    })
  } else { // Production Bot
    Client.login('TOKEN').catch(error => {
      console.log("Failed to login.", error)
    })
  }

  
  Client.on('ready', () => {
    
    MainJS(Client) //Main bot startup
    MainClient = Client

    if (!Glitch) {
    }
    
  })
}


//call the boot function

boot()

app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});

process.on('SIGTERM', () => {
  console.log("Server shutting down :(")
  
  process.exit(1)
});
