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
    addCourse,
    getCourse,
    authenticate,
    addCategory,
    getAllcategories,
    getCourseById,
    updateCourse,
    deleteCourse,
    getcategoryById,
    editCategory,
    addInstructor,
    getInstructors,
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
    try {
        const admin = await User.findOne({email:email, role:'admin'});

        if (admin && bcrypt.compareSync(password, admin.password)) {
            if (admin.role !== "admin") {
                throw Error("Unauthorized: You must be an admin to log in.");
            }
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
    } catch (error) {
        console.error("Authentication error:", error.message);
        throw error;
    }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function addCourse(param) {
    try {
        const course = new Courses({
            course_title: param.course_title,
            course_information: param.course_information,
            category: param.category,
            course_type: param.course_type,
            regular_price: param.regular_price,
            sale_price: param.sale_price,
            vat: param.vat,
            //availability: param.availability,
            course_time: param.course_time,
            course_schedule_dates: param.courseScheduleDates,
            course_image: param.course_image,
            instructor: param.instructorId,
            course_format: param.course_format,
            enrollment_capacity: param.enrollment_capacity,
            additional_information: param.additional_information,
            completing_the_course: param.completing_the_course,
            why_use_our_training: param.why_use_our_training
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
    const result = await Courses.find()
        .populate('instructor')
        .select()
        .sort({ createdAt: 'desc' });

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
            slug: slug,
            description: param.description || '',
            parent: param.sub_category || null,
            parentCategory: param.sub_category_name,
            isActive: true,
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
    try {
        const result = await Categories.find().select().sort({ createdAt: 'desc' });
        if (result && result.length > 0) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Could not fetch category. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get Course byId
 *
 * @param null
 *
 * @returns Object|null
 */
async function getCourseById(param) {
    const result = await Courses.findById(param.id).select();

    if (result) return result;

    return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Manages update Course operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function updateCourse(param) {
    console.log('param--', param)
    try {
        const updatedCourse = await Courses.findOneAndUpdate(
            { _id: param.id },
            {
                $set: {
                    course_title: param.course_title,
                    course_information: param.course_information,
                    category: param.category,
                    course_type: param.course_type,
                    regular_price: param.regular_price,
                    sale_price: param.sale_price,
                    vat: param.vat,
                    course_schedule_dates: param.course_schedule_dates,
                    course_time: param.course_time,
                    course_image: param.course_image,
                    course_format: param.course_format,
                    enrollment_capacity: param.enrollment_capacity,
                    additional_information: param.additional_information,
                    completing_the_course: param.completing_the_course,
                    why_use_our_training: param.why_use_our_training,
                    updatedBy: param.updated_By,
                },
            },
            { new: true }
        );

        if (updatedCourse) {
            return updatedCourse;
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
/**
 * Manages delete Course operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function deleteCourse(param) {
    try {
        //const deletedCourse = await Courses.findOneAndDelete({ _id: param.id });
        const deletedCourse = await Courses.findOneAndUpdate(
            { _id: param.id },
            {
                $set: {
                    isActive: false,
                },
            },
            { new: true }
        );
        if (deletedCourse) {
            return deletedCourse;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        throw new Error('Could not delete course. Please try again later.');
    }
}

/*****************************************************************************************/
/*****************************************************************************************/
async function getcategoryById(param) {
    try {
        const _id = param.id;
        const result = await Categories.findById({ _id }).select();
        if (result) {
            return result;
        } else {
            return false;
        }

    } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Could not fetched category. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function editCategory(req) {
    const _id = req.params.id;
    const data = req.body;
    const slug = slugify(data.name, { lower: true });

    try {
        const findData = await Categories.findById(_id).select();
        if (!findData) {
            return false;
        }

        const newData = {
            category: data.name,
            slug: slug,
            parent: data.sub_category_id,
            parentCategory: data.sub_category_name,
            description: data.description,
            isActive: findData.isActive,
        }

        const result = await Categories.findByIdAndUpdate(_id, newData, { new: true });
        if (result) {
            return result;
        } else {
            return false;
        }

    } catch (error) {
        console.error('Error editing category:', error);
        throw new Error('Could not edited category. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function addInstructor(param) {
    console.log('param of instructor form---', param)
    try {
        const instructor = new Instructors({
            first_name: param.first_name,
            last_name: param.last_name,
            email: param.email,
            phone: param.contact_no,
            instructor_image: param.instructor_image,
            createdBy: param.created_by,
            instructor_unavailable_dates: param.instructor_unavailable_dates,

        })

        const instructorData = await instructor.save();
        if (instructorData) {
            return instructorData;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error adding instructor:', error);
        throw new Error('Could not add instructor. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Manages get Course operations
 *
 * @param {param}
 *
 * @returns Object|null
 */
async function getInstructors(param) {
    const result = await Instructors.find()
        .populate('createdBy')
        .select()
        .sort({ createdAt: 'desc' })
        .exec();

    if (result && result.length > 0) return result;

    return false;
}
