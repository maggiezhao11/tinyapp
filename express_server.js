const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const {checkEmailExist} = require('./helpers');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");//set ejs as the view engine
app.use(bodyParser.urlencoded({extended: true})); //add middleware in order to review body of POST when its sent as a Buffer
app.use(cookieParser()); //add middleware in order to get cookie information in a proper way
app.use(cookieSession({
  name: "session",
  keys: ["tempPassword", "tempPassword1"],
}));



//function to create a random 6 characters shortURL
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length - 1));
 }
 return result;
};


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }
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

//create a function to filter users
const urlsForUser= function (id) {
  const urlList = [];
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      urlList.push({shortURL: item, longURL:urlDatabase[item].longURL});
    }
  } return urlList;
};


//adding a route for /urls
app.get("/urls", (req, res) => {
  let currentUserURLs = urlsForUser(req.session.user_id);
  let user = users[req.session.user_id]
  console.log("currentUserURLs:", currentUserURLs);
  const templateVars = { urls: currentUserURLs, user: users[req.session.user_id]};
  if (user && currentUserURLs.length > 0) {
  res.render("urls_index", templateVars);    
  } else if ( user && currentUserURLs.length === 0) {
    //res.send("you don't have any URLs created")
    res.render('error');
  } else {
    res.send("pls login or register first");
  }
});


//adding a NEW route to show the form
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
    if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


//adding a route for /urls
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  // console.log("urlDatabase:", urlDatabase);
  //console.log("longURL:", urlDatabase[req.params.shortURL]);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  //let userID = req.cookies["user_id"];
  let userID = req.session.user_id;
  //let userID = urlDatabase[req.params.id].userID
  urlDatabase[shortUrl] = {userID: userID, longURL: req.body.longURL};
  console.log("req.body:", req.body);  // Log the POST request body to the console
  console.log(urlDatabase);
  res.status(300);
  res.redirect(`/urls/${shortUrl}`);
  //res.send("Ok");         // Respond with 'Ok' 
});

// add new redirect route to redirect any shortURLs to its longURL.
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]){
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  } else {
    res.status(404).send("page not found");
  }
});

// add a post route to remove a URL (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log("shorturls:", urlDatabase[req.params.id])
  let userID = urlDatabase[req.params.shortURL].userID
  //if (req.cookies["user_id"] == userID) {
    if (req.session.user_id == userID) {
    const urlToBeDeleted = req.params.shortURL;
    delete urlDatabase[urlToBeDeleted];
    res.redirect('/urls');
  } else {
    res.send('you are not allowed to delete');
  }
});


// add a post route to edit a URL (EDIT)
app.post("/urls/:id", (req, res) => {
  // console.log("req.body:", req.body);
  // console.log(req.params);
  //console.log("req.session:", req.session);
  console.log("shorturls:", urlDatabase[req.params.id])
  let userID = urlDatabase[req.params.id].userID
  //if (req.cookies["user_id"] == userID) {
    if (req.session.user_id == userID) {
    urlDatabase[req.params.id] = {longURL:req.body.longURL, userID: userID};
    res.redirect('/urls');
  } else {
    res.send('you are not allowed to edit');
  }
  //const templateVars = { shortURL: req.params.shortURL,longURL: newLongURL };
  //res.render('urls_show', templateVars);
});



// // add a route to handle short URLs requests by anyone
// app.get("/u/:id", (req, res) => {

// });


// add a route to handle new login page
app.get("/login", (req, res) => {
  //const templateVars = { email: req.body.email, password: req.body.password, user: users[req.cookies["user_id"]]};
  const templateVars = { email: req.body.email, password: req.body.password, user: users[req.session.user_id]};
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
    return res.status(403).send("userID not found");
  } 
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(403).send("password is wrong");
  } else {
  //res.cookie('user_id', user.id);
  req.session.user_id = user.id
  res.redirect('/urls');
  }
});

// add a route to handle logout (implement logout client and server logic)
app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  res.clearCookie(req.session.user_id);
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {id, email, password:hashedPassword};
  // console.log(users); 
  // console.log("keys:", Object.keys(users)); 
  if (email.length === 0 || hashedPassword.length === 0) {
    res.status(400).send("email or password is empty");
  } else if (checkEmailExist(email, users)) {
    res.status(400).send("userID already exists");
  } else {
    console.log("user____:", user);
  users[id] = user;
  //res.cookie("user_id", id);
  req.session.user_id = id;
  res.redirect('/urls');
  }
});




