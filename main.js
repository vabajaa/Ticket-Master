//vars
const Discord = require('discord.js');
const fs = require('fs');
const CreateEmbed = require('./embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);


//prefix 
let Prefix = "t!"

let DefaultSettings = {
  Footer: "Ticket Master",
  Prefix: "t!",
  Token: "",
  EmbedColor: "#8ff7bc",
  Reactions: false,
  ReactionMessage: "Please react below to create a ticket.",
  ReactMessages: [],
  Timestamp: true,
  Departments: [],
  SuportRoleName: "Support Team",
  AdminRoleName: "TicketMaster Admin",
  ViewRoleName: "Intern Support Team",
  UsingCustomBot: false,
  MaxTicketsPerPerson: "1",
  LogChannel: null,
  SaveTickets: true,
  TicketChannel: "tickets",
  Subject: "Note/Question/Subject",
  DmUsersTickets: true,
  TicketNumber: 0,
  TicketDescription: "Thanks for opening a ticket, we will be with you soon! While you wait why not get a drink?",
  TicketTitle: "Support Ticket",
  OpenTickets: [],
  Departments: [],
}

module.exports = async (client) => {
  if (client) {
    client.on('guildCreate', Guild => {
      console.log("Creating default settings for guild", Guild.name)
      
      keyv.get(Guild.id).then(settings => {
        if (!settings){
          keyv.set(Guild.id, DefaultSettings)
        }
      })
    })
    
    if(client.user.id == "553415729878138881"){ // :( id isn't difined.
      console.log("Main bot is logged in as", client.user.tag)
      client.user.setPresence({game: {name: "Tickets | t!help", type: "WATCHING"}, status: "online"}) 
      
      if (!process.env.BETA) {
        console.log('not beta')

      }
    }
    
    client.on('raw', packet => {
      // We don't want this to run on unrelated packets
      if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
      // Grab the channel to check the message from
      const channel = client.channels.get(packet.d.channel_id);
      // There's no need to emit if the message is cached, because the event will fire anyway for that
      if (channel.messages.has(packet.d.message_id)) return;
      // Since we have confirmed the message is not cached, let's fetch it
      channel.fetchMessage(packet.d.message_id).then(message => {
          // Emojis can have identifiers of name:id format, so we have to account for that case as well
          const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
          // This gives us the reaction we need to emit the event properly, in top of the message object
          const reaction = message.reactions.get(emoji);
          // Adds the currently reacting user to the reaction's users collection.
          if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
          // Check which type of event it is before emitting
          if (packet.t === 'MESSAGE_REACTION_ADD') {
              client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
          }
          if (packet.t === 'MESSAGE_REACTION_REMOVE') {
              client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
          }
      });
  });
  
  client.on('messageReactionAdd', async function(reaction, reactor) {
    if (reactor.bot) return;
    
    let serverData = await keyv.get(reaction.message.guild.id)
    let CanDoStuff = false
    let Member = reaction.message.guild.members.get(reactor.id)

    if (!Member || !serverData || !serverData.Reactions || !serverData.ReactMessages) return;
    
    Member.roles.forEach(Role=>{
      let roleName = Role.name

     if(roleName && serverData.SuportRoleName && roleName.toLowerCase() == serverData.SuportRoleName.toLowerCase() ){
        CanDoStuff = true
      }
    })
    
    Member.roles.forEach(Role=>{
      let roleName = Role.name
      if(roleName && serverData.AdminRoleName && roleName.toLowerCase() == serverData.AdminRoleName.toLowerCase() ){
        CanDoStuff = true
      }
    })
    
    if (Member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
   
    let IsTicket = false
    
    serverData.OpenTickets.forEach(ticket => {
      if (ticket.Channel == reaction.message.channel.id) IsTicket = ticket;
    })
    
    let CanOpenTicket = true
    
    let OpenTicketsNumber = 0
    
    serverData.OpenTickets.forEach(Ticket => {
      if (Ticket.Open == true && Ticket.Creator == reactor.id){
        OpenTicketsNumber = OpenTicketsNumber + 1
      }
    })

    if(serverData.BlacklistedUsers){
      serverData.BlacklistedUsers.forEach(User=>{
        if(User == reactor.id) {
          CanOpenTicket = false
        }
      })
    }
    if(OpenTicketsNumber >= Number(serverData.MaxTicketsPerPerson)){
      CanOpenTicket = false
    }
   // console.log(reaction.emoji.id, serverData.ReactMessages, CanOpenTicket)
    if (reaction.emoji.id == "582353646243545119" && IsTicket && CanDoStuff) {
      let message = reaction.message
      let Ticket = IsTicket
          message.channel.delete("Ticket closed!")
          
          if (serverData.LogChannel) {
            let Log = await CreateEmbed("Ticket Closed", `A ticket created by ${client.users.get(Ticket.Creator).username} was closed by ${reactor.username}`, serverData.EmbedColor, serverData.Footer, serverData)
            Log.addField(serverData.Subject, Ticket.subject)
            let Thing = "Closed by emoji"
                           
            let TicketLogs = ""
            
            Ticket.Chat.forEach(Chat => {
              TicketLogs = TicketLogs + `\n \n Message sent by ${client.users.get(Chat.sender).username} \n ${Chat.content}`
            })
            
             if (!fs.existsSync('./ticketlogs')){
                fs.mkdirSync('./ticketlogs');
              }
  
              fs.writeFile(`./ticketlogs/${Ticket.Number}.txt` , TicketLogs, function (err) {
                
              if (!err) { 
                Log.addField(`Reason`,Thing)
                
                if (serverData.LogChannel && client.channels.get(serverData.LogChannel)) {
                  client.channels.get(serverData.LogChannel).send(Log).catch(console.error);

                  if (serverData.dmTicket == true) {
 
                    if (client.users.get(Ticket.Creator)) {
     
                      client.users.get(Ticket.Creator).send(Log)
                      client.users.get(Ticket.Creator).send("Transcript", {
                        files: [
                          `./ticketlogs/${Ticket.Number}.txt` 
                        ]
                      })
                    }
                  }
                  client.channels.get(serverData.LogChannel).send("Logs", {
                    files: [
                      `./ticketlogs/${Ticket.Number}.txt` 
                    ]
                  }).then(function() {
                    fs.unlink(`./ticketlogs/${Ticket.Number}.txt` , (err) => {
                      if (err) console.log("OUR ERROR", err);

                    });
                  })
                  } else {
                    fs.unlink(`./ticketlogs/${Ticket.Number}.txt` , (err) => {
                      if (err) console.log("OUR ERROR", err);
                    
                    }); 
                  }
                  //Ticket.Open = false

                  serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
                  keyv.set(message.guild.id, serverData) // well rip i managed to create a file without the .txt ending.
                

                } else {
                  serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
                  console.log("FAILED TO SAVE", err) 
                }
            })
          } else {
             serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
             keyv.set(message.guild.id, serverData) // well rip i managed to create a file without the .txt ending. 
          }
    } else if (reaction.emoji.id == "582354169848135684" && serverData.ReactMessages.includes(reaction.message.id) && CanOpenTicket) {
      let TicketCategory = null
      
      reaction.message.guild.channels.forEach(Chan => {
        if (Chan.type == "category" && Chan.name.toLowerCase() == serverData.TicketChannel.toLowerCase()) {
          TicketCategory = Chan
        }
      })
      
      let TicketChan = null
     
        
      //if (message.content.startsWith(`<@${client.user.id}>`)) args.splice(0, 1)    
      
      let Thing = "No reason provided, opened via reaction."
      
      if (TicketCategory) {
        let TicketNumber = Number(serverData.TicketNumber) + 1
        
        var TicketChannel = await reaction.message.guild.createChannel('ticket-'+ TicketNumber,'text').catch(er=>{

        })
        //message.guild.createChannel('ticket-'+ TicketNumber,'text').then( async TicketChannel => {
        if(TicketChannel){

          let Desc = serverData.TicketDescription.replace('$id',TicketNumber)
          Desc = Desc.replace('$name',reactor.username)
          Desc = Desc.replace('$mention',`<@${reactor.id}>`)
          let TicketTitle = serverData.TicketTitle.replace('$id',TicketNumber)
          TicketTitle = TicketTitle.replace('$name',reactor.username)
          TicketTitle = TicketTitle.replace('$mention',`<@${reactor.id}>`)
          let Test = await CreateEmbed(TicketTitle, Desc, serverData.EmbedColor, serverData.Footer, serverData)

          TicketChan = TicketChannel
          TicketChannel.setParent(TicketCategory)
          let EveryoneRole = reaction.message.guild.roles.get(reaction.message.guild.id)
          let StaffRole = reaction.message.guild.roles.find(role => role.name.toLowerCase() == serverData.SuportRoleName.toLowerCase())
          let AdminRole = reaction.message.guild.roles.find(role => role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase())
          var ViewRole = null

          if (serverData.ViewRoleName) {
            ViewRole = reaction.message.guild.roles.find(role => role.name.toLowerCase() == serverData.ViewRoleName.toLowerCase()) 
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

          TicketChan.overwritePermissions(Member, {
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

          } else {
            Subject = "Subject"
          }
          Test.addField(Subject, Thing)

          TicketChannel.setParent(TicketCategory)
          
          TicketChannel.send(Test).then(message => {
            if (serverData.Reactions) {
              message.pin().catch(console.log)
              message.react(client.emojis.get("582353646243545119"))
            }
          }).catch(console.error)
          
          TicketChannel.setParent(TicketCategory)
          serverData.TicketNumber = TicketNumber
          serverData.OpenTickets.push({"Chat":[],"Open":true,"Number":TicketNumber,"Creator":reactor.id,"subject":Thing,"Channel":TicketChan.id})
          keyv.set(reaction.message.guild.id, serverData)
          TicketChannel.setParent(TicketCategory)
        //})
        }
        
      }
    }
  })
    
    client.on("message", message => {
      let args = message.content.split(" ")
      if (message.author.id == client.user.id) return;
      if (!message.guild) {
        let ServerPrefix = Prefix
        
        if (message.content.startsWith("t!prefix")) {
          return message.reply("The server prefix is:", ServerPrefix) 
        }
        
        if (message.content.startsWith(ServerPrefix) || message.content.startsWith(`<@${client.user.id}>`)) {
          if (message.content.startsWith(`<@${client.user.id}>`)) args.splice(0, 1)
          
          args[0] = args[0].replace(ServerPrefix, "")
          args[0] = args[0].replace(`<@${client.user.id}>`, "")
          args[0] = args[0].toLowerCase()
          
          console.log("User is trying to run " + args[0])

          if (fs.existsSync('./commands/' + args[0] + '.js')) {
            let File = require('./commands/' + args[0] + '.js')
            File.func(client, message)
          }
        } else if (message.content.startsWith('t!help')) {
           let File = require('./commands/help.js')
           File.func(client, message)
        }
        return;
      };

      keyv.get(message.guild.id).then(serverData => {
        let ServerPrefix = serverData && serverData.Prefix || Prefix
        
        if (message.content.startsWith(ServerPrefix) || message.content.startsWith(`<@${client.user.id}>`)) {
          if (message.content.startsWith(`<@${client.user.id}>`)) args.splice(0, 1)
          
          args[0] = args[0].replace(ServerPrefix, "")
          args[0] = args[0].replace(`<@${client.user.id}>`, "")
          args[0] = args[0].toLowerCase()
          
          console.log("User is trying to run " + args[0])

          if (fs.existsSync('./commands/' + args[0] + '.js')) {
            let File = require('./commands/' + args[0] + '.js')
            File.func(client, message)
          }
        } else if (message.content.startsWith('t!help')) {
           message.content = message.content.replace('t!', serverData.Prefix)
           let File = require('./commands/help.js')
           File.func(client, message)
        }
      })
      keyv.get(message.guild.id).then(serverData => {
        if(!serverData) {
          console.log("Set " + message.guild.id + " To default settings or server " + message.guild.name)
          keyv.set(message.guild.id, DefaultSettings)
        }
        if (serverData.OpenTickets) {
          serverData.OpenTickets.forEach(Ticket => {
            //console.log(message.channel.id + "/" + Ticket.Channel)
            if (Ticket.Channel == message.channel.id) {
              Ticket.Chat.push({"content":message.content,"id":message.id,"channel":message.channel.id,"sender":message.author.id})
              keyv.set(message.guild.id, serverData)
            }
          })
        }
      })
    })
  }
}