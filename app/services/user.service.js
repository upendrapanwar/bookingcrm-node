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
const mongoose = require('mongoose');
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

const { ObjectId } = require("mongodb");

const {
  User,
  Courses,
  Orders,
  Payments,
  Instructor,
  Tickets,
  TicketReplies
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


  //payment
  savePaymentDetails,
  saveToPayPaymentDetails,

  getCourseZoomLink,
  addTicket,
  manegeContactUs,
  getOpenTickets,
  getWaitTickets,
  getClosedTickets,
  getAllTickets,
  getRepliesDetailsId,
  setReplyById,
  setStausById,
  deleteSelectedTickets,
  emailExists
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
// async function getAllCourses(param) {
//   const result = await Courses.find({ isActive: true })
//     .select()
//     .sort({ createdAt: 'desc' });

//   if (result && result.length > 0) return result;


//   return false;
// }

// async function getAllCourses(param) {
// console.log('api run--')
//     const currentDate = new Date();
//     currentDate.setHours(0, 0, 0, 0); // Normalize to compare only the date part

//     // Get the current month and the next two months
//     const months = [];
//     for (let i = 0; i < 3; i++) {
//         const newDate = new Date(currentDate);
//         newDate.setMonth(currentDate.getMonth() + i);
//         newDate.setDate(1); // Set to the first day of the month
//         months.push(newDate);
//     }

//     // Start and end of each month
//     const monthRanges = months.map(month => ({
//         startOfMonth: new Date(month.getFullYear(), month.getMonth(), 1),
//         endOfMonth: new Date(month.getFullYear(), month.getMonth() + 1, 0),
//     }));

//     // Fetch courses
//     const result = await Courses.find({
//         isActive: true,
//     }).select().sort({ createdAt: 'desc' });

//     if (!result || result.length === 0) {
//         return false;
//     }

//     // Group courses by month based on the earliest valid course start date
//     const coursesGroupedByMonth = {};

//     result.forEach(course => {
//         // Check if **any** course date is in the past
//         const hasFutureDate = course.course_schedule_dates.every(dateString => {
//             const date = new Date(dateString);
//             return date >= currentDate; // Include course if all dates are today or in the future
//         });

//         // If all dates are today or in the future, include this course
//         if (hasFutureDate) {
//             // Find the earliest date for grouping by month
//             const earliestDate = new Date(course.course_schedule_dates[0]);

//             // Check the month ranges for grouping
//             monthRanges.forEach((range) => {
//                 if (earliestDate >= range.startOfMonth && earliestDate <= range.endOfMonth) {
//                     const monthKey = `${range.startOfMonth.toLocaleString('default', { month: 'long' })} ${range.startOfMonth.getFullYear()}`;

//                     if (!coursesGroupedByMonth[monthKey]) {
//                         coursesGroupedByMonth[monthKey] = [];
//                     }
//                     coursesGroupedByMonth[monthKey].push(course);
//                 }
//             });
//         }
//     });

//     // Sort the months and return the grouped courses
//     const orderedCourses = Object.keys(coursesGroupedByMonth)
//         .sort((a, b) => new Date(a) - new Date(b))
//         .map(month => ({
//             month,
//             courses: coursesGroupedByMonth[month],
//         }));

//     return orderedCourses;
//     console.log('orderedCourses--',orderedCourses)
// }

async function getAllCourses(param) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Optimized query
  const result = await Courses.find({
    isActive: true,
    course_schedule_dates: { $gte: currentDate }
  }).select().sort({ createdAt: 'desc' });

  if (!result.length) {
    return [];
  }

  const coursesGroupedByMonth = result.reduce((acc, course) => {
    const hasPastDate = course.course_schedule_dates.some(dateString => {
      const date = new Date(dateString);
      return date < currentDate;
    });

    if (!hasPastDate) {
      const earliestDate = new Date(course.course_schedule_dates[0]);
      const monthKey = `${earliestDate.toLocaleString('default', { month: 'long' })} ${earliestDate.getFullYear()}`;

      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(course);
    }

    return acc;
  }, {});

  return Object.entries(coursesGroupedByMonth).map(([month, courses]) => ({ month, courses }));
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
  const { paymentIntent, amount, email, name, courses_data, classLink } = param.body;
  const courseTitlesHtml = courses_data
    .map((course, index) => `<p style="margin-left:75px;">${index + 1}. ${course.course_title}</p>`)
    .join(' ');

  const zoomLinks = classLink.map((course, index) =>
    `<p style="margin-left:75px;">${index + 1}. ${course.zoom_links}</p>`
  );

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
          <p><strong>Payment ID:</strong> ${paymentIntent}</p>
          
        <p><strong>Course Title:</strong> <br> ${courseTitlesHtml}</p>
          <p><strong>Amount:</strong> €${(amount / 100).toFixed(2)}</p>
          <p><strong>Instructor Name:</strong> Instructor test</p>
          <p><strong>Zoom link:</strong> ${zoomLinks}</p>
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
  const mailOptionsInstrutor = {
    from: `"Booking App Live" <${config.mail_from_email}>`,
    to: 'instructors@mailinator.com',
    subject: "Booking Confirmation - Booking App Live",
    html: `
     <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
      <!-- Header -->
      <div style="background-color: #6772E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmation</h1>
      </div>

      <!-- Body -->
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hi, Instructor test!</h2>

        <p>We are pleased to inform you that booking has been successfully processed.</p>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Booking Details:</h3>
        
       <p><strong>Course Title:</strong> <br> ${courseTitlesHtml}</p>
        <p><strong>Zoom link:</strong> "https://us05web.zoom.us/j/84578300481?pwd=b2cT52BuImRonWIphDkGDEDDvaziCy.1"</p>
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
    await SendEmail(mailOptionsInstrutor);
    return { success: true, message: "Payment confirmation email sent successfully" };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return { success: false, message: "Failed to send payment confirmation email" };
  }
}
/*****************************************************************************************/
/*****************************************************************************************/

async function saveOrderDetails(param) {
  // console.log('saveOrderDetails', param);
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
      paymentIntentID: param.paymentIntent.id,
      amount: (param.paymentIntent.amount / 100).toFixed(2),
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
  const courses_data = param.body.courses_data;
  // console.log("courses_data--wellcome", courses_data);

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
  console.log("courses_data for admin ---", param.body);
  const { email, firstName } = param.body.formvalues;
  const paymentIntent = param.body.paymentIntent;
  const { classLink } = param.body;
  const courses_data = param.body.courses_data || [];
  const orderDetails = param.body.orderDetails;

  const zoomLinks = classLink.map((course, index) =>
    `<p style="margin-left:75px;"> ${index + 1}.${course.zoom_links}</p>`
  );

  const courseTitlesHtml = courses_data
    .map((course, index) => `<p style="margin-left:75px;">${index + 1}. ${course.course_title}</p>`)
    .join(' ');


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
          <h3 style="margin-top: 0; color: #333;">Order Details:</h3>
          <p><strong>Order Id:</strong> ${orderDetails.id}</p>
          <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
          <p><strong>Payment Id:</strong> ${paymentIntent.id}</p>
          <p><strong>Amount:</strong> ${(paymentIntent.amount / 100).toFixed(2)}</p>
          <p><strong>Course Title:</strong> <br> ${courseTitlesHtml}</p>
          <p><strong>Zoom link:</strong> ${zoomLinks}</p>
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
    return { success: true, data: emailResult, message: "Student enrolled email to admin sent successfully" };
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
async function savePaymentDetails(param) {
  // console.log('savePaymentDetails----param',param)
  try {
    const orders = new Payments({
      userId: param.studentRegisterResponse.data.id,
      firstName: param.studentRegisterResponse.data.first_name,
      lastName: param.studentRegisterResponse.data.last_name,
      email: param.studentRegisterResponse.data.email,
      phoneNumber: param.studentRegisterResponse.data.phone,
      paymentIntentID: param.paymentIntent.id,
      paymentStatus: param.paymentIntent.status,
      amount: (param.paymentIntent.amount / 100).toFixed(2),
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
      amount: (param.paymentIntent.amount / 100).toFixed(2),
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
      amount: (param.paymentIntent.amount / 100).toFixed(2),
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
async function sendEmailToPayStudent(param) {
  const { paymentIntent, amount, email, name, toPay, futurePay, courses_data, classLink } = param.body;
  const courseTitlesHtml = courses_data
    .map((course, index) => `<p style="margin-left:75px;">${index + 1}. ${course.course_title}</p>`)
    .join(' ');

  const zoomLinks = classLink.map((course, index) =>
    `<p style="margin-left:75px;">${index + 1}. ${course.zoom_links}</p>`
  );

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
           <p><strong>Course Title:</strong> <br> ${courseTitlesHtml}</p>
          <p><strong>Amount Paid:</strong> £${(toPay || 0).toFixed(2)}</p>
          <p><strong>Remaining Amount:</strong> £${(futurePay || 0).toFixed(2)}</p>
          <p><strong>Zoom link:</strong> ${zoomLinks}</p>
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
  const { email, firstName } = param.body.formvalues;
  const toPay = param.body.toPay;
  const futurePay = param.body.futurePay;
  const paymentIntent = param.body.paymentIntent;
  const courses_data = param.body.courses_data || [];
  const orderDetails = param.body.orderDetails;
  const { classLink } = param.body;

  const zoomLinks = classLink.map((course, index) =>
    `<p style="margin-left:75px;">
      ${index + 1}.${course.zoom_links}
    </p>`
  );


  const courseTitlesHtml = courses_data
    .map((course, index) => `<p style="margin-left:75px;">${index + 1}. ${course.course_title}</p>`)
    .join(' ');


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
          <h3 style="margin-top: 0; color: #333;">Order Details:</h3>
          <p><strong>Order Id:</strong> ${orderDetails.id}</p>
          <h3 style="margin-top: 0; color: #333;">Payment Details:</h3>
          <p><strong>Payment Id:</strong> ${paymentIntent.id}</p>
          <p><strong>Amount Paid:</strong> £${toPay.toFixed(2)}</p>
          <p><strong>Remaining Amount:</strong> £${futurePay.toFixed(2)}</p>
          <p><strong>Course Title:</strong> <br> ${courseTitlesHtml}</p>
          <p><strong>ZoomLinks:</strong> <br> ${zoomLinks}</p>         
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
    return { success: true, data: emailResult, message: "Student enrolled email to admin sent successfully" };
  } catch (error) {
    console.error("Error sending student enrolled email to admin:", error);
    return { success: false, message: "Failed to send student enrolled email to admin" };
  }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function getCourseZoomLink(req) {
  const courseIds = JSON.parse(req.query.courseIds);
  console.log("Checking courseIds", courseIds);
  try {

    const courses = await Courses.find({ _id: { $in: courseIds } });
    console.log("Found courses:", courses);

    if (!courses || courses.length === 0) {
      return false;
    }

    return courses;
  } catch (error) {
    console.error("Error data has not found:", error);
    return false;
  }
};
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to save the ticket data
 * 
 * @param {*} param 
 * @returns objectArray|false
 */
async function addTicket(param) {
  let imageName = '';
  if (param.body.screenshot) {
    const parsedUrl = new URL(param.body.screenshot);  // Parse the URL
    const pathname = parsedUrl.pathname;  // Get the pathname part
    const parts = pathname.split('/');
    imageName = parts[parts.length - 1];
  }

  try {
    const tickets = new Tickets({
      firstName: param.body.tfirstName,
      lastName: param.body.tlastName,
      email: param.body.temail,
      subject: param.body.subject,
      message: param.body.tmessage,
      status: param.body.status,
      image_id: param.body.image_id,
      screenshot: param.body.screenshot
    })

    const ticketData = await tickets.save();

    if (ticketData) {
      const customData = {
        title: 'New Ticket Email',
        emailTemplate: 'newTicket',
        firstName: param.body.tfirstName,
        lastname: param.body.tlastName,
        message: param.body.tmessage,
        ticketUrl: 'http://localhost:3000/contact-us',
        copyrightDate: new Date().getFullYear(),
        filename: imageName,
        path: param.body.screenshot
      }

      const mailOptions = {
        from: `"Booking App Live" <${config.mail_from_email}>`,
        to: `"Booking App Live" <${param.body.temail}>`,
        subject: param.body.subject,
        html: param.body.tmessage,
        data: customData
      };
      const emailResult = await SendEmail(mailOptions);

      const ticketReplies = new TicketReplies({
        ticketId: ticketData._id,
        senderEmail: param.body.temail,
        recieverEmail: 'admintest@gmail.com',
        reply: param.body.tmessage,
      })

      const ticketRepliesData = await ticketReplies.save();

      return ticketData;
    } else {
      return false;
    }
  }
  catch (error) {
    console.error("Error data has not found:", error);
    return false;
  }

};
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to save the ticket screenshot
 * 
 * @param {*} param 
 * @returns objectArray|false
 */
async function manegeContactUs(param) {

  try {
    const customData = {
      title: 'Contact Us',
      emailTemplate: 'contactForm',
      firstName: param.body.firstName,
      lastname: param.body.lastName,
      message: param.body.message,
      copyrightDate: new Date().getFullYear()
    }
    const mailOptions = {
      from: `"Booking App Live" <${process.env.ADMIN_EMAIL}>`,
      replyTo: `"Booking App Live" <${process.env.ADMIN_EMAIL}>`,
      to: `"Booking App Live" <${param.body.email}>`,
      subject: param.body.subject,
      html: param.body.message,
      data: customData
    };

    const adminCustomData = {
      title: 'Contact Us',
      emailTemplate: 'contactForm',
      firstName: 'Admin',
      lastname: param.body.lastName,
      message: param.body.message,
      copyrightDate: new Date().getFullYear()
    }
    const emailResult = await SendEmail(mailOptions);

    const adminMailOptions = {
      from: `"Booking App Live" <${param.body.email}>`,
      replyTo: `"Booking App Live" <${param.body.email}>`,
      to: `"Booking App Live" <${process.env.ADMIN_EMAIL}>`,
      subject: param.body.subject,
      html: param.body.message,
      data: adminCustomData
    };
    const adminEmailResult = await SendEmail(adminMailOptions);

    if (adminEmailResult) {
      return true;
    } else {
      return false;
    }
  }
  catch (error) {
    console.error("Error data has not found:", error);
    return false;
  }

};
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to save the ticket screenshot
 * 
 * @param {*} param 
 * @returns objectArray|false
 */
/*
async function screenshot(param) {
  
  try {
    const filter = {
      _id: new ObjectId(param.body.ticketId)
    };
    
    const update = {
      $set: {
        // Specify the fields you want to update
        screenshot: param.body.screenshot,
        image_id:param.body.image_id,
      }
    };

    const options = {
      returnDocument: "after" // Returns the updated document
    };

    const ticketData = await Tickets.findOneAndUpdate(filter, update, options);
    
    if (ticketData) {
      return ticketData;
    } else {
      return false;
    }
  }  
  catch (error) {
    console.error("Error data has not found:", error);
    return false;
  }
    
};*/
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get All Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getAllTickets(param) {
  const result = await Tickets.find({ email: param.id}).select().sort({ updatedAt: 'desc' });

  if (result && result.length > 0) return result;

  return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get open Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getOpenTickets(param) {
  
  const result = await Tickets.find({ email: param.id, status: "open" }).select().sort({ createdAt: 'desc' });

  if (result && result.length > 0) return result;

  return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get waiting Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getWaitTickets(param) {
  const result = await Tickets.find({ email: param.id, status: "waiting" }).select().sort({ createdAt: 'desc' });

  if (result && result.length > 0) return result;

  return false;
}
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Get closed Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getClosedTickets(param) {
  const result = await Tickets.find({ email: param.id, status: "closed" }).select().sort({ createdAt: 'desc' });

  if (result && result.length > 0) return result;

  return false;
}
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Get reply by ticket id
 *
 * @param null
 *
 * @returns Object|false
 */
async function getRepliesDetailsId(param) {
  const ticketId = param.id;

  if (!ticketId) throw new Error('Ticket ID is undefined');

  try {
    const result = await Tickets.aggregate([
      {
        $match: { "_id": new ObjectId(ticketId) }
      },
      {
        $lookup: {
          from: "ticketreplies",
          localField: "_id",
          foreignField: "ticketId",
          as: "replies_details"
        }
      },
      {
        $unwind: "$replies_details"
      },
      {
        $sort: { "replies_details.createdAt": -1 }
      },
      {
        $project: {
          _id: 1,
          ticket: "$$ROOT"
        }
      }
    ]);

    if (result.length === 0) {
      throw new Error('No Result for Ticket ID');

    }

    return result;

  } catch (error) {
    console.error('Error fetching ticket replies details:', error);
    throw new Error('Could not fetch ticket replies details. Please try again later.');
  }

}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Set reply by ticket id
 *
 * @param id
 *
 * @returns Object|false
 */
async function setReplyById(param) {
  try {
    const ticketId = param.body.ticketId;

    const ticketreplies = new TicketReplies({
      ticketId: param.body.ticketId,
      senderEmail: param.body.senderEmail,
      recieverEmail: param.body.recieverEmail,
      reply: param.body.message,
    })

    const ticketrepliesData = await ticketreplies.save();
    if (ticketrepliesData) {
      const filter = {
        _id: new ObjectId(ticketId)
      };

      const update = {
        $set: {
          // Specify the fields you want to update
          status: param.body.status,
        }
      };

      const options = {
        returnDocument: "after" // Returns the updated document
      };

      const ticketData = await Tickets.findOneAndUpdate(filter, update, options);

      if (ticketData) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  }
  catch (error) {
    console.error("Error data has not found:", error);
    return false;
  }

}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Set status by ticket id
 *
 * @param id
 *
 * @returns Object|false
 */
async function setStausById(param) {
  try {

    const ticketId = param.body.ticketId;

    const filter = {
      _id: new ObjectId(ticketId)
    };

    const update = {
      $set: {
        status: param.body.status,
      }
    };

    const options = {
      returnDocument: "after" // Returns the updated document
    };

    const ticketData = await Tickets.findOneAndUpdate(filter, update, options);

    if (ticketData) {
      return true;
    } else {
      return false;
    }
  }
  catch (error) {
    console.error("Error data has not found:", error);
    return false;
  }

}
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Delete selected tickets by single or multiple ids
 *
 * @param id
 *
 * @returns Object|false
 */
async function deleteSelectedTickets(param) {
  try {
    const result = await mongoose.connection.transaction(async (session) => {
      const ticketIds = param.body;

      const deleteRepliesResult = await TicketReplies.deleteMany({
        ticketId: { $in: ticketIds }
      }).session(session);

      const deleteTicketsResult = await Tickets.deleteMany({
        _id: { $in: ticketIds }
      }).session(session);

      if (deleteRepliesResult.deletedCount === 0 || deleteTicketsResult.deletedCount === 0) {
        throw new Error('Nothing was deleted');
      }

      return true;
    });

    console.log('Transaction committed successfully');
    return result;

  } catch (error) {
    console.error('Transaction failed:', error);
    return false;
  }

}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get closed Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function emailExists(param) {
  const emailId = param.body.email;
  console.log("emailId=",emailId);
  try {
    const userData = await Tickets.find({ email: emailId }).select();

    if (userData && userData.length > 0) return userData;

    return false;
  }
  
  catch (error) {
    console.error('Error data has not found:', error);
    return false;
  }
}
/*****************************************************************************************/
/*****************************************************************************************/



