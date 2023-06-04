const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//add a route to handle the urls that come into our template
app.get('/urls', (req, res) => {
  const templateVars = urlDatabase;
  res.render('urls_index.ejs', templateVars)
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