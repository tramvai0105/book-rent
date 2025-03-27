import nodemailer from "nodemailer"
import { config } from 'dotenv';
config();

function init(){
    try{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.VITE_MAIL,
          pass: process.env.VITE_MAIL_PASSWORD
        }
      });
      return transporter;
    }catch(err){
        console.log(err)
    }
}

let transporter = init();
export default transporter;