//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);

exports.func = async (client, message) => {
  keyv.get(message.guild.id).then(async serverData => {
    let CanDoStuff = false
    
    message.member.roles.forEach(Role => {
      if (Role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase()) {
        CanDoStuff = true
      }
    })
    
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    
    if (CanDoStuff) {
      let Test = await CreateEmbed("Open Tickets", "Current Open Tickets:", serverData.EmbedColor, serverData.Footer, serverData)
      
      serverData.OpenTickets.forEach(ticket => {
        Test.addField(`Ticket ${ticket.Number}`, `Created by: ${ticket.Creator}\n\nSubject: ${ticket.subject}\n\nChannel: <#${ticket.Channel}>`)
      })
      
      message.author.send(Test).catch(async error => {
        let Failed = await CreateEmbed("DMs Closed", "Your DMs are currently closed. Please allow people other than your friends to DM you and try the command again. err: " + error , serverData.EmbedColor, serverData.Footer, serverData)
         
        message.channel.send(Failed).catch(console.error)
      })
    } else {
      let Test = await CreateEmbed("You can't edit this!", "Permissions are too low, contact a TicketMaster Admin or an Administrator if you think this is incorrect.", serverData.EmbedColor, serverData.Footer, serverData)
      
      message.channel.send(Test).catch(console.error)
    }
  })
}

exports.info = {
  Command: "viewtickets",
  Description: "View all open tickets in the current server."
}