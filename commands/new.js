//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


exports.func = async (client, message) => {
  keyv.get(message.guild.id).then(async serverData => {
    let CanOpenTicket = true
    
    let OpenTicketsNumber = 0
    
    serverData.OpenTickets.forEach(Ticket => {
      if (Ticket.Open && Ticket.Creator == message.author.id){
        OpenTicketsNumber = OpenTicketsNumber + 1
      }
    })

    if(serverData.BlacklistedUsers){
      serverData.BlacklistedUsers.forEach(User=>{
        if(User == message.author.id) {
          CanOpenTicket = false
        }
      })
    }
    if(OpenTicketsNumber >= Number(serverData.MaxTicketsPerPerson)){
      CanOpenTicket = false
    }
    if (CanOpenTicket) {
      let TicketCategory = null
      
      message.guild.channels.forEach(Chan => {
        if (Chan.type == "category" && Chan.name.toLowerCase() == serverData.TicketChannel.toLowerCase()) {
          TicketCategory = Chan
        }
      })
      
      let TicketChan = null
      let args = message.content.split(" ")
        
      //if (message.content.startsWith(`<@${client.user.id}>`)) args.splice(0, 1)    
      
      let Thing = message.content.replace(args[0], "")
      //Thing = Thing.replace(`<@${client.user.id}>`,"")
      Thing = Thing.replace(`new`,"")

      if (TicketCategory) {
        let TicketNumber = Number(serverData.TicketNumber) + 1
        
        var TicketChannel = await message.guild.createChannel('ticket-'+ TicketNumber,{type: 'text'}).catch(er=>{
          if (er){
            message.reply("We're missing permissions to create channels.")
          }
        })
        //message.guild.createChannel('ticket-'+ TicketNumber,'text').then( async TicketChannel => {
        if(TicketChannel){

          let Desc = serverData.TicketDescription.replace('$id',TicketNumber)
          Desc = Desc.replace('$name',message.author.username)
          Desc = Desc.replace('$mention',`<@${message.author.id}>`)
          let TicketTitle = serverData.TicketTitle.replace('$id',TicketNumber)
          TicketTitle = TicketTitle.replace('$name',message.author.username)
          TicketTitle = TicketTitle.replace('$mention',`<@{message.author.id}>`)
          let Test = await CreateEmbed(TicketTitle, Desc, serverData.EmbedColor, serverData.Footer, serverData)

          TicketChan = TicketChannel
          TicketChannel.setParent(TicketCategory)
          let EveryoneRole = message.guild.roles.get(message.guild.id)
          let StaffRole = message.guild.roles.find(role => role.name.toLowerCase() == serverData.SuportRoleName.toLowerCase())
          let AdminRole = message.guild.roles.find(role => role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase())
          var ViewRole = null

          if (serverData.ViewRoleName) {
            ViewRole = message.guild.roles.find(role => role.name.toLowerCase() == serverData.ViewRoleName.toLowerCase()) 
          }

          TicketChan.overwritePermissions(EveryoneRole, {
             VIEW_CHANNEL: false,
             SEND_MESSAGES: false,
          })

          TicketChan.overwritePermissions(client.user, {
              VIEW_CHANNEL: true,
              SEND_MESSAGES: true,
              ATTACH_FILES: true,
              READ_MESSAGE_HISTORY: true,
              EMBED_LINKS: true
          })

          TicketChan.overwritePermissions(message.member, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            ATTACH_FILES: true,
            READ_MESSAGE_HISTORY: true
          })

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

          if (!Thing) Thing = "No note given.";
          if (Thing == "") Thing = "No note given";
          if (Thing == " ") Thing = "No note given";

          let Notif = await CreateEmbed("Ticket Created", `Your ticket was successfully made in channel <#${TicketChan.id}>` , serverData.EmbedColor, serverData.Footer, serverData)
          var Subject = ""
          Subject = serverData.Subject
          if(serverData && serverData.Subject && serverData.Subject != ""){
            Subject = Subject.replace('$name',message.author.username)
            Subject = Subject.replace('$mention',`<@{message.author.id}>`)
            Subject = Subject.replace('$id',TicketNumber)
          } else {
            Subject = "Subject"
          }
          Test.addField(Subject, Thing)

          message.channel.send(Notif).catch(console.error)
          TicketChannel.setParent(TicketCategory)
          
          TicketChannel.send(Test).then(message => {
            if (serverData.Reactions) {
              message.pin().catch(console.log)
              message.react(client.emojis.get("582353646243545119"))
            }
          }).catch(console.error)
          
          TicketChannel.setParent(TicketCategory)
          serverData.TicketNumber = TicketNumber
          serverData.OpenTickets.push({"Chat":[],"Open":true,"Number":TicketNumber,"Creator":message.author.id,"subject":Thing,"Channel":TicketChan.id})
          keyv.set(message.guild.id, serverData)
          TicketChannel.setParent(TicketCategory)
        //})
        }
        
      } else {
        let Embed = await CreateEmbed("Ticket Creation Failed", `Please set the ticket category and try again.`, serverData.EmbedColor, serverData.Footer, serverData) 
        message.channel.send(Embed)
        message.author.send(Embed)
      }
    } else {
      let Notif = await CreateEmbed("Ticket Creation Failed", `You already have a ticket open or you've been blacklisted!` , serverData.EmbedColor, serverData.Footer, serverData)
      message.channel.send(Notif).catch(console.error)
    }
  })
}

exports.info = {
  Command: "new",
  Description: "Creates a new ticket. One ticket per a user allowed."
}