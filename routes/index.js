var express = require('express');
var router = express.Router();

const userModel=require("./users");

const postModel=require("./post");
const passport = require('passport');
const upload=require("./multer");


const localStrategy=require('passport-local');
passport.use(new localStrategy(userModel.authenticate()))



router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//router.get('/login', function(req, res, next) {

//console.log(req.flash('error'));

//const error=req.flash('error');

 // res.render('Login',{error});
//});

router.get('/login', function(req, res, next) {
  console.log(req.flash('error')); // Logging flash messages (for debugging)
  
  const error = req.flash('error'); // Retrieve flash messages
  
  res.render('Login', { error: Array.isArray(error) ? error : [] }); // Pass flash messages to view
});




router.get('/profile',isLoggedIn,  async function(req, res, next) {
   const user=await userModel.findOne({
    username:req.session.passport.user


   })
    .populate("posts") ;                                                 //to show the post of the user
   console.log(user);

  res.render('Profile',{user})
});


router.get('/feed', function(req, res, next) {
  res.render('feed', { title: 'Express' });
});

router.post('/upload',isLoggedIn,upload.single("file") , async function(req, res, next) {
  
    if(!req.file){
     return res.status(404).send("No files were given")
    }
      const user=await userModel.findOne({username:req.session.passport.user});
     const post= await postModel.create({
        image:req.file.filename,
        imageText: req.body.filecaption,
        user:user._id
      });

       user.posts.push(post._id);
        await user.save();
       res.redirect("/profile");
});






router.post('/register',function(req,res){
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname});
  
    
    userModel.register(userData,req.body.password)
    .then(function(){
      passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
      })
    })

  })


  router.post('/login',passport.authenticate("local",{
    successRedirect:"/profile",
    failureRedirect:"/login",
    failureFlash:true
  }),
  
  function(req,res){
    

      });

   router.get("/logout",function(req,res){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  
   })

   function isLoggedIn(req,res,next){
    if(req.isAuthenticated()) return next();
    res.redirect("/login");
   }

module.exports = router;
