import nodemailer from "nodemailer"

function init(){
    try{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tramvai00105@gmail.com',
          pass: 'rjme tdeg dyil sein'
        }
      });
      return transporter;
    }catch(err){
        console.log(err)
    }
}

let transporter = init();
export default transporter;