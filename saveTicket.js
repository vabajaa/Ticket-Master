const fs = require('fs')

module.exports = async (Name, Data) => {

  if (!fs.existsSync('./ticketLogs')){
    fs.mkdirSync('./ticketLogs');
  }
  
  fs.writeFile('./ticketLogs/' + Name, Data, function (err) {
    //console.log("error", err)
    if (err) {
      console.log("error", err)
      return err 
    } else {

      return 'ticketLogs/' + Name 
    }
  })
}