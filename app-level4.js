require("dotenv").config()
// --------------DOTENV------------------->
// Deve sempre estar no topo de nossa aplicação o DOTENV, irá trabalhar de forma a deixar nossos códigos de acesso criptografados, podendo assim ser postados no github e mantendo a proteção de nossos dados.
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const port = 3000
const mongoose = require("mongoose")
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5")
const bcrypt = require("bcrypt")
const saltRounds = 10

const app = express()

// console.log(md5("123456"))

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine", "ejs")

// conexão com mongoDB
mongoose.connect("mongodb://localhost:27017/userDB")
// Criação do nosso esquema
// com esse código abaixo, sei que meu esquema está completo, não é apenas um simples objeto JS.
// pois meu userSchema, foi criado pelo mongoose.Schema class.
const userSchema= new mongoose.Schema({
  email:String,
  password:String
})


// Criando nossos usuários
const User = new mongoose.model("User", userSchema)

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

//<-------------REGISTRO--------------->
app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email: req.body.username,
      password: hash
    })
    newUser.save(function(err){
      if(!err){
        res.render("secrets")
      }else{
        console.log(err)
      }
    })
  })  
})
//<-------------LOGIN--------------->
app.post("/login", function(req, res){
  const username = req.body.username
  const password = req.body.password

  User.findOne({email:username}, function(err, foundUser){
    if(err){
      console.log(err)
    }else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result){
          if(result ===true){
            res.render("secrets")
          }
        })
      }
    }
  })

})

app.listen(port, function(){
  console.log("Server started on port: "+port)
})
