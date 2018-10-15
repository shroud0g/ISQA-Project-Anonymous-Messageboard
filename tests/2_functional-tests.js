/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Post redirects to board', function(done) {
        chai.request(server)
          .post('/api/threads/test')
          .send({text: 'hey!', delete_password: 123})
          .end((err, res) => {
            assert.equal(res.redirects[0].split('/').pop(), 'test');
            assert.equal(res.status, 200);
            done();
        })
      })
    });
    
    suite('GET', function() {
      test('Get returns threads in JSON', function(done) {
        chai.request(server)
          .get('/api/threads/test')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 200);
            assert.typeOf(res.body[0].text, 'string');
            done();
        })
      })
    });
    
    suite('DELETE', function() {
      test('Deletes entire board', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id: '5bc42d6575819f59a26e60af', delete_password:123})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
        })
      })
    });
    
    suite('PUT', function() {
      test('PUT reports thread', function(done) {
        chai.request(server)
          .put('/api/threads/test')
          .send({thread_id: '5bc41ff9ee98ca0e15ceaa1c'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
        })
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Post redirects to thread', function(done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({thread_id: '5bc42d33e3fa7a58959c27a8', text: 'heyo', delete_password: 123})
          .end((err, res) => {
            assert.equal(res.redirects[0].split('/').pop(), '5bc42d33e3fa7a58959c27a8');
            assert.equal(res.status, 200);
            done();
        })
      })
    });
    
    suite('GET', function() {
      test('Get gets replies for thread', function(done) {
        chai.request(server)
            .get('/api/replies/test')
            .query({thread_id: '5bc42d33e3fa7a58959c27a8'})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isArray(res.body.replies);
              assert.typeOf(res.body.replies[0].text, 'string');
              done();
          })
        })
      })
    
    
    suite('PUT', function() {
      test('PUT reports reply', function(done) {
        chai.request(server)
            .put('/api/replies/test')
            .send({thread_id: '5bc42d33e3fa7a58959c27a8', reply_id:'5bc42d92aacf775baa0367f4'})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'reported');
              done();
          })
        })
    });
    
  
    
    suite('DELETE', function() {
      test('Deletes reply', function(done) {
        chai.request(server)
            .delete('/api/replies/test')
            .send({thread_id: '5bc42d33e3fa7a58959c27a8', reply_id: '5bc42d92aacf775baa0367f4', delete_password: 123})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'success');
              done();
          })
        })
    });

  })
})