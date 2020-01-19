//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


exports.func = async (client, message) => {
  keyv.get(message.guild.id).then(async serverData => {
    let CanDoStuff = false
    let IsTicket = false
    

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
    
    serverData.OpenTickets.forEach(async Ticket => {
        if (message.channel.id == Ticket.Channel) {
          IsTicket = true
        }
    })
    
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    
    if (CanDoStuff && IsTicket) {
      let args = message.content.split(" ")
      let Thing = message.content.replace(args[0],"")
      Thing = Thing.replace(`<@${client.user.id}>`,"")
      Thing = Thing.replace(`new`,"")
      Thing = Thing.trim()

      let Mention = message.mentions.users && message.mentions.users.first() && message.mentions.users.first().tag || Thing
      let User = message.guild.members.find(user => user.user.tag.toLowerCase() == Mention.toLowerCase()) || message.guild.members.get(Mention) || message.guild.members.find(user => user.user.username.toLowerCase().startsWith(Mention.toLowerCase()))

      if (User) {
        //add user to ticket
        let Test = await CreateEmbed("Success", `<@${User.id}> was added to the ticket.`, serverData.EmbedColor, serverData.Footer, serverData)
        
        message.channel.overwritePermissions(User, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            ATTACH_FILES: true,
            READ_MESSAGE_HISTORY: true
          })
        
        message.channel.send(Test)
      } else {
        //no user found 
        let Test = await CreateEmbed("FAILED", "User not found. User: " + Mention, serverData.EmbedColor, serverData.Footer, serverData)
        
        message.channel.send(Test)
      }
    }
  })
}

exports.info = {
  Command: "adduser (user)",
  Description: "Add a user to a ticket."
}