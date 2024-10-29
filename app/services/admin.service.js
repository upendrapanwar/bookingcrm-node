/**
 * File Name: Admin Service
 *
 * Description: Manages login,signup and operations related with different users and admin
 *
 * Author: Booking App Live
 */

const config = require('../config/index');
//const axios = require('axios');
const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");
const bcrypt = require("bcryptjs");

const msg = require("../helpers/messages.json");

const {
    User,
    Courses,
    Categories,
} = require("../helpers/db");

module.exports = {
    addCourse,
    getCourse,
    authenticate,
    addCategory,
    getAllcategories,
};

/*****************************************************************************************/
/*****************************************************************************************/
/**
   * Manages admin login operations
   *
   * @param {email,passwrd}
   *
   * @returns Object|null
   */
async function authenticate({ email, password }) {
    const admin = await User.findOne({ email });

    if (admin && bcrypt.compareSync(password, admin.password)) {
        const {
            password,
            reset_password,
            __v,
            createdAt,
            updatedAt,
            social_accounts,
            ...userWithoutHash
        } = admin.toObject();
        const token = jwt.sign({ id: admin.id }, config.secret, {
            expiresIn: "2h",
        });
        var expTime = new Date();
        expTime.setHours(expTime.getHours() + 2); //2 hours token expiration time
        //expTime.setMinutes(expTime.getMinutes() + 2);
        expTime = expTime.getTime();

        return {
            ...userWithoutHash,
            token,
            expTime,
        };
    }
}

/*****************************************************************************************/
/*****************************************************************************************/

async function addCourse(param) {
    // console.log('param---', param)
    try {
        const course = new Courses({
            course_title: param.course_title,
            course_information: param.course_information,
            category: param.category,
            regular_price: param.regular_price,
            sale_price: param.sale_price,
            vat: param.vat,
            availability: param.availability,
            course_time: param.course_time,
            course_image: param.course_image,
            // instructor:param.instructorId,
            course_format: param.course_format,
            enrollment_capacity: param.enrollment_capacity,
            additional_information: param.additional_information,
        })

        const coursedata = await course.save();
        if (coursedata) {
            return coursedata;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error adding course:', error);
        throw new Error('Could not add course. Please try again later.');
    }
}

/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Manages get Course operations
 *
 * @param {email,passwrd}
 *
 * @returns Object|null
 */
async function getCourse(param) {
    const result = await Courses.find().select().sort({ createdAt: 'desc' });

    if (result && result.length > 0) return result;

    return false;
}

/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get All Users
 *
 * @param null
 *
 * @returns Object|null
 */
async function getAllUsers() {
    const result = await User.find().select().sort({ createdAt: 'desc' });

    if (result && result.length > 0) return result;

    return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
async function addCategory(param) {
    try {
        const existingCategory = await Categories.findOne({ category: param.name });
        
        if (existingCategory) {
            return false;
        }

        const slug = slugify(param.name, { lower: true });

        const category = new Categories({
            category: param.name,
            slug : slug,
            description: param.description || '',
            parent : param.sub_category || null,
            isActive : true,
        });
        
        const categorydata = await category.save();
        if (categorydata) {
            const categoriesInDescendingOrder = await Categories.find().select().sort({ createdAt: 'desc' });
            return categoriesInDescendingOrder;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error adding category:', error);
        throw new Error('Could not add category. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function getAllcategories(param) {
    console.log('param---', param);
    try {
        const result = await Categories.find().select().sort({ createdAt: 'desc' });
        if (result && result.length > 0){
            return result;
        } else{
            return false;
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Could not fetch category. Please try again later.');
    }
}