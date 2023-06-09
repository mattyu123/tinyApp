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

//HELPER FUNCTIONS DEFINED BELOW
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

//function that will look to find a user in the user object - returns null if the user is not found, will return entire object if it is
const lookUserUp = function (email, obj){
  for (const item in obj) {
    if (email === obj[item].email) {
      return obj[item];
    }
  }
  return null;
};

//function that returns the an array of the URLs where userID is equal to the current logged in user
const urlsForUser = function (cookie, database) {
  let final = {};

  for (const item in database) {
    if (database[item].userID === cookie) {
      console.log(database[item])
      final[item] = database[item].longURL
    }
  }
  return final;
}

const urlDatabase = {
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "userRandomID"
    },
    "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "userRandomID2"
    },
    "8j37t1": {
      longURL: "http://facebook.com",
      userID: "userRandomID2"
    },
  };

//users object contains the id, login and password for anyone who enters our app
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  userRandomID2: {
    id: "userRandomID2",
    email: "b@b.com",
    password: "abcd",
  },
};

//add a route to handle the urls that come into our template
//Request also takes the cookies that were generated
app.get('/urls', (req, res) => {
  const id = req.params.id;
  const loggedInUser = users[req.cookies.user_id];

  if (loggedInUser === undefined) {
    res.send("You are not logged in, please login first")
    return;
  }

  const finalURLs = urlsForUser(req.cookies.user_id, urlDatabase)

  // pass in only the urls that belong to the user
   const templateVars = {
    urls: finalURLs,
    user: loggedInUser
  };

  res.render('urls_index', templateVars); //testing that the connection can be established
});

//create a route for the registration page when the user wants to login
app.get('/register', (req, res) => {
  const loggedInUser = users[req.cookies.user_id];
  
  //if user is already logged in, redirects user to the /url page
  if (loggedInUser) {
    res.redirect("/urls")
    return
  }

  res.render('registration');
});

//route that handles the registration form data and adds the new login to users object
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  //if there is no email or password, then sends 400 error code with error message
  if (!email || !password) {
    return res.status(400).send("You must enter a username or password");
  }
  
  //if the email already exists, then you cannot continue
  if (lookUserUp(email, users)) {
    return res.status(400).send("An email like this already exists");
  }

  //generates a new random ID for the user
  const newUserID = generateRandomString();
  
  //adds the newly generated userID to the users object
  users[newUserID] = {
    id: newUserID,
    email,
    password
  };
  
  //create a cookie with the user's newly generated ID
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

//Create a get route to render the urls_new.ejs
app.get("/urls/new", (req, res) => {
  const loggedInUser = users[req.cookies.user_id];
  
  // if user is not logged in, they cannot add a new URL and redirects them to login page
  if (loggedInUser === undefined) {
    res.redirect("/login")
    return
  }

  const templateVars = {
    user: users[req.cookies.user_id] 
  };

  res.render("urls_new", templateVars);
});

//sends a post request to the server
app.post("/urls", (req, res) => {
  const loggedInUser = users[req.cookies.user_id];
  
  // if user is not logged in, tell the user why they cannot shorten URLs
  if (loggedInUser === undefined) {
    res.send("You must be logged in to be able to shorten URLs").redirect("/login")
    return
  }

  const id = generateRandomString();
  const longURL = req.body.longURL;

  //updated urlDatabase that will add the longURL, and the userID of the person adding the URL
  urlDatabase[id] = {
    longURL,
    userID: req.cookies.user_id
  }

  res.redirect(`/urls/${id}`); //redirect to the new URL with the id in the path
});

//new route to render template with access to specific url id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const loggedInUser = users[req.cookies.user_id];

  console.log(loggedInUser)

  //check to see if the user is logged in or not
  if (loggedInUser === undefined) {
    res.send("You are not logged in. Log in first and try again");
    return;
  }

  //check to see if the page exists
  if (urlDatabase[id] === undefined) {
    res.send("This page does not exist. Try a different short URL")
    return
  }

  //check to see if the shortURL belongs to the logged in user
  if (urlDatabase[id].userID !== loggedInUser.id){
    res.send("The shortURL Does not belong to you! Please try again");
    return;
  }

  const longURL = urlDatabase[req.params.id]["longURL"];
  const templateVars = { id, longURL, user: users[req.cookies.user_id], }; //this used to be username, changed it to user
  
  res.render("urls_show", templateVars);
});

//takes the short form URL and redirects it to the long form URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  console.log(id)

  //alert the user if their shortform URL doesn't exist
  if (urlDatabase[id] === undefined) {
    res.send("You tried to access a shortened URL that doesn't exist")
    return
  }
  
  const longURL = urlDatabase[id]["longURL"];
  res.redirect(longURL);
});

app.post("/urls/:id", (res, req) => {
  const loggedInUser = users[req.cookies.user_id];
  const id = req.params.id;

  //check to see if the user is logged in or not
  if (loggedInUser === undefined) {
    res.send("You are not logged in");
    return;
  }

  if (id === undefined) {
    res.send("The ID does not exist");
    return;
  }

  //Check for the shorturl belongs to the logged in user
  if(urlDatabase[id].userID !== loggedInUser.id){
    res.send("The shortURL Does not belong to you! Please try again");
    return;
  }

  res.redirect("/urls")
})

//post route that removes a url resources and redirects user back to url home page
app.post("/urls/delete/:id", (req, res) => {
  const id = req.params.id;
  const loggedInUser = users[req.cookies.user_id];

  if (id === undefined) {
    res.send("This page does not exist");
    return;
  }

  if (loggedInUser === undefined) {
    res.send("You are not logged in");
    return;
  }

  if(urlDatabase[id].userID !== loggedInUser.id){
    res.send("The shortURL Does not belong to you! Please try again");
    console.log(urlDatabase)
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});


//post route that updates a URL resource and redirects back to the /urls page
app.post("/urls/edit/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id]["longURL"] = req.body["updatedURL"];

  res.redirect("/urls");
});

//route that renders the login page
app.get("/login", (req, res) => {
  const loggedInUser = users[req.cookies.user_id];
  
  //if user is already logged in, redirects user to the /url page
  if (loggedInUser) {
    res.redirect("/urls")
    return
  }
  
  res.render("login");
});

//post route that handles the login request to create a cookie and store it
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const checkLoginCredentials = lookUserUp(email,users);

  //if email cannot be found, return with 403 status code
  if (!checkLoginCredentials) {
    return res.status(403).send("your email address couldn't be found");
  }
  
  //if email is correct but password is not, tell the user
  if (checkLoginCredentials) {
    if (password !== checkLoginCredentials.password) {
      return res.status(403).send("Your password does not match");
    }
  }

  res.cookie("user_id", checkLoginCredentials.id);
  res.redirect("/urls");
});

//post route that will clear the user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//listens for a connection to the server and returns to the user that the connection has been established
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});