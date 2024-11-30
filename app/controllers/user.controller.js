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
router.post('/studentRegister', studentRegister);
router.get('/get-all-users', getAllUsers);
router.get('/get-all-courses', getAllCourses);

//stripe
router.post("/checkoutSession", checkoutSession);

//order
router.post("/save-order-details", saveOrderDetails);
router.post("/save-topay-order-details", saveTopayOrderDetails);
router.get("/get-order-details", getOrderDetails);

//node Mailer
router.post("/send-payment-email", sendPaymentEmail);

router.post("/send-wellcome-email", sendWellcomeEmail);
router.post("/send-student-enrolled-email", sendEmailToAdmin);
router.post("/send-topay-payment-email", sendEmailToPayStudent);
router.post("/send-topay-student-enrolled-email", sendEmailToPayAdmin);

//payment
router.post("/save-payment-details", savePaymentDetails);
router.post("/save-topay-payment-details", saveToPayPaymentDetails);
// router.post("/get-payment-method/:id", paymentMethodRetrive);




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
 * Function Student Register After course Payment Succeed
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @return JSON|null
 */
function studentRegister(req, res, next) {
  userService
    .studentRegister(req.body)
    .then((result) => {
      if (result.exists) {
        // Email already exists case
        res.status(200).json({
          status: false,
          message: "User already exists!",
          exists: true,
          data: result.data
        });
      } else if (result.data) {
        // Successful registration case
        res.status(201).json({
          status: true,
          message: msg.user.signup.success,
          data: result.data,
          exists: false
        });
      } else {
        // Error case
        res.status(400).json({
          status: false,
          message: "Registration failed",
          exists: false
        });
      }
    })
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
        ? (user) || (user && user.isActive == true)
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
function sendPaymentEmail(req, res, next) {
  userService.sendPaymentEmail(req)
    .then((result) => {
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
      return result ? res.json({ status: true, message: "student enrolled email sent successfully." }) : res.json({ status: false, message: "Error in sending email to admin." });
    })
    .catch((err) => {
      console.error('Error in sendEmailToAdmin controller:', err);
      next(res.json({ status: false, message: err.message }));
    });
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
* Function to get all the order details 
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* 
* @return JSON|null
*/
function getOrderDetails(req, res, next) {
  userService.getOrderDetails(req.query.id)
    .then(allOrders => allOrders ? res.status(200).json({ status: true, data: allOrders }) : res.status(400).json({ status: false, message: "Error in getting order details.", data: [] }))
    .catch(err => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function savePaymentDetails(req, res, next) {
  userService.savePaymentDetails(req.body)
    .then((data) => data ? res.status(201).json({ status: true, data: data }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: {} }))
    .catch((err) => next(res.status(400).json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function saveTopayOrderDetails(req, res, next) {
  userService.saveTopayOrderDetails(req.body)
    .then((data) => data ? res.status(201).json({ status: true, data: data }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: {} }))
    .catch((err) => next(res.status(400).json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function saveToPayPaymentDetails(req, res, next) {
  userService.saveToPayPaymentDetails(req.body)
    .then((data) => data ? res.status(201).json({ status: true, data: data }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: {} }))
    .catch((err) => next(res.status(400).json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function sendEmailToPayStudent(req, res, next) {
  userService.sendEmailToPayStudent(req)
    .then((result) => {
      return result ? res.json({ status: true, message: "Payment email sent successfully." }) : res.json({ status: false, message: "Error in sending payment email." });
    })
    .catch((err) => {
      console.error('Error in sendEmailToPayStudent controller:', err);
      next(res.json({ status: false, message: err.message }));
    });
}
/*****************************************************************************************/
/*****************************************************************************************/
function sendEmailToPayAdmin(req, res, next) {
  userService.sendEmailToPayAdmin(req)
    .then((result) => {
      return result ? res.json({ status: true, message: "student enrolled email sent successfully." }) : res.json({ status: false, message: "Error in sending email to admin." });
    })
    .catch((err) => {
      console.error('Error in sendEmailToAdmin controller:', err);
      next(res.json({ status: false, message: err.message }));
    });
}
/*****************************************************************************************/
/*****************************************************************************************/
// function paymentMethodRetrive(req, res, next) {
//   userService.paymentMethodRetrive(req)
//     .then(data => data ? res.status(200).json({ status: true, data: data }) : res.status(400).json({ status: false, message: "Error in getting order details.", data: [] }))
//     .catch(err => next(res.json({ status: false, message: err })));
// }
/*****************************************************************************************/
/*****************************************************************************************/