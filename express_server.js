const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { checkEmailExist } = require("./helpers");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { checkUserLogin } = require("./helpers");
const { generateRandomString } = require("./helpers");

app.set("view engine", "ejs"); //set ejs as the view engine
app.use(bodyParser.urlencoded({ extended: true })); //add middleware in order to review body of POST when its sent as a Buffer
app.use(cookieParser()); //add middleware in order to get cookie information in a proper way
app.use(
  cookieSession({
    name: "session",
    keys: ["tempPassword", "tempPassword1"],
  })
); // add cookie session to secure password/userID

//updated DB
const urlDatabase = {
  Qb6UTx: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

// create an newGlobalDB for users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//register a handler on the root path,"/"
app.get("/", (req, res) => {
  if (checkUserLogin(req, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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
const urlsForUser = function (id) {
  const urlList = [];
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      urlList.push({ shortURL: item, longURL: urlDatabase[item].longURL });
    }
  }
  return urlList;
};

//adding a route for /urls
app.get("/urls", (req, res) => {
  let currentUserURLs = urlsForUser(req.session.user_id);
  let user = users[req.session.user_id];
  const templateVars = {
    urls: currentUserURLs,
    user: users[req.session.user_id],
    errorMessage: "you don't have any URLs created",
  };
  if (user && currentUserURLs.length > 0) { //user owns urls
    res.render("urls_index", templateVars);
  } else if (user && currentUserURLs.length === 0) { //user doesn't own urls
    res.status(200);
    res.render("error_no_urls", templateVars);
  } else {
    res.status(403);
    res.render("error_no_login");
  }
});

//adding a NEW route to show the form
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//adding a route for reading /urls
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    return res.render("error", { errorMessage: "page is not found" }); // if the shortURL doesn't exist in the DB
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  let userID = urlDatabase[req.params.shortURL].userID;
  if (checkUserLogin(req, users) && req.session.user_id === userID) {  //user logged in and owns urls
    res.render("urls_show", templateVars);
  } else if (!checkUserLogin(req, users)) {
    res.status(403);
    res.render("error", { errorMessage: "you are not logged in" }); // user haven't login
  } else if (templateVars.longURL.length === 0) {
    res.status(404);
    res.render("error", { errorMessage: "page is not found" }); //url doesn't exist
  } else {
    res.status(403);
    res.render("error", {
      errorMessage: "you doesn't own the url with logged in ID"});//user logged in and doesn't own urls
  }
});

// add new route to send form to urls
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  let userID = req.session.user_id;
  if (checkUserLogin(req, users)) {
    urlDatabase[shortUrl] = { userID: userID, longURL: req.body.longURL };
    res.status(300);
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.render("error", { errorMessage: "you have to login first" });
  }
});

// add new redirect route to redirect any shortURLs to its longURL.
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.render("error", { errorMessage: "page is not found" });
  }
});

// add a post route to remove a URL (DELETE)
app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = urlDatabase[req.params.shortURL].userID;
  if (checkUserLogin(req) && req.session.user_id === userID) {
    const urlToBeDeleted = req.params.shortURL;
    delete urlDatabase[urlToBeDeleted];
    res.redirect("/urls");
  } else if (!checkUserLogin(req, users)) {
    res.status(403);
    res.render("error", { errorMessage: "you are not logged in" });
  } else {
    res.status(403);
    res.render("error", {
      errorMessage: "you doesn't own the url with logged in ID" });
  }
});

// add a post route to edit a URL (EDIT)
app.post("/urls/:id", (req, res) => {
  let userID = urlDatabase[req.params.id].userID;
  if (checkUserLogin(req, users) && req.session.user_id === userID) {
    urlDatabase[req.params.id] = { longURL: req.body.longURL, userID: userID };
    res.redirect("/urls");
  } else if (!checkUserLogin(req, users)) {
    res.status(403);
    res.render("error", { errorMessage: "you are not logged in" });
  } else {
    res.status(403);
    res.render("error", {
      errorMessage: "you doest own the url with logged in ID"});
  }
});

// add a route to handle new login page
app.get("/login", (req, res) => {
  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

// add a route to handle login (set a cookie as an userID)
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = checkEmailExist(email, users);
  if (!user) {
    res.status(404);
    res.render("error", { errorMessage: "userID not found" });
  }
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    res.status(403);
    res.render("error", { errorMessage: "password is wrong" });
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// add a route to handle logout (implement logout client and server logic)
app.post("/logout", (req, res) => {
  req.session = null; // clear cookie session, set it null or clear cookie.
  res.redirect("/urls");
});

// add user registration form route handler
app.get("/register", (req, res) => {
  const templateVars = {
    email: req.body.name,
    password: req.body.email,
    user: users[req.session.user_id],
  };
  if (checkUserLogin(req, users)) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

// create an endpoint to handle the registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id, email, password: hashedPassword };
  if (email.length === 0 || password.length === 0) {
    res.status(403);
    res.render("error", { errorMessage: "email or password is empty" });
  } else if (checkEmailExist(email, users)) {
    res.status(403);
    res.render("error", { errorMessage: "userID already exists" });
  } else {
    users[id] = user;
    req.session.user_id = id;
    res.redirect("/urls");
  }
});
