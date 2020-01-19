//vars
const Discord = require('discord.js');
const fs = require('fs');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);
//end of vars


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
      serverData.OpenTickets.forEach(async Ticket => {
        if (message.channel.id == Ticket.Channel) {
          message.channel.delete("Ticket closed!")
          
          serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
          keyv.set(message.guild.id, serverData) // well rip i managed to create a file without the .txt ending.

          if (serverData.LogChannel) {
            let Log = await CreateEmbed("Ticket Closed", `A ticket created by ${client.users.get(Ticket.Creator).username} was closed by ${message.author.username}`, serverData.EmbedColor, serverData.Footer, serverData)
            Log.addField(serverData.Subject, Ticket.subject)
            let args = message.content.split(" ")
            let Thing = message.content.replace(args[0],"")
            Thing = Thing.replace(`<@${client.user.id}>`,"")
            Thing = Thing.replace(`new`,"")
            if (!Thing) {Thing = "No reason provided."}
                           
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

                  try {

                  } catch(er) {
                    
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


                

                } else {
                  serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
                  keyv.set(message.guild.id, serverData) // well rip i managed to create a file without the .txt ending.
                  console.log("FAILED TO SAVE", err) 
                }
            })
          } else {
             serverData.OpenTickets.splice(serverData.OpenTickets.indexOf(Ticket), 1)
             keyv.set(message.guild.id, serverData) // well rip i managed to create a file without the .txt ending. 
          }
        }
      })
    }
  })
}

exports.info = {
  Command: "close",
  Description: "Closes the ticket for the current channel."
}