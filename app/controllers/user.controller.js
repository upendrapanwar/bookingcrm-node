const config = require('../config/index');
const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
//const { array } = require('joi');
//const { registerValidation } = require('../validations/user.validation');
const msg = require('../helpers/messages.json');

//const multer = require('multer');

router.post('/signin', authenticate);
router.post('/signup',  register);   //registerValidation,
router.get('/get-all-users', getAllUsers);   //registerValidation,
// router.post('/forgot-password', forgotPassword);
// router.put('/update-profile-details/:id', updateProfileDetails);
// router.put('/update-ambassador-profile-details/:id', updateAmbassadorProfileDetails);
// router.get('/get-profile-details/:id', getProfileDetails);
// router.get('/check-southafrican-id/:id', checkSouthAfricanId);
// router.get('/check-email-id/:id', checkEmailId);


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
            .json({ status: false, 
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