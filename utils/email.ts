import nodemailer from 'nodemailer';

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  // html?:string,  // Uncomment if you want to send HTML emails
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 0,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Active in gmail "Less secure app access"
    // service:'Gmail',
  });

  const mailOptions = {
    from: 'noreply@natours.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};
