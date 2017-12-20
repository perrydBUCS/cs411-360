/* Load CS411 peer reviews from mongo and calculate the average
scores. Write these, and a few other pertinent data bits, to a CSV
suitable for droppoing into the grade sheet
 */

//todo Insert scores directly into grade sheet
const appConfig = require('../config/appConfig')
const io = require('indian-ocean')
const Students = require('../models/student')

console.log('Starting run...')

Students.find({}, function (err, students) {

    if (err) {
        console.log('Error fetching students from mongo')
    } else {
        //Calculate review average for each
        //
        console.log('Calculating averages...')
        students.map(student => {
            calculateReviewAverage(student)
        })
    }
})


let calculateReviewAverage = function (theStudent) {
//Set up initial conditions
//
    const maxCategoryValue = appConfig.maxCategoryValue
    const numberOfCategories = appConfig.numberOfCategories
    const numberOfReviews = theStudent.scores.length
    const maxPoints = maxCategoryValue * numberOfCategories

//Array to hold the sum of each sub array in reviewScores
//
    let totals = []

//Push the sum of each sub array into totals
//
    theStudent.scores.map(array => totals.push(array.reduce((acc, next) => acc + next)))

//Add up the sum of each sub array...they are in totals[]
//
    const sumOfAllReviews = totals.reduce((acc, next) => acc + next)

//Calculate average
//
    const peerAverage = 100 * ((sumOfAllReviews / numberOfReviews) / maxPoints)
//Get number in group
    //
    theStudent.findOthersInGroup(function (err, result) {
        let numberInGroup = result.length
        let csvString = [{
            section: theStudent.section, group: theStudent.groupNumber, user: theStudent.username, average: peerAverage.toPrecision(4),
            numReviews: numberOfReviews, numGroup: numberInGroup, submittedReview: theStudent.submittedReview
        }]
        console.log(theStudent.username + ', ', peerAverage.toPrecision(4) + ', ', numberOfReviews, '/', numberInGroup)
        io.appendDataSync('../data/averages.csv', csvString, {makeDirectories: true}, function (err, val) {
            console.log(err)

            return peerAverage

        })
    })
}

