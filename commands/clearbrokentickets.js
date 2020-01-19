//vars
const Discord = require('discord.js');

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
        var Keep = false
        
        serverData.OpenTickets.forEach(Ticket=>{
          if(Ticket.Channel == Channel.id){
            Keep = true
          }
        })
        
        let split = Channel.name.split('-')
        
        if (!split || !Number(split[1])) {
          Keep = true 
        }
        
        if(!Keep){
          Channel.delete("Ticket was broken and called to fixed.")
        }
      })
      
      serverData.OpenTickets.forEach(Ticket=>{
        if(!Ticket.Open){
          serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
        }
        
        let TicketChannel
        
        try{
           TicketChannel = client.channels.get(Ticket.Channel)
        }
        catch(er){
          serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
        }
        
        if (!TicketChannel) {
          serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
        }
      })
      
      keyv.set(message.guild.id, serverData)
    }
  })
}
exports.info = {
  Command: "clearbrokentickets",
  Description: "Clears all broken tickets."
}