const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const {checkEmailExist} = require('./helpers');

app.set("view engine", "ejs");//set ejs as the view engine
app.use(bodyParser.urlencoded({extended: true})); //add middleware in order to review body of POST when its sent as a Buffer
app.use(cookieParser()); //add middleware in order to get cookie information in a proper way




//function to create a random 6 characters shortURL
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length - 1));
 }
 return result;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// create an newGlobalDB for users
const users = { 
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


//register a handler on the root path,"/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//adding routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//adding a route for /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

//adding a NEW route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//adding a route for /urls
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  // console.log("urlDatabase:", urlDatabase);
  //console.log("longURL:", urlDatabase[req.params.shortURL]);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  console.log("req.body:", req.body);  // Log the POST request body to the console
  console.log(urlDatabase);
  res.status(300);
  res.redirect(`/urls/${shortUrl}`);
  //res.send("Ok");         // Respond with 'Ok' 
});

// add a post route to remove a URL (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToBeDeleted = req.params.shortURL;
  delete urlDatabase[urlToBeDeleted];
  res.redirect('/urls');
});


// add a post route to edit a URL (EDIT)
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.id;
  urlDatabase[req.params.id] = newLongURL;
  res.redirect('/urls');
  //const templateVars = { shortURL: req.params.shortURL,longURL: newLongURL };
  //res.render('urls_show', templateVars);
});

// add a route to handle new login page
app.get("/login", (req, res) => {
  const templateVars = { email: req.body.email, password: req.body.password, user: users[req.cookies["user_id"]]};
  res.render('urls_login', templateVars);
});


// add a route to handle login (set a cookie as an userID)
app.post("/login", (req, res) => {
  //console.log("/login", req);
  //console.log("/login", req.params);
  const email = req.body.email;
  const password = req.body.password;
  const user = checkEmailExist(email, users);
  if (!user) {
    res.status(403).send("userID not found");
  } else if (password !== user.password) {
    res.status(403).send("password is wrong");
  } else {
  res.cookie('user_id', user.id);
  res.redirect('/urls');
  }
});


//function check out userEmail is included in the db
// const checkEmailExist = function (value, usersDB) {
//   const keys = Object.keys(usersDB);
//   for (let key of keys) {
//     const user = usersDB[key];
//     if (user['email'] === value) {
//       return user;
//     }
//   } return false;
// };



// add a route to handle logout (implement logout client and server logic)
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// add user registration form route handler
app.get("/register", (req, res) => {
  const templateVars = { email: req.body.name, password: req.body.email, user: users[req.cookies["user_id"]]};
  res.render("urls_register", templateVars);
});


// create an endpoint to handle the registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = {id, email, password};
  // console.log(users); 
  // console.log("keys:", Object.keys(users)); 
  if (email.length === 0 || password.length === 0) {
    res.status(400).send("email or password is empty");
  } else if (checkEmailExist(email, users)) {
    res.status(400).send("userID exists");
  } else {
  users[id] = user;
  res.cookie("user_id", id);
  res.redirect('/urls');
  }
});




