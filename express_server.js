const express = require("express");
const morgan = require("morgan")
const app = express();
const PORT = 8080; // default port 8080

app.use(morgan('dev'))

//middleware to use ejs 
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//add a route to handle the urls that come into our template
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render('urls_index', templateVars) //testing that the connection can be established
});

//new route to render template with access to specific url id
app.get("/urls/:id", (req, res) => {
  
  const templateVars = { id: req.params.id, longURL: req.params.urlDatabase };

  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//listens for a connection to the server and returns to the user that the connection has been established 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});