require("dotenv").config()
// --------------DOTENV------------------->
// Deve sempre estar no topo de nossa aplicação o DOTENV, irá trabalhar de forma a deixar nossos códigos de acesso criptografados, podendo assim ser postados no github e mantendo a proteção de nossos dados.
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const port = 3000
const mongoose = require("mongoose")
// DEPENDÊNCIAS NECESSÁRIAS PARA TRABALHAR COM COOKIES
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const { Cookie } = require("express-session")

const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine", "ejs")

// EXPRESS-SESSION
app.use(session({
  secret: "Nosso pequeno segredo.",
  resave: false,
  saveUninitialized:false
}))
// INICIALIZANDO O PASSPORT
app.use(passport.initialize())
app.use(passport.session())

// conexão com mongoDB
mongoose.connect("mongodb://localhost:27017/userDB")
// mongoose.set("useCreateIndex", true)
// Criação do nosso esquema
// com esse código abaixo, sei que meu esquema está completo, não é apenas um simples objeto JS.
// pois meu userSchema, foi criado pelo mongoose.Schema class.

const userSchema= new mongoose.Schema({
  email:String,
  password:String
})
// passportLocalMongoose -> será responsável pelos passwords com hash, salting e também salvar nossos usuários no nosso banco.
userSchema.plugin(passportLocalMongoose)
// Criando nossos usuários
const User = new mongoose.model("User", userSchema)
// PASSPORT STRATEGY
passport.use(User.createStrategy())
//PASSPORT SERIALIZE -> É basicamente salvar a mensagem ou dado no cookie com os dados do usuário
passport.serializeUser(User.serializeUser())
//PASSPORT DESERIALIZE -> É basicamente permitir ao passport ver a mensagem ou dado no cookie
passport.deserializeUser(User.deserializeUser())

// HOME PAGE
app.get("/", function(req, res){
  res.render("home")
})
//LOGIN
app.get("/login", function(req, res){
  res.render("login")
})
//REGISTRO
app.get("/register", function(req, res){
  res.render("register")
})
// SECRETS
app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets")
  }else{
    res.redirect("/login")
  }
})
// LOGOUT --> DESERIALIZE
app.get('/logout', function(req, res){
  req.logout(function(err){
    if(err){
      console.log(err)
    }else{
      res.redirect("/")
      }
    })
 })

//<-------------POST - REGISTRO--------------->
app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err)
      res.redirect("/register")
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  }) 
})
//<-------------POST - LOGIN--------------->
app.post("/login", function(req, res){

  const user = new User({
    username:req.body.username, 
    password:req.body.password
  })
  req.logIn(user, function(err){
    if(err){
      console.log(err)
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })
})
app.listen(port, function(){
  console.log("Server started on port: "+port)
})
