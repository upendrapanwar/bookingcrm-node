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
    Payments,
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
    getInstructorById,
    deleteInstructor,
    updateInstructor,
    updateInstructorStatus,
    updateCourseStatus,
    getAllPaymentDetails,
    getAllOrderDetails,
    getAllUsers,
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
        const admin = await User.findOne({ email: email, role: 'admin' });

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
            zoom_links: param.zoomLinks,
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
    // console.log('param--', param)
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
                    zoom_links: param.zoom_links,
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
    // console.log('param of instructor form---', param)
    try {
        const existingInstructor = await Instructors.findOne({ email: param.email });

        if (existingInstructor) {
            return false;
        };

        const instructor = new Instructors({
            first_name: param.first_name,
            last_name: param.last_name,
            email: param.email,
            contact_no: param.contact_no,
            instructor_image: param.instructor_image,
            createdBy: param.created_by,
            instructor_unavailable_dates: param.instructor_unavailable_dates,

        })

        const instructorData = await instructor.save();
        if (instructorData) {

            const emailSent = await sendEmailToInstructor(instructorData);
            if (emailSent) {
                console.log('Email sent successfully');
            } else {
                console.log('Failed to send email');
            }

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
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Get Instructor byId
 *
 * @param null
 *
 * @returns Object|null
 */
async function getInstructorById(param) {
    // console.log('InstructorsById-----',param)
    const result = await Instructors.findById(param.id).select();
    // console.log('InstructorsById---result--',result)
    if (result) return result;

    return false;
}

/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Manages delete Instructor operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function deleteInstructor(param) {
    try {
        // console.log('deleteInstructor---',param)
        //const deletedCourse = await Courses.findOneAndDelete({ _id: param.id });
        const deletedInstructor = await Instructors.deleteOne({ _id: param.id });
        if (deletedInstructor.deletedCount > 0) {
            return deletedInstructor;
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
/**
 * Manages update Instructor operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function updateInstructor(param) {
    // console.log('updatedInstructor--param--', param)
    try {
        const updatedInstructor = await Instructors.findOneAndUpdate(
            { _id: param.id },
            {
                $set: {
                    first_name: param.first_name,
                    last_name: param.last_name,
                    email: param.email,
                    contact_no: param.contact_no,
                    instructor_image: param.instructor_image,

                    updatedBy: param.updated_By,
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
/**
 * Manages send Email to Instructor operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function sendEmailToInstructor(instructorData) {
    console.log('instructorData----send email---', instructorData)
    const { email, first_name, _id } = instructorData;
    const scheduleSetupUrl = `${config.instructor_url}?id=${_id}&name=${first_name}`;
    const mailOptions = {
        from: `"Booking App Live" <${config.mail_from_email}>`,
        to: email,
        subject: "New Instructor Welcome - Booking App Live",
        html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #555;">
        <!-- Header -->
        <div style="background-color: #6772E5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Booking App Live!</h1>
        </div>
    
        <!-- Body -->
        <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hello ${first_name} ,</h2>
            
            <p>Welcome aboard! We're thrilled to have you join Booking App Live as an instructor.</p>

            <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Next Steps:</h3>
            <p>To get started, please set up your teaching schedule by clicking the button below:</p>

            <div style="text-align: center; margin: 25px 0;">
            <a href="${scheduleSetupUrl}" style="background-color: #6772E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block;">Set Your Schedule</a>
        </div>
        <p style="font-size: 14px; color: #666;">
            This link will take you to your instructor portal where you can:
        </p>
        <ul style="font-size: 14px; color: #666;">
            <li>Choose your preferred teaching days</li>
        </ul>
    </div>
    
    <p>If you have any questions or need assistance, our support team is here to help!</p>
    
    <p>Best regards,<br>The Booking App Live Team</p>
    </div>
    
          <!-- Footer -->
          <div style="padding: 20px; background-color: #6772E5; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Booking App Live. All rights reserved.
            </p>
          </div>
        </div>
        `
    };
    // try {
    //     // Configure Nodemailer transport
    //     const transporter = nodemailer.createTransport({
    //         service: 'Gmail', // Or another service like Outlook, Yahoo, etc.
    //         auth: {
    //             user: process.env.EMAIL, // Your email address
    //             pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    //         },
    //     });

    //     // Email options
    //     const mailOptions = {
    //         from: 'your-email@example.com', // Sender address
    //         to: email, // Receiver's email
    //         subject: 'Welcome to the Team!', // Email subject
    //         text: `Hello ${firstName},\n\nWelcome to our team! We are excited to have you on board.\n\nBest Regards,\nTeam`, // Plain text body
    //     };

    //     // Send email
    //     await transporter.sendMail(mailOptions);
    //     return true; // Email sent successfully
    // } catch (error) {
    //     console.error('Error sending email:', error);
    //     return false; // Failed to send email
    // }

    try {
        const emailResult = await SendEmail(mailOptions);
        return { success: true, message: "Instructor Wellcome email to Instructor sent successfully" };
    } catch (error) {
        console.error("Error sending Instructor Wellcome email to Instructor:", error);
        return { success: false, message: "Failed to send Instructor Wellcome email to Instructor" };
    }
}
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Manages update Instructor status operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function updateInstructorStatus(param) {
    try {
        // console.log('deleteInstructor---',param)
        //const deletedCourse = await Courses.findOneAndDelete({ _id: param.id });
        const updatedInstructorStatus = await Instructors.findOneAndUpdate(
            { _id: param.id },
            [{ $set: { isActive: { $not: "$isActive" } } }],
            { new: true }
        );
        if (updatedInstructorStatus) {
            return updatedInstructorStatus;
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
/**
 * Manages update Instructor status operations
 *
 * @param  {Object} param 
 *
 * @returns Object|null
 */
async function updateCourseStatus(param) {
    try {
        // console.log('deleteInstructor---',param)
        //const deletedCourse = await Courses.findOneAndDelete({ _id: param.id });
        const updatedCourseStatus = await Courses.findOneAndUpdate(
            { _id: param.id },
            [{ $set: { isActive: { $not: "$isActive" } } }],
            { new: true }
        );
        if (updatedCourseStatus) {
            return updatedCourseStatus;
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
async function getAllPaymentDetails() {
    try {
        const payments = await Payments.find().select().sort({ createdAt: "desc" });
        return payments ? payments : false;
    } catch (error) {
        console.error('Error fetching payments details:', error);
        throw new Error('Could not fetch payments details. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function getAllOrderDetails() {
    try {
        const order = await Orders.find().select();
        return order ? order : false;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw new Error('Could not fetch order details. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
async function getAllUsers() {
    const result = await User.find().select().sort({ createdAt: 'desc' });

    if (result && result.length > 0) return result;

    return false;
}