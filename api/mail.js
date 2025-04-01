import nodemailer from "nodemailer"
import mailgunTransport from "nodemailer-mailgun-transport";
import { config } from 'dotenv';
config();

// Для использование через почту гугл и пароль от двойной аутентификации
// function init(){
//     try{
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.VITE_MAIL,
//           pass: process.env.VITE_MAIL_PASSWORD
//         }
//       });
//       transporter.options.sender = String(process.env.VITE_MAIL)
//       return transporter;
//     }catch(err){
//         console.log(err)
//     }
// }

// Решение на сервер через mailgun
const mailgunAuth = {
  auth: {
    api_key: process.env.VITE_MAILGUN_API,
    domain: process.env.VITE_MAILGUN_DOMAIN
  },
  host: 'api.eu.mailgun.net'
};


function init(){
    try{
      const transporter = nodemailer.createTransport(mailgunTransport(mailgunAuth));
      transporter.options.sender = "postmaster@24dctservice.ru";
      return transporter;
    }catch(err){
        console.log(err)
    }
}

let transporter = init();
export default transporter;