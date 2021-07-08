const { assert } = require('chai');

const { checkEmailExist } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkEmailExist', function() {
  it('should return a user with valid email', function() {
    const user = checkEmailExist("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput, 'user exists');
  });
  
  it('should return undefined with invalid email', function() {
    const user = checkEmailExist("user3@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput, 'user does not exist');
  });

});