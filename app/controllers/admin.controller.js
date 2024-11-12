const config = require('../config/index');
const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const msg = require('../helpers/messages.json');

//const multer = require('multer');

router.post('/signin',authenticate);
router.post('/add_course', addCourse);
router.get('/get_course', getCourse);
router.post('/add_category',addCategory);
router.get('/getAllcategories', getAllcategories);
router.get('/get_course_byId/:id', getCourseById);
router.put('/update_course', updateCourse);
router.put('/delete_course', deleteCourse);
router.get('/getcategory/:id', getcategoryById);



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

/**
 * Function to get Course byId
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function getCourseById(req, res, next) {
    adminService
        .getCourseById(req.params)
        .then((course) =>
            course
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.get_course.success,
                    data: course,
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

/**
 * Function to update Courses
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function updateCourse(req, res, next) {
    //console.log('req.body--',req.body)
    adminService
        .updateCourse(req.body)
        .then((coursedata) =>
            coursedata
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.update_course.success,
                    data: coursedata,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.update_course.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Function to delete Course
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function deleteCourse(req, res, next) {
    adminService
        .deleteCourse(req.body)
        .then((courses) =>
            courses
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.delete_course.success,
                    data: courses,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.delete_course.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
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
function addCategory(req, res, next) {
    adminService
        .addCategory(req.body)
        .then((categorydata) =>
            categorydata
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.add_category.success,
                    data: categorydata,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.add_category.error
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
function getAllcategories(req, res, next) {
    adminService
        .getAllcategories(req)
        .then((categories) =>
            categories
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.get_categories.success,
                    data: categories,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.get_categories.error
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
function getcategoryById(req, res, next) {
    adminService
        .getcategoryById(req.params)
        .then((result) =>
            result
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.get_categories.success,
                    data: result,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.get_categories.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}