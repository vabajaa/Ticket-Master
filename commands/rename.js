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
      let args = message.content.split(" ") 
      let Thing = message.content.replace(args[0], "")
      Thing = Thing.replace(`<@${client.user.id}>`,"")
      Thing = Thing.replace(`new`,"")
      Thing.replace(` `,"-")
      serverData.OpenTickets.forEach(Ticket => {
        if (Ticket.Channel == message.channel.id) {
          let Number = message.channel.name.split('-')[1]
          message.channel.setName(Thing+"-"+ Ticket.Number).then(Chan => {
            let Embed = CreateEmbed("Renamed Ticket", `This ticket has been renamed to #${Thing}-${Ticket.Number}.`, serverData.EmbedColor, serverData.Footer, serverData)
          })
        }
      })
    }
  })
}

exports.info = {
  Command: "rename",
  Description: "Renames the current ticket, 'ticket-1' to 'dont-close-1'"
}