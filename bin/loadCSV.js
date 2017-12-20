/* Use indian-ocean data package to read in CSV of student records and
populate the mongo collection prior to accepting student submissions
of 360-degree reviews
 */
const io = require('indian-ocean')
const Students = require('../models/student')


//Pull in data from CSV: Docs at https://mhkeller.github.io/indian-ocean/
//
const students = io.readDataSync('../data/a2_groupmembers.csv')

//For each student, set up a document in mongo
//The data file is generated in Blackboard from the Group tab...Export Groups
//
students.map(student => {
    student.username = student['User Name']
    student.BUID = student['Student Id']
    student.firstName = student['First Name']
    student.lastName = student['Last Name']
    student.section = student['Section']
    student.groupNumber = student['Group Code']
    student.submittedReview = false

    //password functions are on the model, so we first have to create an
    //instance of the model before using setPassword.
    //
    const newStudent = new Students(student)

    newStudent.setPassword(student['BUID'])
    newStudent.save(function (err) {
        if (err) {
            console.log('Save error:', err.message)
        }
        else {
            console.log('Saved', student.firstName, 'in', student.groupNumber)
        }
    })
})

//Sanity check...how many members does each group have?
//db.reviews.find({'groupNumber': 5}).count()
//

