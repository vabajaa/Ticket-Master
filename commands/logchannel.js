//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


exports.func = async (client, message) => {
  keyv.get(message.guild.id).then(async serverData => {
    let CanDoStuff = false
    
    message.member.roles.forEach(Role=>{
      if(Role.name && serverData.AdminRoleName && Role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase()){
        CanDoStuff = true
      }
    })
    
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    
    if (CanDoStuff) {
      let ChannelMention = message.mentions.channels.first()

      if (ChannelMention) {
        serverData.LogChannel = ChannelMention.id
        keyv.set(message.guild.id, serverData)
        var embed = await CreateEmbed("Saved!", "We have saved your log channel to <#" + ChannelMention.id + ">. \n \n If this is incorrect please run the command again", serverData.EmbedColor, serverData.Footer,serverData)
        message.channel.send(embed)
      } else {
        var embed = await CreateEmbed("We have an issue.", "You need to mention a vaild channel!!", serverData.EmbedColor, serverData.Footer,serverData)
        message.channel.send(embed)
      }
    }
  })
}

exports.info = {
  Command: "logchannel #channel",
  Description: "Sets the servers log channel"
}