//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);



exports.func = async (client, message) => {
  var CanDoStuff = false

  keyv.get(message.guild.id).then(async serverData => {
    if (serverData) {
      message.member.roles.forEach(Role=>{
        if(Role.name && serverData.AdminRoleName && Role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase()){
          CanDoStuff = true
        }
      })
      if (message.member.hasPermission('ADMINISTRATOR')) {
        CanDoStuff = true
      }
      if (CanDoStuff) {
        //let embed = CreateEmbed("")
        var MentionedUser = message.mentions.members.first();
        var IsAlreadyBlacklisted = false
        if (MentionedUser) {
          if (!serverData.BlacklistedUsers) {
            serverData.BlacklistedUsers = []
          } else {
            serverData.BlacklistedUsers.forEach(User=>{
              if(User == MentionedUser.id) {
                IsAlreadyBlacklisted = true
              }
            })
          }
          if(!IsAlreadyBlacklisted){
            serverData.BlacklistedUsers.push(MentionedUser.id)

            keyv.set(message.guild.id, serverData)
            serverData.BlacklistedUsers.forEach(async User=>{
              if (User == MentionedUser.id) {
                var embed = await CreateEmbed("Data Saved","Your blacklist data was saved",serverData.EmbedColor,serverData.Footer,serverData)
                message.channel.send(embed)
              }
            })
          } else {
            var embed = await CreateEmbed("Already Blacklisted","This user is already blacklisted on this server",serverData.EmbedColor,serverData.Footer,serverData)
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
  Command: "blacklist",
  Description: "Blacklist a user from making tickets *ever*."
}