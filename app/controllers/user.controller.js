const config = require('../config/index');
const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
//const { array } = require('joi');
//const { registerValidation } = require('../validations/user.validation');
const msg = require('../helpers/messages.json');
const stripe = require("stripe")(config.stripe_secret_key);

//const multer = require('multer');

router.post('/signin', authenticate);
router.post('/signup', register);   
router.get('/get-all-users', getAllUsers);  
router.get('/get-all-courses', getAllCourses);

router.post("/placedOrder", placedOrder);

//stripe
router.post("/checkoutSession", checkoutSession);


//order
router.post("/save-order-details", saveOrderDetails);

//node Mailer
router.post("/send-payment-email", sendPaymentEmail);
router.post("/send-wellcome-email", sendWellcomeEmail);
router.post("/send-student-enrolled-email", sendEmailToAdmin);


module.exports = router;

/**
 * Function registers the user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
// function register(req, res, next) {
function register(req, res, next) {
  userService
    .create(req.body)
    .then((user) =>
      user
        ? res.status(201).json({
          status: true,
          message: msg.user.signup.success,
          data: user,
        })
        : res
          .status(400)
          .json({
            status: false,
            message: "User already Exist! Please login or complete the Subscription Registration Form if not already completed."
          })
    )
    .catch((err) =>
      next(res.status(400).json({ status: false, message: err }))
    );
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function authenticate the user
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @return JSON|null
 */

function authenticate(req, res, next) {
  // console.log('000api run--')
  userService
    .authenticate(req.body)
    .then((user) =>
      user
        ? console.log(user) || (user && user.isActive == true)
          ? res.json({
            status: true,
            message: msg.user.login.success,
            data: user,
          })
          : res
            .status(400)
            .json({ status: false, message: msg.user.login.active })
        : res.status(400).json({ status: false, message: msg.user.login.error })
    )
    .catch((err) => next(err));
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
* Function to get all the user list
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* 
* @return JSON|null
*/
function getAllUsers(req, res, next) {
  userService.getAllUsers(req.params)
    .then(allUsers => allUsers ? res.status(200).json({ status: true, data: allUsers }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: [] }))
    .catch(err => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
* Function to get all the courses list
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* 
* @return JSON|null
*/
function getAllCourses(req, res, next) {
  userService.getAllCourses(req.params)
    .then(allCourses => allCourses ? res.status(200).json({ status: true, data: allCourses }) : res.status(400).json({ status: false, message: msg.admin.add_course, data: [] }))
    .catch(err => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
* Function to strip payment
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* 
* @return JSON|null
*/
function checkoutSession(req, res, next) {
  userService.checkoutSession(req)
    .then((data) => data ? res.status(201).json({ status: true, data: data }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: {} }))
    .catch((err) => next(res.status(400).json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
//
// function createInvoice(req, res, next) {
//   userService.createInvoice(req).then((result) =>result? res.status(201).json({status: true, message: msg.user.add_category.success,data: result,})
//   : res.status(400).json({ status: false,message: msg.user.add_category.error}) )
//   .catch((err) =>next(res.status(400).json({ status: false, message: err })));
// }



/**
* Function to strip payment Verify
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* 
* @return JSON|null
*/
// function paymentVerify(req, res, next) {
//   userService.paymentVerify(req).then((result) =>result? res.status(201).json({status: true, message: msg.user.add_category.success,data: result,})
//   : res.status(400).json({ status: false,message: msg.user.add_category.error}) )
//   .catch((err) =>next(res.status(400).json({ status: false, message: err })));
// }
/*****************************************************************************************/
/*****************************************************************************************/
// placedOrder
function placedOrder(req, res, next) {
  userService.placedOrder(req.body).then((result) =>result? res.status(201).json({status: true, message: msg.user.add_category.success,data: result,})
  : res.status(400).json({ status: false,message: msg.user.add_category.error}) )
  .catch((err) =>next(res.status(400).json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function sendPaymentEmail(req, res, next) {
  console.log('email API call----');
  userService.sendPaymentEmail(req)
    .then((result) => {
      console.log('Email service result:', result);
      return result ? res.json({ status: true, message: "Payment email sent successfully." }) : res.json({ status: false, message: "Error in sending payment email." });
    })
    .catch((err) => {
      console.error('Error in sendPaymentEmail controller:', err);
      next(res.json({ status: false, message: err.message }));
    });
}


/*****************************************************************************************/
/*****************************************************************************************/

function saveOrderDetails(req, res, next) {
    userService.saveOrderDetails(req.body)
      .then((data) => data ? res.status(201).json({ status: true, data: data }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: {} }))
      .catch((err) => next(res.status(400).json({ status: false, message: err })));
  }
/*****************************************************************************************/
/*****************************************************************************************/

function sendWellcomeEmail(req, res, next) {
  userService.sendWellcomeEmail(req)
    .then((result) => {
      console.log('sendWellcomeEmail service result:', result);
      return result ? res.json({ status: true, message: "WellcomeEmail sent successfully." }) : res.json({ status: false, message: "Error in sending WellcomeEmail email." });
    })
    .catch((err) => {
      console.error('Error in sendWellcomeEmail controller:', err);
      next(res.json({ status: false, message: err.message }));
    });
}
/*****************************************************************************************/
/*****************************************************************************************/

function sendEmailToAdmin(req, res, next) {
  userService.sendEmailToAdmin(req)
    .then((result) => {
      console.log('sendEmailToAdmin service result:', result);
      return result ? res.json({ status: true, message: "student enrolled email sent successfully." }) : res.json({ status: false, message: "Error in sending email to admin." });
    })
    .catch((err) => {
      console.error('Error in sendEmailToAdmin controller:', err);
      next(res.json({ status: false, message: err.message }));
    });
}
/*****************************************************************************************/
/*****************************************************************************************/