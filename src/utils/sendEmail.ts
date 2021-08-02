"use strict";
import nodemailer from "nodemailer";
export async function sendEmail(to: string, text: string) { 
  try {
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: 'grs73upghltqdaoi@ethereal.email',
          pass: 'pUHrGH1RyubNRdVVDr',
        },
      });
    
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>',
        to: to,
        subject: "Hello ✔",
        text,
      });
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.log(err);
  }
}
