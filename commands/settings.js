//vars
const Discord = require('discord.js');
const CreateEmbed = require('../embed.js');

let Keyv = require('keyv');
let keyv = new Keyv('sqlite://GuildData.sqlite');

keyv.on('error', console.error);
//end of vars


exports.func = async (client, message) => {
  keyv.get(message.guild.id).then(async serverData => {
    let CanDoStuff = false
    
    message.member.roles.forEach(Role=>{
      if(Role.name && serverData.AdminRoleName && Role.name.toLowerCase() == serverData.AdminRoleName.toLowerCase()){
        CanDoStuff = true
      }
    })
    
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    
    if (CanDoStuff) {
      let Test = await CreateEmbed("Check your DMs", "Check your dms so we can ask you a few questions.", serverData.EmbedColor, serverData.Footer,serverData)
      
      message.reply("This command will be removed shortly, please use our web panel")

      let SettingsList = await CreateEmbed("Server Settings", "A list of settings you can edit!", serverData.EmbedColor, serverData.Footer,serverData)
      SettingsList.addField(`Current Basic Settings`,` \n Embed Color: ${serverData.EmbedColor} \n \n  Embed Footer: ${serverData.Footer} \n \n  Set Embed Timestamps: ${serverData.Timestamp} \n\n Support Role: ${serverData.SuportRoleName} \n\n Admin Role: ${serverData.AdminRoleName} \n\n View Ticket Role: ${serverData.ViewRoleName || "none"} \n\n Ticket Subject: ${serverData.Subject} \n \n Ticket Category: ${serverData.TicketChannel}`)
      SettingsList.addField(`Ticket Settings`,`Ticket Title: ${serverData.TicketTitle} \n\n Ticket Description: ${serverData.TicketDescription} \n \n DM Ticket: ${serverData.dmTicket} - DM the ticket creator when the ticket is closed with the transcript and reason. \n \n Reactions: ${serverData.Reactions} \n \n Reaction Message: ${serverData.ReactionMessage}`)
      SettingsList.addField(`Place Holders`,`You can use placeholders in your message to include things like there name or ticket number! \n \n $name - Will end up being the ticket creators name | eg: "Hello, $name" would be "Hello, vabajaa" \n \n $id - Will be the ticket number | eg: "TICKET: $id" would be "TICKET: 3" \n \n $mention - Will metion the ticket creator | eg: "Hey! $mention" would be "Hey! @user"`)
      SettingsList.addField(`How to edit a setting`,`If you would like to edit a setting, reply with the setting name and we will take it from there.`)
      message.channel.send(Test).catch(console.error)
      message.author.send(SettingsList).catch(console.error)
      
      message.author.createDM().then(async chan => { // it opens there dm? if its not closed. r i p check new-verify-bot for example
        let SettingToChange = ""
        
        const collector = new Discord.MessageCollector(message.author.dmChannel, m => m.author.id == message.author.id, { maxMatches: 4 });
        
        collector.on('collect', async msag => {
          let msg = msag.content.toLowerCase()
          
          if (SettingToChange == "") {
            if (msg == "reaction message" || msg == "reactions" || msg == "view ticket role" || msg == "embed color" || msg == "embed footer" || msg == "set embed timestamps" || msg == "timestamp" || msg == "support role" || msg == "admin role" || msg == "ticket title" || msg == "ticket description" || msg == "ticket subject" || msg == "ticket category" || msg == "dm ticket") {
              SettingToChange = msg
              
              let CSetting = await CreateEmbed("Setting Change", "What would you like this setting to be?", serverData.EmbedColor, serverData.Footer, serverData)
              
              if (serverData.Timestamp){
                CSetting.setTimestamp()
              }
              
              message.author.send(CSetting).catch(console.error)
            } else {
              let InccSett = await CreateEmbed("Invalid Setting", `Please send a vaild setting. Example: embed footer`, serverData.EmbedColor, serverData.Footer, serverData)
              
              if (serverData.Timestamp){
                InccSett.setTimestamp()
              }
              
              message.author.send(InccSett).catch(console.error)
            }
          } else {
            let New = msag.content
            
            if (SettingToChange == "embed color") {
              serverData.EmbedColor = New
            } else if (SettingToChange == "embed footer") {
              serverData.EmbedFooter = New
            } else if (SettingToChange == "set embed timestamps") {
              if (New == "true" || New == "yes") {
                serverData.Timestamp = "true"
              } else {
                serverData.Timestamp = "false"
              }
            } else if (SettingToChange == "timestamp") {
              if (New == "true" || New == "yes") {
                serverData.Timestamp = "true"
              } else {
                serverData.Timestamp = "false"
              }
            } else if (SettingToChange == "support role") {
              serverData.SuportRoleName = New
            } else if (SettingToChange == "admin role") {
              serverData.AdminRoleName = New
            } else if (SettingToChange == "view ticket role") {
              serverData.ViewRoleName = New
            } else if (SettingToChange == "log channel") {
              serverData.LogChannel = New
            } else if (SettingToChange == "ticket title") {
              serverData.TicketTitle = New
            } else if (SettingToChange == "ticket description") {
              serverData.TicketDescription = New
            } else if (SettingToChange == "ticket subject") {
              serverData.Subject = New
            } else if (SettingToChange == "ticket category") {
              serverData.TicketChannel = New
            } else if (SettingToChange == "dm ticket") {
              if (New == "true" || New == "yes") {
                serverData.dmTicket = true
              } else {
                serverData.dmTicket = false
              }
            } else if(SettingToChange == "reactions") {
              if (New == "true" || New == "yes") {
                serverData.Reactions = true
              } else {
                serverData.Reactions = false
              }
            } else if(SettingToChange == "reaction message"){
              serverData.ReactionMessage = New
            }
            keyv.set(message.guild.id, serverData)
            
            let Updated = await CreateEmbed("Setting Changed", "We have updated "+ SettingToChange + " to be " + New, serverData.EmbedColor, serverData.Footer, serverData)
            
            if (serverData.Timestamp == "true"){
              Updated.setTimestamp()
            }
            
            message.author.send(Updated).catch(console.error)
            collector.stop()
          }
        })
      }).catch(e => {//yes? add something if they closed  scroll up
        
      })
    } else {
      let Test = await CreateEmbed("You can't edit this!", "Permissions are too low, contact a TicketMaster Admin or an Administrator if you think this is incorrect.", serverData.EmbedColor, serverData.Footer, serverData)
      
      if (serverData.Timestamp == "true"){
        Test.setTimestamp()
      }
      
      message.channel.send(Test).catch(console.error)
    }
  })
}

exports.info = {
  Command: "settings",
  Description: "Edit the settings for your server."
}