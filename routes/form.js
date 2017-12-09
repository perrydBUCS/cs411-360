const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Students = require('../models/student')

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
            //See if the password was correct
            //
            if (!student) {
                res.send(401, 'User not found in database')
            }
            else {
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
            }
        })
    })

router.route('/submit')
    .post(function (req, res, next) {
        const submitter = req.body.submitter
        const members = req.body.members

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
        console.log('Setting comments for', submitter.username)
//        console.log('Comments:', comments)
        //todo Handle errors from mongo
        //update the submitter's essay questions and mark that the submission is made
        Students.findOneAndUpdate({username: submitter.username},
            {comments: comments, submittedReview: true},
            function (err, response) {
//                console.log('error:', err, 'response:', response)
                console.log('Setting scores for group members')
                members.map(member => {
                    //Now update the scores for each member in the group
                    Students.findOneAndUpdate(
                        {username: member.username},
                        {$push: {scores: member.scores}},
                        function (err, response) {
                            console.log('Set scores for', member.username)
                        })
                })
            })
        //todo Send 'success' message back to client
        res.json({status: 'success'})

    })


module.exports = router
