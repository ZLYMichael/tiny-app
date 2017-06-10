const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key'],

  maxAge: 24 * 60 * 60 * 1000
}))
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
    if (urlDatabase[url].userID === req.session.user_id) {
      urls[url] = urlDatabase[url]
    }
  }
  let templateVars = {
    urls: urls,
    user: users[req.session.user_id]
  };

  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  if(req.session.user_id) {
    res.render("urls_new", {user: users[req.session.user_id]});
  } else {
    res.redirect('/register');
  }
});


app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let templateVars = {
    user: users[req.session.user_id],
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
  const hashed_pass = bcrypt.hashSync(req.body.password, 10);
  users[randomGen] = {
    name: req.body.name,
    email: req.body.email,
    id: randomGen,
    password: hashed_pass
  };
  req.session.user_id = randomGen;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  if(!req.body.email || !req.body.password) {
    res.status(401).send("Incorrect credentials");
  }
  for(let value in users) {
    // var user = users[value];
    if(users[value].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[value].password)) {
        req.session.user_id = users[value].id;
        res.redirect('/urls');
        return
      }
    }
  }
  res.status(401).send("Incorrect Password or Email");
});


app.post('/logout', (req, res) => {
  console.log(users)
  req.session = null;
  res.redirect('/urls');
})


app.post("/urls", (req, res) => {
  let randomGen = generateRandomString();
  urlDatabase[randomGen] = {
    id: randomGen,
    website: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${randomGen}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session.user_id !== urlDatabase[req.params.shortURL].userID){
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
  console.log(`Listening on port ${PORT}`);
});