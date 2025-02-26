const config = require('../config/index');
const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const msg = require('../helpers/messages.json');

//const multer = require('multer');

router.post('/signin', authenticate);
router.post('/add_course', addCourse);
router.get('/get_course', getCourse);
router.post('/add_category', addCategory);
router.get('/getAllcategories', getAllcategories);
router.get('/get_course_byId/:id', getCourseById);
router.put('/update_course', updateCourse);
router.put('/delete_course', deleteCourse);
router.get('/getcategory/:id', getcategoryById);
router.put('/edit_category/:id', editCategory);
router.post('/add_instructor', addInstructor);
router.get('/get_instructors', getInstructors);
router.get('/get_instructor_byId/:id', getInstructorById);
router.put('/update_status_instructor', updateInstructorStatus)
router.put('/delete_instructor', deleteInstructor);
router.put('/update_instructor', updateInstructor);
router.put('/update_course_status', updateCourseStatus);
router.get("/get-payment-details", getAllPaymentDetails)
router.get("/get-all-order-details", getAllOrderDetails);
router.get('/get-all-users', getAllUsers);
router.get('/get_Orders', getOrders);
router.delete('/delete_order', deleteOrder);
router.get('/get_order_byId/:id', getOrderById);
router.delete('/delete_User', deleteUser);
router.delete('/delete-course-review', deleteCourseReview);

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
    //  console.log('req.body--',req.body)
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
 * Function to get category By Id
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
function editCategory(req, res, next) {
    adminService
        .editCategory(req)
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
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to add Instructor
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function addInstructor(req, res, next) {
    adminService
        .addInstructor(req.body)
        .then((instructorData) =>
            instructorData
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.add_instructor.success,
                    data: instructorData,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.add_instructor.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to get Instructors
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function getInstructors(req, res, next) {
    adminService
        .getInstructors(req)
        .then((courses) =>
            courses
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.get_instructors.success,
                    data: courses,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.get_instructors.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to get Instructor byId
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function getInstructorById(req, res, next) {
    adminService
        .getInstructorById(req.params)
        .then((instructor) =>
            instructor
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.get_instructors.success,
                    data: instructor,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.get_instructors.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to delete Instructer
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function deleteInstructor(req, res, next) {
    adminService
        .deleteInstructor(req.body)
        .then((courses) =>
            courses
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.delete_instructor.success,
                    data: courses,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.delete_instructor.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to update Instructor
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function updateInstructor(req, res, next) {
    // console.log('req.body--',req.body)
    adminService
        .updateInstructor(req.body)
        .then((coursedata) =>
            coursedata
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.update_instructor.success,
                    data: coursedata,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.update_instructor.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to update Instructer status
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function updateInstructorStatus(req, res, next) {
    adminService
        .updateInstructorStatus(req.body)
        .then((updatedInstructorStatus) =>
            updatedInstructorStatus
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.update_instructor_status.success,
                    data: updatedInstructorStatus,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.update_instructor_status.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to update Instructer status
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function updateCourseStatus(req, res, next) {
    adminService
        .updateCourseStatus(req.body)
        .then((updatedCourseStatus) =>
            updatedCourseStatus
                ? res.status(201).json({
                    status: true,
                    message: msg.admin.update_course_status.success,
                    data: updatedCourseStatus,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.admin.update_course_status.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}
/*****************************************************************************************/
/*****************************************************************************************/
function getAllPaymentDetails(req, res, next) {
    adminService.getAllPaymentDetails(req)
        .then(allOrders => allOrders ? res.status(200).json({ status: true, data: allOrders }) : res.status(400).json({ status: false, message: "Error in getting order details.", data: [] }))
        .catch(err => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function getAllOrderDetails(req, res, next) {
    adminService.getAllOrderDetails(req)
        .then(allOrders => allOrders ? res.status(200).json({ status: true, data: allOrders }) : res.status(400).json({ status: false, message: "Error in getting order details.", data: [] }))
        .catch(err => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/
function getAllUsers(req, res, next) {
    adminService.getAllUsers(req.params)
      .then(allUsers => allUsers ? res.status(200).json({ status: true, data: allUsers }) : res.status(400).json({ status: false, message: msg.common.no_data_err, data: [] }))
      .catch(err => next(res.json({ status: false, message: err })));
}
/*****************************************************************************************/
/*****************************************************************************************/

function getOrders(req, res, next) {
    adminService
        .getOrders(req)
        .then((orders) =>
            orders
                ? res.status(201).json({
                    status: true,
                    // message: msg.admin.get_instructors.success,
                     message: "Orders get successfully.",
                    data: orders,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: " Error in getting Orders.",
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/

function deleteOrder(req, res, next) {
    //console.log('delete order controler ')
    adminService
        .deleteOrder(req.body)
        .then((order) =>
            order
                ? res.status(201).json({
                    status: true,
                    // message: msg.admin.get_instructors.success,
                     message: "Order deleted successfully.",
                    data: order,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: " Error in deleting Order.",
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/

function getOrderById(req, res, next) {
    adminService
        .getOrderById(req.params)
        .then((order) =>
            order
                ? res.status(201).json({
                    status: true,
                    message: "Order get successfully.",
                    data: order,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: " Error in getting Order.",
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/

function deleteUser(req, res, next) {
    //console.log('delete order controler ')
    adminService
        .deleteUser(req.body)
        .then((order) =>
            order
                ? res.status(201).json({
                    status: true,
                    // message: msg.admin.get_instructors.success,
                     message: "User deleted successfully.",
                    data: order,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: " Error in deleting User.",
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/

function deleteCourseReview(req, res, next) {
    //console.log('delete Review controler ')
    adminService
        .deleteCourseReview(req.body)
        .then((order) =>
            order
                ? res.status(201).json({
                    status: true,
                    // message: msg.admin.get_instructors.success,
                     message: "Review deleted successfully.",
                    data: order,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: " Error in deleting Review.",
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/