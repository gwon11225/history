const User = require('./user');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const Post = require('./posting');
const ejs = require('ejs');
const bodyParser = require('body-parser');
dotenv.config();
const app = express();
app.set('view engine','ejs');
app.set('views','./view');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(function(req,res,next){
    if(req.session.loggedIn){
        res.locals.navbar = 'loginnav';
    }else{
        res.locals.navbar = 'nav';
    }
    next();
})

app.get('/',function(req,res){
    Post.find(function(err,result){
        console.log(result);
        if(req.session.loggedIn){
            res.render('loginmain',{data : result});
        }else{
            res.render('main',{data : result});
        }
    }).sort({_id : -1});
})
app.get('/sign',function(req,res){
    res.render('signpage');
})
app.get('/write',function(req,res){
    res.render('writepage');
})
app.get('/mypage',function(req,res){
    res.render('mypage');
})
app.post('/signin',function(req,res,next){
    let signinData = {
        email : req.body.SIGNIN_EMAIL,
        password : req.body.SIGNIN_PASS
    }
    User.findOne({email : signinData.email},function(err,Data){
        if(err){
            console.log(err);
        }else{
            if(Data.password === signinData.password){
                req.session.loggedIn = true;
                req.session.username = Data.name;
                res.redirect('/');
            }else{
                res.send("로그인 실패");
                res.redirect('/sign');
            }
        }
    })
});
app.post('/signup',function(req,res,next){
    let signupData = {
        name : req.body.SIGNUP_NAME,
        email : req.body.SIGNUP_EMAIL,
        password : req.body.SIGNUP_PASS
    }
    new User(signupData).save();
    res.redirect('/');
})
app.post('/posting',function(req,res,next){
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('ko-KR',{
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const timeString = formatter.format(now);
    let postContent = {
        title : req.body.POST_TITLE,
        content : req.body.POST_CONTENT,
        date : timeString
    }
    console.log(postContent);
    new Post(postContent).save();
    res.redirect('/');
})

mongoose.set('strictQuery',true);
mongoose.connect(process.env.MONGODB_URL,
    {
        useNewUrlParser : true,
        useUnifiedTopology : true,
    },
    function(err){
    if(err){
        console.log(err);
    }else{
        console.log("connect!");
        app.listen(8080,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("server start!")
            }
        });
    }
})


