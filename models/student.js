/*
 Primary model for students
 */
const mongoConfig = require('../config/mongo')
const mongoose = require('mongoose')
const crypto = require('crypto')

//Set up ES6 Promises
mongoose.Promise = global.Promise

//If there's already a connection, we'll just use that, otherwise connect here.
//
if (!mongoose.connection.db) {
    mongoose.connect(mongoConfig.CONNECTION_STRING)
}
const db = mongoose.connection

const Schema = mongoose.Schema

const studentSchema = new Schema({
    username    : {
        type    : String,
        unique  : true
    },
    BUID: String,
    passwordHash: String,
    passwordSalt: String,

    firstName: {
        type    : String,
        required: false
    },
    lastName: String,
    section: String,
    groupNumber: Number,
    //todo Changed this to array of arrays, test to make sure it works
    scores: [[Number]],
    comments: [{
        topic: String,
        response: String
    }],
    submittedReview: Boolean
})

//Set up the findOrCreate plugin
//user.plugin(findOrCreate)



/*
 Add a method to the schema that takes a plaintext password and stores the hashed
 value, along with the salt, in the document
 */
//todo The digest type should be a param (in fact all these should be...)
studentSchema.methods.setPassword = function (password) {
    this.passwordSalt = crypto.randomBytes(16).toString('hex')
    this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 1000, 64, 'sha256').toString('hex')
}

studentSchema.methods.checkPassword = function (password) {
    let testHash = crypto.pbkdf2Sync(password, this.passwordSalt, 1000, 64, 'sha256').toString('hex')
    return testHash === this.passwordHash
}

//This method finds other students in the same group and section
//
studentSchema.methods.findOthersInGroup = function (cb) {
    return Students.find({groupNumber: this.groupNumber, section: this.section}, {passwordSalt: 0, passwordHash: 0}, cb)
}
//The mongo collection will be users in the cs411-360 database...Mongoose adds an 's'
//to the end of the model name automatically unless the collection ends in a digit
//or is explicitly set as an option
//
const Students = mongoose.model('review', studentSchema)

module.exports = Students

