var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser =require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

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
    username: req.cookies["username"]
  };

  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies['username']});
});


app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let templateVars = {
    username: req.cookies["username"],
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
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {

})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  console.log("Cookie set")
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls');
})
app.post("/urls", (req, res) => {
  console.log(req.body);
  var randomGen = generateRandomString();
  urlDatabase[randomGen] = req.body.longURL
  res.redirect(`/urls/${randomGen}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect(`/urls/${req.params.id}`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});