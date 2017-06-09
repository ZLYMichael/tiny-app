var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser =require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    name: "randomName",
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID":{
    name: "random2Name2",
    id: "user2randomID",
    email: "user2random@example.com",
    password: "dishwasher-funk"
  }
};

var urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};


function generateRandomString() {
  var random = ""
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random;
}


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"]
  };

  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new", {user_id: req.cookies['user_id']});
});


app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let templateVars = {
    user_id: req.cookies["user"],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b> World</b></body></html>\n");
});
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.post('/register', (req, res) => {
  if(req.body.name === "" || req.body.email === "" || req.body.password === "") {
    return res.status(400).end(`error 400
      Missing email and or password`)
  }

  const randomGen = generateRandomString()
  users[randomGen] = {
    name: req.body.name,
    email: req.body.email,
    id: randomGen,
    password: req.body.password
  }
  console.log(users)
  res.cookie("user_id", randomGen)
  res.redirect("/urls")

});

app.post("/login", (req, res) => {
  let user = null;
  for(let value in users) {
    if(users[value].email === req.body.email) {
      user = users[value];
    }
  }

  if(user && user.password === req.body.password) {
    res.cookie("user_id", user.name);
    res.redirect('/urls');
  } else {
    res.status(401).send("Incorrect credentials")
  }

});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  console.log(req.body);
  urlDatabase[randomGen] = req.body.longURL
  res.redirect(`/urls/${randomGen}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect(`/urls/${req.params.id}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});