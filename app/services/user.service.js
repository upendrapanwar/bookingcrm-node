/**
 * File Name: User Service
 *
 * Description: Manages login,signup and operations related with different users and admin
 *
 * Author: Booking App Live
 */

const config = require('../config/index');
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
  // createPaymentIntent,
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
//********************************************************* */
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



