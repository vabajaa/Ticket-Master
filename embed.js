//vars
const Discord = require('discord.js');
//end of vars

module.exports = async (Name, Description, Color, Footer, serverData) => {
  let embed = new Discord.RichEmbed();
  
  if (serverData && serverData.Timestamp){
    embed.setTimestamp()
  } else if (!serverData) {
    embed.setTimestamp()
  }
  
  embed.setTitle(Name)
  embed.setDescription(Description)
  embed.setColor(Color)
  embed.setFooter(Footer)

  return embed
}