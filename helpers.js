const checkEmailExist = function (value, usersDB) {
  const keys = Object.keys(usersDB);
  for (let key of keys) {
    const user = usersDB[key];
    if (user['email'] === value) {
      return user;
    }
  } return false;
};


module.exports = { checkEmailExist };