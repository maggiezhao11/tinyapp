const checkEmailExist = function (value, usersDB) {
  const keys = Object.keys(usersDB);
  for (let key of keys) {
    if (usersDB[key]['email'] === value) {
      return true;
    }
  } return false;
};

module.exports = { checkEmailExist };