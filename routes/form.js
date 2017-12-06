const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Students = require('../models/student')


const currentUser = 'wanlx'
const currentGroup = 3

router.route('/')
    .get(function (req, res, next) {
        //Find group members for current user
        //
        Students.find({groupNumber: currentGroup}, 'username firstName lastName', function (err, result) {
            if (err) {
                console.log(err.message)
            }
            else {
                res.send(result)
            }
        })

    })
    .post(function (req, res, next) {
        console.log('looking for', req.body.username)
        Students.findOne({username: req.body.username}, function (err, student) {
            //todo Handle err
            console.log(student)
            //See if the password was correct
            //
            console.log('Password matches:', student.checkPassword(req.body.BUID))
            student.findOthersInGroup(function (err, others) {
                let groupData = {}
                groupData.currentStudent = student.username
                groupData.groupNumber = student.groupNumber
                groupData.group = others
                res.cookie('cs411Auth', true)
//                console.log(others)
                res.json(groupData)
            })
        })
    })

router.route('/submit')
    .post(function (req, res, next) {
        const submitter = req.body.submitter
        const members = req.body.members

        //member.username
        //member.scores[1,2,3,4,5]
        //Grab essay comments and push them to array of objects
        //todo This is pretty ugly...any way to build this dynamically?
        let comments = [
            {
                topic: 'different',
                response: submitter.essay.different
            },
            {
                topic: 'difficulty',
                response: submitter.essay.difficulty
            },
            {
                topic: 'success',
                response: submitter.essay.success
            }
        ]

        //todo Handle errors from mongo
        //update the submitter's essay questions and mark that the submission is made
        Students.findOneAndUpdate({username: submitter.username},
            {comments: comments, submittedReview: true},
            function (err, response) {
                console.log(response)

            })

        members.map(member => {
            //Now update the scores for each member in the group
            Students.findOneAndUpdate(
                {username: member.username},
                {$push: {scores: member.scores}},
                function (err, response) {
                    console.log('Set scores for', member.username)
                }
            )

        })
        //todo Send 'success' message back to client
        res.send('success')

    })


module.exports = router
