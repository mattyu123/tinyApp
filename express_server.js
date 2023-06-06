const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

//setting up all the middleware that we need
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//function to generate a random unique 6 character string
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//add a route to handle the urls that come into our template
//Request also takes the cookies that were generated
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render('urls_index', templateVars); //testing that the connection can be established
});

//Create a get route to render the urls_new.ejs
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//sends a post request to the server
app.post("/urls", (req, res) => {
  
  const id = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[id] = longURL; //updates the urlDatabase with the random shortened URL and the submitted form URL

  res.redirect(`/urls/${id}`); //redirect to the new URL with the id in the path
});

//new route to render template with access to specific url id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];

  const templateVars = { id, longURL, username: req.cookies["username"], };
  res.render("urls_show", templateVars);
});

//takes the short form URL and redirects it to the long form URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//post route that removes a url resources and redirects user back to url home page
app.post("/urls/delete/:id", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect("/urls");
});

//post route that updates a URL reasource and redirects back to the /urls page
app.post("/urls/edit/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body["updatedURL"];
  res.redirect("/urls");
});

//post route that handles the login request to create a cookie and store it
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//post route that will
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello! You have reached the home page");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//listens for a connection to the server and returns to the user that the connection has been established
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});