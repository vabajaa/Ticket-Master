//vars
const Discord = require('discord.js');
const fs = require('fs');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


exports.func = async (client, message) => {
  //let Embed = CreateEmbed("Commands","This is nice list of all the commands","#93ff97");
  keyv.get(message.guild.id).then(async serverData => {

    if(!serverData){
      serverData.EmbedColor = '#42f462'
      serverData.Footer = 'No Server Data'
      serverData.Prefix = "t!"
      serverData.Timestamp = true
    }
    let Test = await CreateEmbed("Commands", "Current commands:", serverData.EmbedColor, serverData.Footer + " | " + client.guilds.size + " server(s) | Prefix: " + serverData.Prefix , serverData)
    
    fs.readdir('commands', function (err, items) {
      items.forEach(file => {
        let Info = require('./' + file).info

        if (Info) {
          Test.addField(Info.Command, Info.Description) 
        }
      })
      
      message.author.send(Test).catch(e => {

      })
    })
  })
}

exports.info = {
  Command: "help",
  Description: "View all the commands."
}