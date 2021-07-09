//function to check if user email is exist
const checkEmailExist = function(email, usersDB) {
  const keys = Object.keys(usersDB);
  for (let key of keys) {
    const user = usersDB[key];
    if (user["email"] === email) {
      return user;
    }
  }
  return false;
};

//function to check user login status
const checkUserLogin = function(req, users) {
  if (users[req.session.user_id]) {
    return true;
  }
  return false;
};


//function to create a random 6 characters shortURL
const generateRandomString = function() {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length - 1)
    );
  }
  return result;
};
module.exports = { checkEmailExist, checkUserLogin, generateRandomString };
