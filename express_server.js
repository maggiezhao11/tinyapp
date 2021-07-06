const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");



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
  res.status(200);
  res.render("urls_index", templateVars);
});

//adding a NEW route to show the form
app.get("/urls/new", (req, res) => {
  res.status(200);
  res.render("urls_new");
});

//adding a route for /urls
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,longURL: urlDatabase[req.params.shortURL]};
  // console.log("urlDatabase:", urlDatabase);
  // console.log("longURL:", urlDatabase[req.params.shortURL]);
  res.status(200);
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

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,longURL: urlDatabase[req.params.shortURL]};
  //const shortUrl = req.params.shortURL;
  //res.redirect(`/urls/${shortUrl}`);
  res.status(300);
  res.render("urls_show", templateVars)
});

//YcrAJI