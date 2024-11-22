/**
 * File Name: User Service
 *
 * Description: Manages login,signup and operations related with different users and admin
 *
 * Author: Booking App Live
 */

const config = require('../config/index');
const SendEmail = require("../helpers/email");
//const axios = require('axios');
//const https = requrie('https');
// const moongoose = require('mongoose');
// moongoose.connect(process.env.MONGODB_URI || config.connectionString,{
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

//mongoose.Promise = global.Promise;
const stripe = require("stripe")(
  "sk_test_51QKGTWCHTdQvfuyCQYX22vWRSy5ht2zTWoAIBUMB5RHA6aTZnA22eIKhBg6OWSZUMuYZHiVAfY5rl2qGR5DdsMKT00qrEH8RDe"
);
const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");
const bcrypt = require("bcryptjs");

const msg = require("../helpers/messages.json");

const {
  User,
  Courses,
  Orders,
} = require("../helpers/db");

module.exports = {
  create,
  authenticate,
  getAllUsers,
  getAllCourses,

  // stripe 
  checkoutSession,
  placedOrder,

  //nodeMailer 
  sendPaymentEmail,
  sendWellcomeEmail,
  sendEmailToAdmin,

  //orders
  saveOrderDetails,
};

/*****************************************************************************************/
/*****************************************************************************************/

async function create(param) {
  try {
    if (await User.findOne({ email: param.email })) {
      throw 'email "' + param.email + '" is already taken';
      //return false;
    }

    const user = new User({
      first_name: param.firstName,
      last_name: param.lastName,
      email: param.email,
      password: bcrypt.hashSync(param.password, 10),
      role: param.role,
      phone: param.phone_number,
      gender: param.gender,
      isActive: true,
      is_blocked: false,
    });

    const data = await user.save();
    const authData = await authenticate({ email: param.email, password: param.password })
    if (data) {
      let res = await User.findById(data.id).select(
        "-password -social_accounts -reset_password -image_url"
      );

      if (res && authData) {
        let response = {
          data: data,
          authData: {
            token: authData.token,
            expTime: authData.expTime
          }
        };
        //sendMail(mailOptions);
        return response;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.log("Error", err);
    return false;
  }
}

/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Manages user login operations
 *
 * @param {email,passwrd}
 *
 * @returns Object|null
 */
async function authenticate({ email, password }) {
  const user = await User.findOne({ email });

  if (user && bcrypt.compareSync(password, user.password)) {
    const {
      password,
      reset_password,
      __v,
      createdAt,
      updatedAt,
      social_accounts,
      ...userWithoutHash
    } = user.toObject();
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: "2h",
    });
    var expTime = new Date();
    expTime.setHours(expTime.getHours() + 2); //2 hours token expiration time
    //expTime.setMinutes(expTime.getMinutes() + 2);
    expTime = expTime.getTime();

    return {
      ...userWithoutHash,
      token,
      expTime,
    };
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get All Users
 *
 * @param null
 *
 * @returns Object|null
 */
async function getAllUsers() {
  const result = await User.find().select().sort({ createdAt: 'desc' });

  if (result && result.length > 0) return result;

  return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
* Manages get All Course operations
*
* @param {email,passwrd}
*
* @returns Object|null
*/
async function getAllCourses(param) {
  const result = await Courses.find({ isActive: true })
    .select()
    .sort({ createdAt: 'desc' });

  if (result && result.length > 0) return result;


  return false;
}


//********************************************************* */
// **********************************************************
// Stripe
async function checkoutSession(req) {
  console.log("req", req);

  try {
    const { name, email,  amount } = req.body;


    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });

    console.log("customer",customer);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      customer : customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log("paymentIntent", paymentIntent);

    return paymentIntent;

  } catch (err) {
    console.error("error", err);
    return false;
  }
}
//**********************************************************/
// **********************************************************

// async function createInvoice(req) {

//   const { paymentIntentId } = req.body;

//   console.log("Request Body:", paymentIntentId);
//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//     console.log("paymentIntentpaymentIntentpaymentIntentpaymentIntent", paymentIntent)

//     const invoice = await stripe.invoices.create({
//       customer: paymentIntent.customer,
//       collection_method: "send_invoice",
//       days_until_due: 30,
//       auto_advance: true,
//       description: "Invoice for payment",
//     });

//     await stripe.invoices.finalizeInvoice(invoice.id);
//     // console.log("invoice created", invoice)
//     return invoice;
//   } catch (err) {
//     console.error("Error creating invoice:", err);
//     return false;
//   }
// }


// async function paymentVerify(req) {
//   console.log("req", req);
//   try {
//     const { payment_intent } = req.body;

//     const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

//     if (paymentIntent.status === "succeeded") {
//       return paymentIntent;
//     }
//   } catch (err) {
//     console.error("error", err);
//     return false;
//   }
// }


//**********************************************************/
// **********************************************************
async function placedOrder(param) {
  console.log("param", param);
  // const {userId, firstName, lastName, companyName, country, streetAddress, flat, city, county, postcode,
  //   email, phoneNumber, acknowledge, cardNumber, expiryDate, cvv } = req.body;
  // try {
  //   const result = new Payment({userId,
  //     firstName, lastName, companyName, country, streetAddress,
  //     flat, city, county, postcode, email, phoneNumber, acknowledge, cardNumber, expiryDate, cvv
  //   });
  //   console.log("result", result);

  //   if (result) {
  //     await result.save();
  //     return result;
  //   } else {
  //     return false;
  //   }
  // } catch (error) {
  //   console.error('Error placed Order:', error);
  //   throw new Error('Could not placed order. Please try again later.');
  // }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function sendPaymentEmail(param) {
  console.log('sendPaymentEmail', param.body);
  const { paymentIntent, amount, email, name } = param.body;

  const mailOptions = {
    from: `"Booking App Live" <${config.mail_from_email}>`,
    to: email,
    subject: "Payment Confirmation - Booking App Live",
    html: `
     <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
      <!-- Header -->
      <div style="background-color: #6772E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Payment Confirmation</h1>
      </div>

      <!-- Body -->
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Thank you for your payment, ${name}!</h2>
        
        <p>We are pleased to inform you that your payment has been successfully processed.</p>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
          <p><strong>Payment Intent ID:</strong> ${paymentIntent}</p>
          <p><strong>Amount:</strong> €${(amount / 100).toFixed(2)}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>If you have any questions about your payment, please don't hesitate to contact our support team.</p>

        <p style="font-style: italic;">Thank you for choosing our service!</p>
        
        <p>Best regards,<br>The Booking App Live Team</p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px; background-color: #6772E5; text-align: center;">
        <p style="color: white; margin: 0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Booking App Live. All rights reserved.
        </p>
      </div>
    </div>
    `
  };

  try {
    const emailResult = await SendEmail(mailOptions);
    console.log('Email sent result:', emailResult);
    return { success: true, message: "Payment confirmation email sent successfully" };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, message: "Failed to send payment confirmation email" };
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function saveOrderDetails(param) {
  console.log('saveOrderDetails', param)
  try {
      const orders = new Orders({
     
        firstName: param.formvalues.firstName,
        lastName: param.formvalues.lastName,
        companyName: param.formvalues.companyName,
        country: param.formvalues.country,
        streetAddress: param.formvalues.streetAddress,
        flat: param.formvalues.flat,
        city: param.formvalues.city,
        county: param.formvalues.county,
        postcode: param.formvalues.postcode,
        email: param.formvalues.email,
        phoneNumber: param.formvalues.phoneNumber,
        acknowledge: param.formvalues.acknowledge,
        // cardNumber: param.formvalues.cardNumber,
        // expiryDate: param.formvalues.expiryDate,
        // cvv: param.formvalues.cvv,
        paymentIntentID: param.paymentIntent.id,
        amount: param.paymentIntent.amount,
      })

      const orderdata = await orders.save();
      if (orderdata) {
          return orderdata;
      } else {
          return false;
      }
  } catch (error) {
      console.error('Error adding course:', error);
      throw new Error('Could not add course. Please try again later.');
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function sendWellcomeEmail(param) {
  console.log('sendPaymentEmail', param.body);
  const { email, firstName } = param.body.formvalues;

  const mailOptions = {
    from: `"Booking App Live" <${config.mail_from_email}>`,
    to: email,
    subject: "Welcome to Booking App Live!",
    html: `
     <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
      <!-- Header -->
      <div style="background-color: #6772E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Booking App Live!</h1>
      </div>

      <!-- Body -->
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello, ${firstName}!</h2>
        
        <p>We are thrilled to have you on board. Thank you for joining Booking App Live!</p>

        <p>Our platform offers a wide range of features to help you manage your bookings efficiently. If you have any questions or need assistance, feel free to reach out to our support team.</p>

        <p style="font-style: italic;">We look forward to serving you!</p>
        
        <p>Best regards,<br>The Booking App Live Team</p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px; background-color: #6772E5; text-align: center;">
        <p style="color: white; margin: 0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Booking App Live. All rights reserved.
        </p>
      </div>
    </div>
    `
  };

  try {
    const emailResult = await SendEmail(mailOptions);
    console.log('sendWellcomeEmail email sent result:', emailResult);
    return { success: true, message: "Wellcome email sent successfully" };
  } catch (error) {
    console.error("Error sending wellcome email:", error);
    return { success: false, message: "Failed to send wellcome email" };
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function sendEmailToAdmin(param) {
  console.log('sendEmailToAdmin', param.body);
  const { email, firstName } = param.body.formvalues;
  const { paymentIntent } = param.body.paymentIntent;

  const mailOptions = {
    from: `"Booking App Live" <${config.mail_from_email}>`,
    to: `"Booking App Live" <${config.mail_from_email}>`,
    subject: "New Student Enrolled - Booking App Live",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
      <!-- Header -->
      <div style="background-color: #6772E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Student Enrolled</h1>
      </div>

      <!-- Body -->
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello Admin,</h2>
        
        <p>We are excited to inform you that a new Student has Enrolled in Booking App Live!</p>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Student Details:</h3>
          <p><strong>Name:</strong> ${firstName}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>

        <p>Please ensure to welcome them and provide any necessary support.</p>

        <p style="font-style: italic;">Thank you for your continued support!</p>
        
        <p>Best regards,<br>The Booking App Live Team</p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px; background-color: #6772E5; text-align: center;">
        <p style="color: white; margin: 0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Booking App Live. All rights reserved.
        </p>
      </div>
    </div>
    `
  };

  try {
    const emailResult = await SendEmail(mailOptions);
    console.log('sendEmailToAdmin sent result:', emailResult);
    return { success: true, message: "Student enrolled email to admin sent successfully" };
  } catch (error) {
    console.error("Error sending student enrolled email to admin:", error);
    return { success: false, message: "Failed to send student enrolled email to admin" };
  }
}
