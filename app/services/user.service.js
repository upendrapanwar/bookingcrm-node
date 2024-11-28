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
  Payments,
  Instructor
} = require("../helpers/db");

module.exports = {
  create,
  studentRegister,
  authenticate,
  getAllUsers,
  getAllCourses,

  // stripe 
  checkoutSession,

  //nodeMailer 
  sendPaymentEmail,
  sendWellcomeEmail,
  sendEmailToAdmin,
  sendEmailToPayStudent,
  sendEmailToPayAdmin,

  //orders
  saveOrderDetails,
  saveTopayOrderDetails,
  getOrderDetails,
  getAllOrderDetails,

  //payment
  savePaymentDetails,
  saveToPayPaymentDetails,
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
//student registration after course payment succeed
async function studentRegister(param) {
  try {
    // Check if email exists
    const existingUser = await User.findOne({ email: param.formvalues.email });

    if (existingUser) {
      console.log('email "' + param.formvalues.email + '" is already taken');
      return {
        exists: true,
        data: existingUser
      };
    }

    // Create new user if email doesn't exist
    const user = new User({
      first_name: param.formvalues.firstName,
      last_name: param.formvalues.lastName,
      // gender: param.formvalues.gender,
      email: param.formvalues.email,
      role: 'student',
      phone: param.formvalues.phoneNumber,
      isActive: true,
      country: param.formvalues.county,
      // state: param.formvalues.state,
      address: param.formvalues.streetAddress,
      flat: param.formvalues.flat,
      city: param.formvalues.city,
      county: param.formvalues.county,
      postcode: param.formvalues.postcode,
      acknowledge: false,
    });

    const savedUser = await user.save();

    return {
      exists: false,
      data: savedUser
    };

  } catch (err) {
    console.log("Error", err);
    return {
      exists: false,
      data: null
    };
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
  try {
    const { name, email, amount, cart, phoneNumber, county } = req.body;

    const customer = await stripe.customers.create({
      email: email,
      name: name,
      Phone: phoneNumber,
      Country: county,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        cart: cart,
      },
    });

    return paymentIntent;

  } catch (err) {
    console.error("error", err);
    return false;
  }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function sendPaymentEmail(param) {
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
    return { success: true, message: "Payment confirmation email sent successfully" };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, message: "Failed to send payment confirmation email" };
  }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function saveOrderDetails(param) {
  //  console.log('saveOrderDetails', param);
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
      courses: param.coursesData
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
    return { success: true, message: "Wellcome email sent successfully" };
  } catch (error) {
    console.error("Error sending wellcome email:", error);
    return { success: false, message: "Failed to send wellcome email" };
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function sendEmailToAdmin(param) {
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
    return { success: true, message: "Student enrolled email to admin sent successfully" };
  } catch (error) {
    console.error("Error sending student enrolled email to admin:", error);
    return { success: false, message: "Failed to send student enrolled email to admin" };
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get All Order Details
 *
 * @param null
 *
 * @returns Object|null
 */
async function getOrderDetails(id) {
  // console.log('getOrderDetails', id);
  try {
    // Find a specific order by ID
    const order = await Orders.findById(id).select();
    return order ? order : false;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Could not fetch order details. Please try again later.');
  }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function getAllOrderDetails() {
  try {
    const order = await Orders.find().select();
    return order ? order : false;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Could not fetch order details. Please try again later.');
  }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function savePaymentDetails(param) {
  try {
    const orders = new Payments({
      userId: param.studentRegisterResponse.data.id,
      firstName: param.studentRegisterResponse.data.first_name,
      lastName: param.studentRegisterResponse.data.last_name,
      email: param.studentRegisterResponse.data.email,
      phoneNumber: param.studentRegisterResponse.data.phone,

      paymentIntentID: param.paymentIntent.id,
      paymentStatus: param.paymentIntent.status,
      amount: param.paymentIntent.amount,

      orderId: param.orderDetails.id,

      courses: param.coursesData
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
async function saveTopayOrderDetails(param) {
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
      toPay: param.toPay,
      futurePay: param.futurePay,
      paymentIntentID: param.paymentIntent.id,
      amount: param.paymentIntent.amount,
      courses: param.coursesData
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
async function saveToPayPaymentDetails(param) {
  try {
    const orders = new Payments({
      userId: param.studentRegisterResponse.data.id,
      firstName: param.studentRegisterResponse.data.first_name,
      lastName: param.studentRegisterResponse.data.last_name,
      email: param.studentRegisterResponse.data.email,
      phoneNumber: param.studentRegisterResponse.data.phone,

      paymentIntentID: param.paymentIntent.id,
      paymentStatus: param.paymentIntent.status,
      amount: param.paymentIntent.amount,
      toPay: param.toPay,
      futurePay: param.futurePay,
      orderId: param.orderDetails.id,

      courses: param.coursesData
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
// async function sendEmailToPayStudent(param) {
//   const { paymentIntent, amount, email, name, toPay, futurePay } = param.body;

//   const mailOptions = {
//     from: `"Booking App Live" <${config.mail_from_email}>`,
//     to: email,
//     subject: "Payment Confirmation - Booking App Live",
//     html: `
//      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
//       <!-- Header -->
//       <div style="background-color: #6772E5; padding: 20px; text-align: center;">
//         <h1 style="color: white; margin: 0;">Payment Confirmation</h1>
//       </div>

//       <!-- Body -->
//       <div style="padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Thank you for your payment, ${name}!</h2>

//         <p>We are pleased to inform you that your payment has been successfully processed.</p>

//         <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
//           <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
//           <p><strong>Payment Intent ID:</strong> ${paymentIntent}</p>
//           <p><strong>Amount:</strong> €${(amount / 100).toFixed(2)}</p>
//           <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//         </div>

//         <p>If you have any questions about your payment, please don't hesitate to contact our support team.</p>

//         <p style="font-style: italic;">Thank you for choosing our service!</p>

//         <p>Best regards,<br>The Booking App Live Team</p>
//       </div>

//       <!-- Footer -->
//       <div style="padding: 20px; background-color: #6772E5; text-align: center;">
//         <p style="color: white; margin: 0; font-size: 12px;">
//           &copy; ${new Date().getFullYear()} Booking App Live. All rights reserved.
//         </p>
//       </div>
//     </div>
//     `
//   };

//   try {
//     const emailResult = await SendEmail(mailOptions);
//     return { success: true, message: "Payment confirmation email sent successfully" };
//   } catch (error) {
//     console.error("Error sending payment confirmation email:", error);
//     return { success: false, message: "Failed to send payment confirmation email" };
//   }
// }

async function sendEmailToPayStudent(param) {
  const { paymentIntent, amount, email, name, toPay, futurePay } = param.body;

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

        <!-- Payment Details -->
        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
          <p><strong>Payment Intent ID:</strong> ${paymentIntent}</p>
          <p><strong>Amount Paid:</strong> £${(toPay || 0).toFixed(2)}</p>
          <p><strong>Remaining Amount:</strong> £${(futurePay || 0).toFixed(2)}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Term & Condition -->
        <div style="border: 1px solid #ddd; border-radius: 4px; padding: 15px; background-color: #fff;">
          <p style="color: #ff0000; font-weight: bold;">
            Term & Condition: The remaining amount of 
            <strong>£${(futurePay || 0).toFixed(2)}</strong> must be paid at least 24 hours before the course starts. Otherwise, the amount of 
            <strong>£${(toPay || 0).toFixed(2)}</strong> already paid will not be refunded.
          </p>
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
    return { success: true, message: "Payment confirmation email sent successfully" };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, message: "Failed to send payment confirmation email" };
  }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function sendEmailToPayAdmin(param) {
  const { email, firstName} = param.body.formvalues;
  const { toPay} = param.body.toPay;
  const {futurePay } = param.body.toPay;
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
        
        <p>We are excited to inform you that a new student has enrolled in Booking App Live!</p>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Student Details:</h3>
          <p><strong>Name:</strong> ${firstName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Amount Paid:</strong> £${toPay}</p>
          <p><strong>Remaining Amount:</strong> £${futurePay.toFixed(2)}</p>
        </div>

        <p>Please ensure to welcome them and provide any necessary support.</p>

        <div style="margin-top: 20px; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">
          <h4 style="margin-top: 0; color: #333;">Terms & Conditions:</h4>
          <p>
            ${firstName} has chosen the Pay Deposits option. ${firstName} will pay the remaining amount of <strong>£${futurePay.toFixed(2)}</strong> at least 24 hours before the course start date. 
            If ${firstName} fails to make the payment before the course start date, the amount already paid (<strong> £${toPay.toFixed(2)}</strong>) will not be refunded.
          </p>
        </div>

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
    return { success: true, message: "Student enrolled email to admin sent successfully" };
  } catch (error) {
    console.error("Error sending student enrolled email to admin:", error);
    return { success: false, message: "Failed to send student enrolled email to admin" };
  }
}
/*****************************************************************************************/
/*****************************************************************************************/