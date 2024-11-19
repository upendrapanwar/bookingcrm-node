const config = require('../config/index');
const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
//const { array } = require('joi');
//const { registerValidation } = require('../validations/user.validation');
const msg = require('../helpers/messages.json');

//const multer = require('multer');

router.post('/signin', authenticate);
router.post('/signup', register);   
router.get('/get-all-users', getAllUsers);  
router.get('/get-all-courses', getAllCourses);
router.post("/checkoutSession", checkoutSession);
router.post("/placedOrder", placedOrder);

//stripe
// router.post("/create-payment-intent", createPaymentIntent);


 


//***************email functionality */
router.post("/user-support-email", userSupportEmail); 
router.post("/user-contact-us", userContactUs);
router.post("/support/request-call", supportReqCall);
router.post("/send-payment-email", sendPaymentEmail);

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
// placedOrder
function placedOrder(req, res, next) {
  console.log("req",req);
  userService
      .placedOrder(req.body)
      .then((result) =>
        result
              ? res.status(201).json({
                  status: true,
                  message: msg.user.add_category.success,
                  data: result,
              })
              : res
                  .status(400)
                  .json({
                      status: false,
                      message: msg.user.add_category.error
                  })
      )
      .catch((err) =>
          next(res.status(400).json({ status: false, message: err }))
      );
}
/*****************************************************************************************/
/*****************************************************************************************/
// 
// function createPaymentIntent(req, res, next) {
//   userService.createPaymentIntent(req.body)
//     .then((data) => data ? res.status(201).json({ status: true, data: data }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: {} }))
//     .catch((err) => next(res.status(400).json({ status: false, message: err })));
// }

/**
* Function to email support
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* 
* @return JSON|null
*/
function userSupportEmail(req, res, next) {
  userService
    .userSupportEmail(req.body)
    .then((user) =>
      user
        ? res
          .status(200)
          .json({ status: true, message: "Email sent successfully." })
        : res
          .status(400)
          .json({ status: false, message: "Email has not sent. Please, try again." })
    )
    .catch((err) => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/

//User Contact-Us

function userContactUs(req, res, next) {
  userService
    .userContactUs(req.body)
    .then((user) =>
      user
        ? res
          .status(200)
          .json({ status: true, message: "Email sent successfully." })
        : res
          .status(400)
          .json({ status: false, message: "Email has not sent. Please, try again." })
    )
    .catch((err) => next(res.json({ status: false, message: err })));
}


/*****************************************************************************************/
/*****************************************************************************************/

function supportReqCall(req, res, next) {
  userService.supportReqCall(req)
    .then((result) => result ? res.json({ status: true, message: "Support request created successfully." }) : res.json({ status: false, message: "Error creating support request." }))
    .catch((err) => next(res.json({ status: false, message: err.message })));
}


/*****************************************************************************************/
/*****************************************************************************************/

function sendPaymentEmail(req, res, next) {
  userService.sendPaymentEmail(req)
    .then((result) => result ? res.json({ status: true, message: "Payment email send successfully." }) : res.json({ status: false, message: "Error in sending payment email." }))
    .catch((err) => next(res.json({ status: false, message: err.message })));
}


/*****************************************************************************************/
/*****************************************************************************************/
