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
      if(roleName && serverData.AdminRoleName && roleName.toLowerCase() == serverData.AdminRoleName.toLowerCase() ){
        CanDoStuff = true
      }
    })
    if (message.member.hasPermission('ADMINISTRATOR')) {
      CanDoStuff = true
    }
    if (CanDoStuff) {
      if (!serverData.Reactions) {
        let Embed = await CreateEmbed("Reactions not Enabled", `Please enable the reactions setting.`, serverData.EmbedColor, serverData.Footer, serverData)
        
        message.channel.send(Embed).catch(console.log)
        
        return 
      } else if (!serverData.ReactionMessage) {
        let Embed = await CreateEmbed("Invalid Message", `Please create a reaction message in the settings.`, serverData.EmbedColor, serverData.Footer, serverData)
        
        message.channel.send(Embed).catch(console.log)
        
        return 
      }
      
      message.delete().catch(console.log)
      
      message.channel.send(serverData.ReactionMessage).then(message => {
        message.pin().catch(console.log)
        message.react(client.emojis.get("582354169848135684"))
        
        if (!serverData.ReactMessages) {
          serverData.ReactMessages = []
        }
        
        serverData.ReactMessages.push(message.id)
        
        keyv.set(message.guild.id, serverData)
      }).catch(console.log)
    }
  })
}

exports.info = {
  Command: "reaction",
  Description: "Create a reaction message in the channel the command is executed in."
}