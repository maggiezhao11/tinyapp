const checkEmailExist = function (email, usersDB) {
  const keys = Object.keys(usersDB);
  for (let key of keys) {
    const user = usersDB[key];
    if (user['email'] === email) {
      return user;
    }
  } return false;
};

const checkUserLogin = function (req) {
  if (req.session.user_id) {
    return true;
  } return false;
};


module.exports = { checkEmailExist, checkUserLogin };