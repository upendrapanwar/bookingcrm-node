const config = require('../config/index');
const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const { array } = require('joi');
const { registerValidation } = require('../validations/user.validation');
const msg = require('../helpers/messages.json');

const multer = require('multer');

router.post('/register', register);
// router.post('/signup', registerValidation, register);
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
function register(req, res, next) {
    userService.create(req.body)
    .then(user => user ? res.status(201).json({ status: true, message: msg.user.signup.success, data: user }) : res.status(400).json({ status: false, message: msg.user.signup.error }))
    .catch(err => next(res.status(400).json({ status: false, message: err })));
}

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
    commonService
      .authenticate(req.body)
      .then((user) =>
        user
          ? console.log(user) || (user && user.is_active == true)
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