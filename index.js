const { config } = require("dotenv");
config()

let url = process.env.WAURL 
let session = process.env.WASESSION 
let to = process.env.WATO 
let isGroup = process.env.WAISGROUP 
let host = process.env.MAILHOST 
let user = process.env.MAILUSER 

const notifier = require('mail-notifier');
/* */
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.stdoutMuted = true;

rl.question('Hostname: '+host+'\nUsername: '+user+'\nPassword: ', function(password) {
  console.log('\n\nServer is up and running ...\n');
  rl.close();

  const imap = {
    user: user,
    password: password,
    host: host,
    port: 993, // imap port
    tls: true,// use secure connection
    tlsOptions: { rejectUnauthorized: false }
  };
  
  const n = notifier(imap);
  
  n.on('end', () => n.start()) // session closed
    .on('mail', mail => {
      // console.log(mail,"\n\n")    
  
      let subject = mail.subject
      let from = mail.from[0].name + " <" + mail.from[0].address + ">"
      let text = mail.text
  
      let str = "*[Email Masuk]*\n" +
        user + "@" + host + "\n\n" +
        "From : " + from + "\n" +
        "Subject : " + subject + "\n"
     
      if(subject.indexOf("ETTD")>=0 || subject.indexOf("Form Permintaan")>=0)
        str += "-- -- -- -- --\n\n" + text
  
  /*    if(mail.attachments.length>0){
        str += "Attachments:\n"
        mail.attachments.forEach((el) => {
          str += el.fileName + " - " + el.length + "\n"
        })
      }
  */
  
      kirim_wa(str)
      save_log("{From : " + from + "} {Subject : " + subject + "}")
    })
    .start();
    
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};
/* */

const axios = require('axios');
const qs = require('qs');
const fs = require("fs");

async function kirim_wa(text)
{
  let data = qs.stringify({
    'session': session.trim(),
    'to': to.trim(),
    'text': text.trim(),
    'isGroup': isGroup 
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: { },
    data : data
  };
  
  //await sleep(2000);
  const dateTimeObject = new Date();
  let date_ob = new Date(dateTimeObject.getTime())// + (8 * 3600 * 1000));
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  let now = hours + ":" + minutes + ":" + seconds;

  axios.request(config)
  .then((response) => {
    console.log(now + " " + JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(now)
    console.log(error);
  });
}

function save_log(text)
{
  const dateTimeObject = new Date();
  
  let date_ob = new Date(dateTimeObject.getTime())// + (8 * 3600 * 1000));
  
  let year = date_ob.getFullYear();
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let day = ("0" + date_ob.getDate()).slice(-2);
  let today = year + "-" + month + "-" + day;

  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  let now = hours + ":" + minutes + ":" + seconds;

  var logFile = fs.createWriteStream("logs/" + today + ".txt", {flags: "a"});
  logFile.write(now + "\n" + text + "\n");
}