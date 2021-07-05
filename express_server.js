const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");//set ejs as the view engine

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
//adding a route for /urls
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,longURL: urlDatabase[req.params.shortURL]};
  // console.log("urlDatabase:", urlDatabase);
  // console.log("longURL:", urlDatabase[req.params.shortURL]);
  res.render("urls_show", templateVars);
});