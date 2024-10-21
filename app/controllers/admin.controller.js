const config = require('../config/index');
const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const msg = require('../helpers/messages.json');

//const multer = require('multer');

router.post('/signin',authenticate);
router.post('/add_course', addCourse);
router.get('/get_course', getCourse);



module.exports = router;


/**
 * Function authenticate the admin
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @return JSON|null
 */

function authenticate(req, res, next) {
    // console.log('000api run--')
    adminService
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
 * Function to add Courses
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function addCourse(req, res, next) {
    adminService
        .addCourse(req.body)
        .then((coursedata) =>
            coursedata
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.add_course.success,
                    data: coursedata,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.add_course.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Function to get Courses
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function getCourse(req, res, next) {
    adminService
        .getCourse(req)
        .then((courses) =>
            courses
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.get_course.success,
                    data: courses,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.get_course.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/