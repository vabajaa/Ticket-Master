//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


exports.func = async (client, message) => {
  var CanDoStuff = false

  if (message.member.hasPermission('ADMINISTRATOR')) {
    CanDoStuff = true
  }
  
  keyv.get(message.guild.id).then(async serverData => {
    if (serverData) {
      message.member.roles.forEach(Role=>{
        if(Role.name && serverData.AdminRoleName && Role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase()){
          CanDoStuff = true
        }
      })
      if (CanDoStuff) {
        //let embed = CreateEmbed("")
        var MentionedUser = message.mentions.members.first();
        var IsBlacklisted = false
        if (MentionedUser) {
          if (!serverData.BlacklistedUsers) {
            serverData.BlacklistedUsers = []
          } else {
            serverData.BlacklistedUsers.forEach(User=>{
              if(User == MentionedUser.id) {
                IsBlacklisted = true
              }
            })
          }
          if(IsBlacklisted){
            var Number = -1
            serverData.BlacklistedUsers.forEach(User=>{
              Number = Number + 1
              if (User == MentionedUser.id) {
                User = '0'
                serverData.BlacklistedUsers[Number] = 0 
              }
            })
            //console.log(serverData.BlacklistedUsers)
            keyv.set(message.guild.id, serverData)
            var embed = await CreateEmbed("Data Saved","Your blacklist data was saved",serverData.EmbedColor,serverData.Footer,serverData)
            message.channel.send(embed)
          } else {
            var embed = await CreateEmbed("Not Blacklisted","This user is not blacklisted on this server",serverData.EmbedColor,serverData.Footer,serverData)
            message.channel.send(embed)
          }
        } else {
          var embed = await CreateEmbed("Missing User","You need to mention a user to run this command",serverData.EmbedColor,serverData.EmbedFooter,serverData)
          message.channel.send(embed)
        }
      } else {
        var embed = await CreateEmbed("You need to have a higher role","You can't run this command right now. If you think this is a mistake contact suport or a server admin",serverData.EmbedColor,serverData.Footer,serverData)
        message.channel.send(embed)
      }
    } else {
      let embed = CreateEmbed("Server data missing!", "Somthing's gone wrong and your settings are missing. Please re-add the bot to this server or contact support.", '#f44242', 'ERROR WHILE FETCHING DATA', null)
      message.channel.send(embed)
    }
  })
}

exports.info = {
  Command: "unblacklist",
  Description: "Unblacklist a user from making tickets."
}