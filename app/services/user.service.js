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
} = require("../helpers/db");

module.exports = {
  create,
  authenticate,
  getAllUsers,
  getAllCourses,
  checkoutSession,
  placedOrder,
  // createPaymentIntent,,

//*********************email functionality */
  userSupportEmail, 
  userContactUs,
  supportReqCall
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
  console.log("req",req);

  try {
    const { amount } = req.body;
    console.log("amount",amount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;

  } catch (err) {
    console.error("error", err);
    return false;
  }
}
//**********************************************************/
// **********************************************************
async function placedOrder(param) {
  console.log("param",param);
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



//Support Email
async function userSupportEmail(param) {
  const email = param.email;
  const name = param.name;
  const message = param.message;

  const mailOptions = {

    from: `"Payearth Support" <${email}>`,
    replyTo: `${email}`,
    to: config.mail_from_email,
    subject: `"Support Message from user" ${name}`,
    text: `"You have received a message from " + ${name}`,
    html: `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
  <!-- Header -->
  <div style="background-color: #6772E5; padding: 20px; text-align: center;">
    <img src="https://pay.earth:7700/uploads/logo.png" alt="Payearth" style="height: 40px;" />
  </div>

  <!-- Body -->
  <div style="padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #333;">New Support Message from User ${name}</h2>

    <p>Hello Payearth Admin,</p>

    <p>You have received a new message from the support on payearth. Here are the details:</p>

    <div style="margin-bottom: 20px;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
    </div>

    <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>

    <p>Please review the message and respond as needed.</p>

    <p style="font-style: italic;">— The Payearth Team</p>
  </div>

  <!-- Footer -->
  <div style="padding: 10px; background-color: #6772E5; text-align: center; font-size: 12px; color: #aaa;">
    <p>Payearth, 1234 Street Name, City, State, 12345</p>

    <p>&copy; ${new Date().getFullYear()} Payearth. All rights reserved.</p>
  </div>
  </div>
   `
  };


  try {
    await SendEmail(mailOptions);
    return mailOptions;
  } catch (error) {
    console.error("Error sending email:", error);
    return false
  }
}

/*****************************************************************************************/
/*****************************************************************************************/


//User Contact-Us
async function userContactUs(param) {
  const email = param.email;

  const user = await User.findOne({ email });
  console.log("user", user)

  if (!user) {
    console.log("email address not found. Please try again.");
    return false;
  }

  const mailOptions = {

    from: `"Payearth Support" <${param.email}>`,
    replyTo: `${param.email}`,
    to: config.mail_from_email,
    subject: `"Contact Us Message from user" ${param.name}`,
    text: "You have received a message from " + user.name,
    html: `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
  <!-- Header -->
  <div style="background-color: #6772E5; padding: 20px; text-align: center;">
    <img src="https://pay.earth:7700/uploads/logo.png" alt="Payearth" style="height: 40px;" />
  </div>

  <!-- Body -->
  <div style="padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #333;">New Contact Us Message from User ${user.name}</h2>

    <p>Hello Payearth Admin,</p>

    <p>You have received a new message from the contact us on payearth. Here are the details:</p>

    <div style="margin-bottom: 20px;">
      <p><strong>Name:</strong> ${param.name}</p>
      <p><strong>Email:</strong> ${param.email}</p>
    </div>

    <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">
      <p><strong>Message:</strong></p>
      <p>${param.message}</p>
    </div>

    <p>Please review the message and respond as needed.</p>

    <p style="font-style: italic;">— The Payearth Team</p>
  </div>

  <!-- Footer -->
  <div style="padding: 10px; background-color: #6772E5; text-align: center; font-size: 12px; color: #aaa;">
    <p>Payearth, 1234 Street Name, City, State, 12345</p>

    <p>&copy; ${new Date().getFullYear()} Payearth. All rights reserved.</p>
  </div>
  </div>
   `
  };


  try {
    await SendEmail(mailOptions);
    return mailOptions;
  } catch (error) {
    console.error("Error sending email:", error);
    return false
  }
}







/*****************************************************************************************/
/*****************************************************************************************/

async function supportReqCall(req) {
  try {
    const { user_id, seller_id, name, email, phone, message, call_status } = req.body;

    const data = new Support({
      user_id,
      seller_id,
      name,
      email,
      phone,
      message,
      call_status
    });

    const result = await data.save();


    const mailOptions = {
      from: `"Payearth Support" <${email}>`,
      replyTo: `${email}`,
      to: config.mail_from_email,
      subject: `Support call request from user ${name}`,
      text: "",
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
        <!-- Header -->
        <div style="background-color: #6772E5; padding: 20px; text-align: center;">
          <img src="https://pay.earth:7700/uploads/logo.png" alt="Payearth" style="height: 40px;" />
        </div>

        <!-- Body -->
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">New Support call request from User ${name}</h2>
          <p>Hello Payearth Admin,</p>
          <p>You have received a new message from the support call request on Payearth. Here are the details:</p>

          <div style="margin-bottom: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Call Status:</strong> ${call_status}</p>
          </div>

          <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>

          <p>Please review the message and respond as needed.</p>
          <p style="font-style: italic;">— The Payearth Team</p>
        </div>

        <!-- Footer -->
        <div style="padding: 10px; background-color: #6772E5; text-align: center; font-size: 12px; color: #aaa;">
          <p>Payearth, 1234 Street Name, City, State, 12345</p>
          <p>&copy; ${new Date().getFullYear()} Payearth. All rights reserved.</p>
        </div>
      </div>
      `
    };

    await SendEmail(mailOptions);

    return result;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

/*****************************************************************************************/
/*****************************************************************************************/