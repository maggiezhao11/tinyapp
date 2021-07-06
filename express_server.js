const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');



app.set("view engine", "ejs");//set ejs as the view engine
app.use(bodyParser.urlencoded({extended: true})); //add middleware in order to review body of POST when its sent as a Buffer

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//adding a NEW route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//adding a route for /urls
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
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

// add a route to handle login (set a cookie as an username)
app.post("/login", (req, res) => {
  //console.log("/login", req);
  //console.log("/login", req.params);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});


