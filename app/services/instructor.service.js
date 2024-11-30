/**
 * File Name: Admin Service
 *
 * Description: Manages login,signup and operations related with different users and admin
 *
 * Author: Booking App Live
 */

const SendEmail = require("../helpers/email");

const config = require('../config/index');
//const axios = require('axios');
const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");
const bcrypt = require("bcryptjs");
const slugify = require('slugify');
const msg = require("../helpers/messages.json");

const {
    User,
    Courses,
    Categories,
    Instructors,
    Orders,
} = require("../helpers/db");

module.exports = {
    instructorUpdateShedule,

};

/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Manages update Course operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function instructorUpdateShedule(param) {
    console.log('param--', param)
    try {
        const updatedInstructor = await Instructors.findOneAndUpdate(
            { _id: param.instructorId },
            {
                $set: {
                    instructor_available_dates: param.courseScheduleDates
                },
            },
            { new: true }
        );

        if (updatedInstructor) {
            return updatedInstructor;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error updating course:', error);
        throw new Error('Could not update course. Please try again later.');
    }
}

/*****************************************************************************************/
/*****************************************************************************************/