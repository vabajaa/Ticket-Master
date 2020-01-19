//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


exports.func = async (client, message) => {
  //let Embed = CreateEmbed("Commands","This is nice list of all the commands","#93ff97");
  let canruncommand = false
  
  keyv.get(message.guild.id).then(async serverData => {
    let CanDoStuff = false
    
    message.member.roles.forEach(Role=>{
      if (Role.name == serverData.AdminRoleName) {
        CanDoStuff = true
      }
    })
    
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    
    if (CanDoStuff) {
      let args = message.content.split(" ")
      if (message.content.startsWith(`<@${client.user.id}>`)) args.splice(0, 1)
      serverData.Prefix = args[1]
      
      if (!args[1]) serverData.Prefix = "t!"
      
      keyv.set(message.guild.id, serverData)
      
      let Test = await CreateEmbed("Prefix Set", "Your server prefix has been set to ``" + serverData.Prefix + '``', serverData.EmbedColor, serverData.Footer, serverData)
      message.channel.send(Test)
    } else {
      let Test = await CreateEmbed("You can't edit this!", "Permissions are too low, contact a TicketMaster Admin or an Administrator if you think this is incorrect.", serverData.EmbedColor, serverData.Footer, serverData)
      message.channel.send(Test)
    }
  })
}

exports.info = {
  Command: "setprefix",
  Description: "Set the prefix for the current server."
}