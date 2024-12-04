const config = require('../config/index');
const express = require('express');
const router = express.Router();
const instructorService = require('../services/instructor.service');
const msg = require('../helpers/messages.json');

//const multer = require('multer');

router.post('/update_shedule',instructorUpdateShedule);



module.exports = router;



/**
 * Function to add Courses
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * @return JSON|null
 */
function instructorUpdateShedule(req, res, next) {
    instructorService
        .instructorUpdateShedule(req.body)
        .then((updatedInstructor) =>
            updatedInstructor
                ? res.status(201).json({
                    status: true,
                    message: msg.instructor.submit_schedule.success,
                    data: updatedInstructor,
                })
                : res
                    .status(400)
                    .json({
                        status: false,
                        message: msg.instructor.submit_schedule.error
                    })
        )
        .catch((err) =>
            next(res.status(400).json({ status: false, message: err }))
        );
}

/*****************************************************************************************/
/*****************************************************************************************/
