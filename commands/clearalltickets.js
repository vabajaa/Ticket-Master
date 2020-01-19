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
      let roleName = Role.name
      if(roleName && serverData.AdminRoleName && roleName.toLowerCase() == serverData.AdminRoleName.toLowerCase() ){
        CanDoStuff = true
      }
    })
    
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    
    if (CanDoStuff) {
      message.guild.channels.forEach(Channel => {
        if(Channel.name.startsWith("ticket-") && Channel.type == "text"){
          if (!serverData.LogChannel) {
            Channel.delete("Clear All Tickets")
          } else if(serverData.LogChannel.id == Channel.id) {
            
          } else {
            Channel.delete("Clear All Tickets")
          }
        }
      })

      serverData.OpenTickets = []
      keyv.set(message.guild.id, serverData)
      
      let embed = CreateEmbed("Tickets Cleared", "All tickets have been cleared for this server.", serverData.EmbedColor, serverData.Footer, serverData)
    
      message.channel.send(embed)  
    }
  })
}
exports.info = {
  Command: "clearalltickets",
  Description: "Clears and resets all open tickets within a server."
}