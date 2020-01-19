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

      if (!serverData.Departments) {
        serverData.Departments = []
        keyv.set(message.guild.id,serverData) 

        let embed = await CreateEmbed("No departments", "This server has not created any departments ", serverData.EmbedColor, serverData.Footer, serverData)
        message.channel.send(embed)
        return
      }

      let args = message.content.split(' ')
      let depart = null 
      let ticket = null 

      serverData.OpenTickets.forEach( async Ticket => {
        if (message.channel.id == Ticket.Channel) {
          ticket = Ticket
        }
      })
      
      serverData.Departments.forEach(async department => {
        if (department.name.toLowerCase() == args[1].toLowerCase()) {
          depart = department
        }
      })
      

      //console.log(depart)
      
      message.guild.channels.map(channel => {
        if (channel.type == "category" && channel.name == depart.category) {
          console.log("found")
          depart.id = channel.id
        } else {
          //console.log(channel.type + " | " + channel.name + " =/ " + depart.category)
        }
      })

      if (depart && depart.id) {
        if (ticket) {

          message.channel.setParent(depart.id, "Moving ticket, requested by " + message.author.username)

          let EveryoneRole = message.guild.roles.get(message.guild.id)
          let StaffRole = message.guild.roles.find(role => role.name.toLowerCase() == serverData.SuportRoleName.toLowerCase())
          let AdminRole = message.guild.roles.find(role => role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase())
          var ViewRole = null

          if (serverData.ViewRoleName) {
            ViewRole = message.guild.roles.find(role => role.name.toLowerCase() == serverData.ViewRoleName.toLowerCase()) 
          }

          let TicketChan = message.channel

          if (depart.name.toLowerCase() == serverData.TicketChannel.toLowerCase()) {
            if (StaffRole) {
              TicketChan.overwritePermissions(StaffRole, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                ATTACH_FILES: true,
                READ_MESSAGE_HISTORY: true
              })
            }

            if (AdminRole) {
              TicketChan.overwritePermissions(AdminRole, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: true
              })
            }

            if (ViewRole) {
              TicketChan.overwritePermissions(ViewRole, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: false
              })
            }
          } else {
            setTimeout(function() {
              if (StaffRole) {
                TicketChan.overwritePermissions(StaffRole, {
                  VIEW_CHANNEL: false,
                  SEND_MESSAGES: false,
                  ATTACH_FILES: false,
                  READ_MESSAGE_HISTORY: false
                })
              }
            }, 1000)

            setTimeout(function() {
              if (ViewRole) {
                TicketChan.overwritePermissions(ViewRole, {
                  VIEW_CHANNEL: false,
                  SEND_MESSAGES: false,
                  READ_MESSAGE_HISTORY: false,
                  ATTACH_FILES: false
                })
              }
            }, 2000)
            
          }
          
          let embed = await CreateEmbed("Moved!", "Switched department.", serverData.EmbedColor, serverData.Footer, serverData)
          message.channel.send(embed)
        } else {
          message.reply('no ticket')
        }
      } else {
        message.reply("no department called " + args[1])
      }
    }
  })
}

exports.info = {
  Command: "move <Department Name>",
  Description: "Move the the ticket to a department."
}