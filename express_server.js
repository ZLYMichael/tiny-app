const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser =require("body-parser");
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    name: "randomName",
    id: "userRandomID",
    email: "kek@kek.kek",
    password: "kek"
  },
  "user2RandomID": {
    name: "random2Name2",
    id: "user2randomID",
    email: "user2random@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2":{
    id: "b2xVn2",
    website: "http://lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK":{
    id: "9sm5xK",
    website: "http://google.com",
    userID: "user2randomID"
  }
};


function generateRandomString() {
  let random = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random;
}


app.get("/urls", (req, res) => {
  let urls = {};
  for(let url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies["user_id"]) {
      urls[url] = urlDatabase[url]
    }
  }
  let templateVars = {
    urls: urls,
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  if(req.cookies["user_id"]) {
    res.render("urls_new", {user: users[req.cookies["user_id"]]});
  } else {
    res.redirect('/register');
  }
});


app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].website
  };
  res.render('urls_show', templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].website;
  res.redirect(longURL);
});



app.get('/register', (req, res) => {
  res.render('register');
});


app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/register', (req, res) => {
  if(req.body.name === "" || req.body.email === "" || req.body.password === "") {
    return res.status(400).end(`error 400
      Missing email and or password`);
  }

  const randomGen = generateRandomString();
  users[randomGen] = {
    name: req.body.name,
    email: req.body.email,
    id: randomGen,
    password: req.body.password
  };
  res.cookie("user_id", randomGen);
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  let user = null;
  for(let value in users) {
    if(users[value].email === req.body.email) {
      user = users[value];
    }
  }

  if(user && user.password === req.body.password) {
    res.cookie("user_id", user.id);
    res.redirect('/urls');
  } else {
    res.status(401).send("Incorrect credentials");
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})


app.post("/urls", (req, res) => {
  let randomGen = generateRandomString();
  urlDatabase[randomGen] = {
    id: randomGen,
    website: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${randomGen}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(users)
  if(req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID){
    res.status(401).send("This does not belong to you!")
  } else {
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].website = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});