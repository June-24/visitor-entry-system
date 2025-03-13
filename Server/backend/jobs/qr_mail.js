const Queue = require("bull");
const qr = require("qr-image");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

//Need to run this file in a separate terminal as : node qr_mail.js or nodemon qr_mail.js if using nodemon

//Make sure to run "redis-server" in a separate terminal so that redis is running


// Initialize queue (Redis must be running)
const visitorQueue = new Queue("visitorEmails", {
    redis: { host: "127.0.0.1", port: 6379 }
});

console.log("Email:", process.env.EMAIL_USER);
console.log("Password:", process.env.EMAIL_PASS);


visitorQueue.on("error", (err) => console.error("Queue Error:", err));
visitorQueue.on("failed", (job, err) => console.error("Job Failed:", err));
visitorQueue.on("completed", (job) => console.log(`Job ${job.id} completed`));

// Email transporter setup (Replace with actual SMTP details)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Worker to process jobs
visitorQueue.process(async (job) => {
    const { visitors, userRole, userId } = job.data;

    console.log("Email:", process.env.EMAIL_USER);
    console.log("Password:", process.env.EMAIL_PASS);


    console.log(`Processing job with ${visitors.length} visitors`);
    
    for (const visitor of visitors) {
        console.log(`Sending email to ${visitor.email}`);
        const qrData = JSON.stringify({ ...visitor, userRole, userId });
        const qrImage = qr.imageSync(qrData, { type: "png" });

        console.log(qrData)

        fs.writeFileSync("qrcode.png", qrImage);

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: visitor.email,
            subject: "Your Visitor QR Code",
            text: "Here is your QR code for entry.",
            attachments: [{ filename: "qrcode.png", content: qrImage }]
        });

        console.log(`Email sent to ${visitor.email}`);
    }
});

module.exports = visitorQueue;
