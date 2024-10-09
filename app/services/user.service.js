/**
 * File Name: User Service
 *
 * Description: Manages login,signup and operations related with different users and admin
 *
 * Author: Booking App Live
 */

const config = require('../config/index');
//const axios = require('axios');
//const https = requrie('https');
// const moongoose = require('mongoose');
// moongoose.connect(process.env.MONGODB_URI || config.connectionString,{
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

//mongoose.Promise = global.Promise;

const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");
const bcrypt = require("bcryptjs");

const msg = require("../helpers/messages.json");

const {
    User,
} = require("../helpers/db");

module.exports = {
    create,
    authenticate,
    
};

/*****************************************************************************************/
/*****************************************************************************************/

async function create(param) {
  console.log('param--',param)
    try {
      if (await User.findOne({ email: param.email })) {
        throw 'email "' + param.email + '" is already taken';
        //return false;
      }
  
      const user = new User({
        first_name: param.name,
        //surname: param.surname,
        email: param.email,
        password: bcrypt.hashSync(param.password, 10),
        role: "student",
        phone :param.phone_number,
        gender :param.gender,
        isActive: true,
        is_blocked: false,
      });
  
      const data = await user.save();
      const authData  = await authenticate({ email:param.email, password:param.password })
      if (data) {
        let res = await User.findById(data.id).select(
          "-password -social_accounts -reset_password -image_url"
        );
  
        if (res && authData) {
          let response = {
            data:data,
            authData:{
              token:authData.token,
              expTime:authData.expTime
            }
          };
          //sendMail(mailOptions);
          return response;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (err) {
      console.log("Error", err);
      return false;
    }
  }
  
  /*****************************************************************************************/
  /*****************************************************************************************/
  
  /**
   * Manages user login operations
   *
   * @param {email,passwrd}
   *
   * @returns Object|null
   */
  async function authenticate({ email, password }) {
    const user = await User.findOne({ email });
  //console.log('api run---',user)
    if (user && bcrypt.compareSync(password, user.password)) {
      const {
        password,
        reset_password,
        __v,
        createdAt,
        updatedAt,
        social_accounts,
        ...userWithoutHash
      } = user.toObject(); 
      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: "2h",
      });
      var expTime = new Date();
      expTime.setHours(expTime.getHours() + 2); //2 hours token expiration time
      //expTime.setMinutes(expTime.getMinutes() + 2);
      expTime = expTime.getTime();
      console.log('user', user);
      return {
        ...userWithoutHash,
        token,
        expTime,
      };
    } 
  }
  
  /*****************************************************************************************/
  /*****************************************************************************************/
