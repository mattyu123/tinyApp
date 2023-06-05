const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080

//setting up all the middleware that we need
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

//middleware to use ejs
app.set("view engine", "ejs");

//function to generate a random unique 6 character string
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//add a route to handle the urls that come into our template
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render('urls_index', templateVars); //testing that the connection can be established
});

//Create a get route to render the urls_new.ejs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//sends a post request to the server
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  
  const id = generateRandomString()
  const longURL = req.body.longURL

  urlDatabase[id] = longURL //updates the urlDatabase with the random shortened URL and the submitted form URL

  res.redirect(`/urls/${id}`) //redirect to the new URL with the id in the path
});

//new route to render template with access to specific url id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[req.params.id]

  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

//takes the short form URL and redirects it to the long form URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id

  const longURL = urlDatabase[id]
  res.redirect(longURL);
});



app.get("/", (req, res) => {
  res.send("Hello! You have reached the home page");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//old code at the beginning, commenting out for now 
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//listens for a connection to the server and returns to the user that the connection has been established
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});