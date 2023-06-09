const { assert } = require('chai');

const { lookUserUp } = require('../helpers.js');

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

describe('lookUserUp', function() {
  it('should return the valid user object', function() {
    const user = lookUserUp("user@example.com", testUsers)
    const expectedUserObject = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedUserObject)
  });

  it('should return null if the user does not exist', function() {
    const user = lookUserUp("notInDatabase@example.com", testUsers)
    assert.isNull(user)
  })
});