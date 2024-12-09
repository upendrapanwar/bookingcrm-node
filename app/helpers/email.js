const nodemailer = require("nodemailer");
const path = require("path");
const config = require("../config/index");

// Dynamically import nodemailer-express-handlebars (ES Module)
const nodehandlebars = (async () => {
    const { default: handlebars } = await import("nodemailer-express-handlebars");
    return handlebars;
})();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.mail_auth_user,
        pass: config.mail_auth_pass,
    },
});

const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve("./app/emailTemplates/"),
        defaultLayout: false,
    },
    viewPath: path.resolve("./app/emailTemplates/"),
};

const sendEmail = async (emailData) => {
    const { from, replyTo, to, subject, text, html } = emailData;

    try {
        const handlebars = await nodehandlebars; // Wait for the dynamic import
        transporter.use("compile", handlebars(handlebarOptions));

        const mailOptions = {
            from: from,
            template: emailData.data.emailTemplate,
            replyTo: replyTo,
            to: to,
            subject: subject,
            context: {
                title: emailData.data.title,
                name: emailData.data.firstName,
                message: emailData.data.message,
                ticketUrl: emailData.data.ticketUrl,
                copyrightDate: emailData.data.copyrightDate,
            },
            attachments: [{ filename: emailData.data.filename, path: emailData.data.path }],
            //text: text,
            //html: html,
        };
        //console.log('mailOptions=',mailOptions);
        const info = await transporter.sendMail(mailOptions);
        //console.log("Email sent: " + info.response);
        return info.response;
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail; // Use CommonJS export
