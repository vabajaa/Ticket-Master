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

     if(roleName && serverData.SuportRoleName && roleName.toLowerCase() == serverData.SuportRoleName.toLowerCase() ){
        CanDoStuff = true
      }
    })
    
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
      const Args = message.content.split(' ')
      if(Args[1]){
        serverData.OpenTickets.forEach(async Ticket => {
          if(Number(Args[1]) == Ticket.Number){
            
            serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
            keyv.set(message.guild.id, serverData).catch(async er=>{
              if(er){
                var embed = await CreateEmbed("Failure", "There was a issue while saving.",serverData.EmbedColor,serverData.Footer,serverData)
                message.channel.send(embed)
              }
            })
            
          }
        })
      } else {
        var embed = await CreateEmbed("Failure", "You didn't specify a ticket number.",serverData.EmbedColor,serverData.Footer,serverData)
        message.channel.send(embed)
      }
    }
    
  })
}

exports.info = {
  Command: "superclose",
  Description: "Force close an open ticket (Will wipe ticket data)"
}