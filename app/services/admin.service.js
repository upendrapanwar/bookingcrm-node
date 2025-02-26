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
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const {
    User,
    Courses,
    Categories,
    Instructors,
    Orders,
    Payments,
    Reviews,
    Tickets,
    TicketReplies
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
    getOrders,
    deleteOrder,
    getOrderById,
    deleteUser,
    deleteCourseReview,
    deleteSelectedTickets,
    setStausById,
    getAllTickets,
    getOpenTickets,
    getWaitTickets,
    getClosedTickets,
    setReplyById,
    getRepliesDetailsId,
    addTicket
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
            course_schedule_dates: param.courseScheduleDates.sort((a, b) => a - b),
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
    // console.log('getCourseById---param',param)
    const result = await Courses.findById(param.id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'studentId', 
            select: 'first_name last_name' 
        }
    })
    .exec();
        // .select();



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
                    // course_schedule_dates: param.course_schedule_dates,
                    course_schedule_dates: param.courseScheduleDates.sort((a, b) => a - b),
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
        const deletedCourse = await Courses.findOneAndDelete({ _id: param.id });

        if (deletedCourse) {
            return deletedCourse; // Return the deleted document if found and deleted
        } else {
            return false; // Return false if no document was found
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

            //  console.log('instructorData--', instructorData)
            const scheduleSetupUrl = `${config.instructor_url}?id=${instructorData._id}&name=${instructorData.first_name}`;
            const customData = {
                title: 'Instructor Wellcome',
                emailTemplate: 'instructorWellcome',
                firstName: instructorData.first_name,
                lastname: instructorData.last_name,
                scheduleSetupUrl: scheduleSetupUrl,
                copyrightDate: new Date().getFullYear()
            }
            const mailOptions = {
                from: `"Booking App Live" <${process.env.ADMIN_EMAIL}>`,
                replyTo: `"Booking App Live" <${process.env.ADMIN_EMAIL}>`,
                to: `"Booking App Live" <${instructorData.email}>`,
                subject: "New Instructor Welcome - Booking App Live",
                data: customData
            };

            const emailResult = await SendEmail(mailOptions);
            console.error('emailResult--', emailResult)

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
    // console.log('InstructorsById-----', param)
    const result = await Instructors.findById(param.id).select().populate('assigned_courses');
    // console.log('InstructorsById---result--', result)
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

/*****************************************************************************************/
/*****************************************************************************************/

async function getOrders(param) {
    try {
        const result = await Orders.find()
            .populate('studentId')
            .select()
            .sort({ createdAt: 'desc' })
            .exec();

        if (result && result.length > 0) return result;

        return false;
    } catch (error) {
        console.error('Error in getting ordres:', error);
        throw new Error('Could not get orders. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/

async function deleteOrder(param) {
    // console.log('param--delete order---', param)
    const id = param.orderId.id
    try {
        const deletedOrder = await Orders.findOneAndDelete({ _id: id });

        if (deletedOrder) {
            return deletedOrder;
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

async function getOrderById(param) {
    // console.log('getOrderById-----', param)
    try {
        const result = await Orders.findById(param.id).select().populate('studentId').populate('courses.courseId');
        // console.log('getOrderById---result--', result)
        if (result) return result;

        return false;
    } catch (error) {
        console.error('Error getting order:', error);
        throw new Error('Could not get order. Please try again later.');
    }
}

/*****************************************************************************************/
/*****************************************************************************************/

async function deleteUser(param) {
    console.log('param--delete order---', param)
    const id = param.UserId.id
    try {
        const deletedUser = await User.findOneAndDelete({ _id: id });

        if (deletedUser) {
            return deletedUser;
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

async function deleteCourseReview(param) {
    console.log('deleteCourseReview---',param)
    const { reviewId, courseId } = param;
    
    try {
        // Step 1: Remove reviewId from the reviews array in the Course document
        const updatedCourse = await Courses.findByIdAndUpdate(
            courseId,
            { $pull: { reviews: reviewId } }, // Removes reviewId from reviews array
            { new: true } // Returns the updated document
        );

        if (!updatedCourse) {
            throw new Error('Course not found. Cannot remove review.');
        }

        // Step 2: Delete the review from the Review collection
        const deletedReview = await Reviews.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            throw new Error('Review not found. Cannot delete.');
        }

        // Step 3: Return success response
        return {
            success: true,
            message: 'Review successfully deleted.',
            data: { updatedCourse, deletedReview }
        };
    } catch (error) {
        console.error('Error deleting course review:', error);
        throw new Error('Could not delete course review. Please try again later.');
    }
}
/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Delete selected tickets by single or multiple ids
 *
 * @param id
 *
 * @returns Object|false
 */
async function deleteSelectedTickets(param) {
  try {
    const result = await mongoose.connection.transaction(async (session) => {
      const ticketIds = param.body;

      const deleteRepliesResult = await TicketReplies.deleteMany({
        ticketId: { $in: ticketIds }
      }).session(session);

      const deleteTicketsResult = await Tickets.deleteMany({
        _id: { $in: ticketIds }
      }).session(session);

      if (deleteRepliesResult.deletedCount === 0 || deleteTicketsResult.deletedCount === 0) {
        throw new Error('Nothing was deleted');
      }

      return true;
    });

    console.log('Transaction committed successfully');
    return result;

  } catch (error) {
    console.error('Transaction failed:', error);
    return false;
  }

}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Set status by ticket id
 *
 * @param id
 *
 * @returns Object|false
 */
async function setStausById(param) {
    try {
  
      const ticketId = param.body.ticketId;
  
      const filter = {
        _id: new ObjectId(ticketId)
      };
  
      const update = {
        $set: {
          status: param.body.status,
        }
      };
  
      const options = {
        returnDocument: "after" // Returns the updated document
      };
  
      const ticketData = await Tickets.findOneAndUpdate(filter, update, options);
  
      if (ticketData) {
        return true;
      } else {
        return false;
      }
    }
    catch (error) {
      console.error("Error data has not found:", error);
      return false;
    }
  
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get All Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getAllTickets() {
    const result = await Tickets.find().select().sort({ updatedAt: 'desc' });
  
    if (result && result.length > 0) return result;
  
    return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get open Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getOpenTickets() {
  
    const result = await Tickets.find({ status: "open" }).select().sort({ createdAt: 'desc' });
  
    if (result && result.length > 0) return result;
  
    return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get waiting Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getWaitTickets() {
    const result = await Tickets.find({ status: "waiting" }).select().sort({ createdAt: 'desc' });
  
    if (result && result.length > 0) return result;
  
    return false;
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Get closed Tickets
 *
 * @param null
 *
 * @returns Object|null
 */
async function getClosedTickets() {
    const result = await Tickets.find({ status: "closed" }).select().sort({ createdAt: 'desc' });
  
    if (result && result.length > 0) return result;
  
    return false;
}
/*****************************************************************************************/
/*****************************************************************************************/

/**
 * Set reply by ticket id
 *
 * @param id
 *
 * @returns Object|false
 */
async function setReplyById(param) {
    try {
      const ticketId = param.body.ticketId;
      const ticketreplies = new TicketReplies({
        ticketId: param.body.ticketId,
        senderEmail: param.body.senderEmail,
        recieverEmail: param.body.recieverEmail,
        reply: param.body.message,
      })
  
      const ticketrepliesData = await ticketreplies.save();
      if (ticketrepliesData) {
        const filter = {
          _id: new ObjectId(ticketId)
        };
  
        const update = {
          $set: {
            // Specify the fields you want to update
            status: param.body.status,
          }
        };
  
        const options = {
          returnDocument: "after" // Returns the updated document
        };
  
        const ticketData = await Tickets.findOneAndUpdate(filter, update, options);
  
        if (ticketData) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
  
    }
    catch (error) {
      console.error("Error data has not found:", error);
      return false;
    }
  
  }
  /*****************************************************************************************/
  /*****************************************************************************************/
  /**
 * Get reply by ticket id
 *
 * @param null
 *
 * @returns Object|false
 */
async function getRepliesDetailsId(param) {
    const ticketId = param.id;
  
    if (!ticketId) throw new Error('Ticket ID is undefined');
    
    //if (!ObjectId.isValid(ticketId)) {
    //    console.log("Invalid ObjectId");
    //    throw new Error("Invalid ObjectId");
    //}
    
    try {
        
      const result = await Tickets.aggregate([
        {
          $match: { "_id": new ObjectId(ticketId) }
        },
        {
          $lookup: {
            from: "ticketreplies",
            localField: "_id",
            foreignField: "ticketId",
            as: "replies_details"
          }
        },
        {
          $unwind: "$replies_details"
        },
        {
          $sort: { "replies_details.createdAt": -1 }
        },
        {
          $project: {
            _id: 1,
            ticket: "$$ROOT"
          }
        }
      ]);
      
      if (result.length === 0) {
        throw new Error('No Result for Ticket ID');
  
      }
  
      return result;
  
    } catch (error) {
      console.error('Error fetching ticket replies details:', error);
      throw new Error('Could not fetch ticket replies details. Please try again later.');
    }
  
}
/*****************************************************************************************/
/*****************************************************************************************/
/**
 * Function to save the ticket data
 * 
 * @param {*} param 
 * @returns objectArray|false
 */
async function addTicket(param) {
    let imageName = '';
    if (param.body.screenshot) {
      const parsedUrl = new URL(param.body.screenshot);  // Parse the URL
      const pathname = parsedUrl.pathname;  // Get the pathname part
      const parts = pathname.split('/');
      imageName = parts[parts.length - 1];
    }
  
    try {
      const tickets = new Tickets({
        firstName: param.body.tfirstName,
        lastName: param.body.tlastName,
        email: param.body.temail,
        subject: param.body.subject,
        message: param.body.tmessage,
        status: param.body.status,
        image_id: param.body.image_id,
        screenshot: param.body.screenshot
      })
  
      const ticketData = await tickets.save();
  
      if (ticketData) {
        const customData = {
          title: 'New Ticket Email',
          emailTemplate: 'newTicket',
          firstName: param.body.tfirstName,
          lastname: param.body.tlastName,
          message: param.body.tmessage,
          ticketUrl: process.env.LOCAL_URL+'/contact-us',
          copyrightDate: new Date().getFullYear(),
          filename: imageName,
          path: param.body.screenshot
        }
  
        const mailOptions = {
          from: `"Booking App Live" <${config.mail_from_email}>`,
          to: `"Booking App Live" <${param.body.temail}>`,
          subject: param.body.subject,
          html: param.body.tmessage,
          data: customData
        };
        const emailResult = await SendEmail(mailOptions);
  
        const ticketReplies = new TicketReplies({
          ticketId: ticketData._id,
          senderEmail: 'admintest@gmail.com',
          recieverEmail: param.body.temail,
          reply: param.body.tmessage,
        })
  
        const ticketRepliesData = await ticketReplies.save();
  
        return ticketData;
      } else {
        return false;
      }
    }
    catch (error) {
      console.error("Error data has not found:", error);
      return false;
    }
  
  };
  /*****************************************************************************************/
  /*****************************************************************************************/
