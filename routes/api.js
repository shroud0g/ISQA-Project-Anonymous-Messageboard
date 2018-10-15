/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
var db = require('../db');
var ObjectID = require('mongodb').ObjectID;
var expect = require('chai').expect;

/*
I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields.
I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')
I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} and pass along the thread_id. (Text response will be 'success')
I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')
Complete functional tests that wholely test routes and pass.*/

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    //GET
    .get((req, res) => {
      let board = req.params.board;
      db.get().collection(board).find({}, {limit: 10, projection: {reported: 0, delete_password: 0}, sort: {bumped_on: -1}}).toArray((err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send(result);
        }
      })
    })
  
    //POST
    .post((req, res) => {
      let board = req.params.board,
          delete_password = req.body.delete_password,
          text =  req.body.text;
    
      if (board == '' || delete_password == '' || text == '') {
        return res.status(400).send('missing input');
      }
      let id = new ObjectID;
      let time = new Date();
      db.get().collection(board).insertOne({text, created_on: time, bumped_on: time, reported: false, delete_password, replies: []}, (err, success) => {
        if (err) throw err;
        if (success) {
          res.status(200).redirect('/b/' + board);
        }
      })
    })
    //DELETE
    .delete((req, res) => {
      let board = req.params.board,
          delete_password = req.body.delete_password,
          thread_id;
      
      if (board == '' || delete_password == '') {
        return res.status(400).send('invalid password');
      }
      
      try {
        thread_id = ObjectID(req.body.thread_id);
      }
      catch(err) {
        res.status(400).send('invalid id');
      }
    
      db.get().collection(board).findOneAndDelete({_id: thread_id, delete_password}, (err, success) => {
        if (err) throw err
        if (success.value != null) {
          res.status(200).send('success');
        }
        else {
          res.status(400).send('wrong password');
        }
      })
    })
  
    //PUT
    .put((req, res) => {
      let board = req.params.board,
          thread_id;
      
      if (board == '') {
        return res.status(400).send('missing board');
      }
    
      try {
        thread_id = ObjectID(req.body.thread_id);
      }
      catch(err) {
        res.status(400).send('invalid id');
      }  
      
      db.get().collection(board).updateOne({_id: thread_id}, { $set: {reported: true} }, (err, success) => {
        if (err) throw err;
        if (success) {
          res.status(200).send('reported');
        }
      })
    })
    

  app.route('/api/replies/:board')
    //GET
    .get((req, res) => {
      let thread_id;
      try {
        thread_id = ObjectID(req.query.thread_id);
      }
      catch(err) {
        res.status(400).send('invalid id');
      }
      let board = req.params.board;
      if (board == '') {
        
        return res.status(400).send('missing board');
      }
    
      db.get().collection(board).find({_id: thread_id}, {sort: {bumped_on: -1}, projection: {reported: 0, delete_password: 0, 'replies.delete_password': 0, 'replies.reported': 0}}).toArray((err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).json(result[0]);
        }
      })
    })
  
    //POST
    .post((req, res) => {
      let id;
      try {
        id = ObjectID(req.body.thread_id);
      }
      catch(err) {
        res.status(400).send('invalid id');
      }
      
      let board = req.params.board,
          delete_password = req.body.delete_password,
          text =  req.body.text;
    
      if (board == '' || delete_password == '' || text == '') {
        return res.status(400).send('missing input');
      }
      
      let time = new Date();
      
      db.get().collection(board).findOneAndUpdate({_id: id}, {$set: {bumped_on: time}, $push: { replies: { _id: new ObjectID(), text, delete_password, reported: false, created_on: time }}}, (err, success) => {
        if (err) throw err;
        if (success) {
          res.status(200).redirect('/b/' + board + '/' + req.body.thread_id);
        }
        else {
          res.status(400).send('err');
        }
      })
    })
  
    //Delete
    .delete((req, res) => {
      let board = req.params.board,
          delete_password = req.body.delete_password,
          reply_id,
          thread_id;
        
      if (board == '' || delete_password == '') {
        return res.status(400).send('missing input');
      }
        
      try {
          thread_id = ObjectID(req.body.thread_id);
          reply_id = ObjectID(req.body.reply_id);
        }
        catch(err) {
          res.status(400).send('invalid id');
        }
      db.get().collection(board).updateOne({'replies._id': reply_id, 'replies.delete_password': delete_password}, { $set: {'replies.$[reply].text': '[deleted]'} }, {arrayFilters: [{'reply._id': reply_id, 'reply.delete_password': delete_password}]},(err, success) => {
        if (err) throw err;
        if (success.matchCount != 0) {
          res.status(200).send('success');
        }
        else {
          res.status(400).send('wrong password');
        }
      })  
    })
    //PUT
    .put((req, res) => {
      let board = req.params.board,
          reply_id,
          thread_id;
      
      if (board == '') {
        return res.status(400).send('missing board');
      }
    
      try {
        reply_id = ObjectID(req.body.reply_id);
        thread_id = ObjectID(req.body.thread_id);
      }
      catch(err) {
        res.status(400).send('invalid id');
      }  
      
      db.get().collection(board).updateOne({'replies._id': reply_id}, { $set: {'replies.$[reply].reported': true} }, {arrayFilters: [{'reply._id': reply_id}]}, (err, success) => {
        if (err) throw err;
        if (success) {
          res.status(200).send('reported');
        }
      })
    })
        

};
