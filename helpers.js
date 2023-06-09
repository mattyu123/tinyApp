//function that will look to find a user in the user object - returns null if the user is not found, will return entire object if it is
const lookUserUp = function (email, obj){
  for (const item in obj) {
    if (email === obj[item].email) {
      return obj[item];
    }
  }
  return null;
};

//function that returns the an object of the URLs where userID is equal to the current logged in user
const urlsForUser = function (cookie, database) {
  let final = {};

  for (const item in database) {
    if (database[item].userID === cookie) {
      console.log(database[item])
      final[item] = database[item].longURL
    }
  }
  return final;
}

//function to generate a random unique 6 character string
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {lookUserUp, urlsForUser, generateRandomString}