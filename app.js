const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const bcrypt = require('bcryptjs');
const env = require("dotenv")
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MyGymWebsite', { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log("Connected to MongoDb");
});

// Environment Setup
env.config()

// Define moongoose Schema for Contact
const contactSchema = new mongoose.Schema({
    name: String,
    age: String,
    gender: String,
    address: String,
    phone: String,
    email: String
});
const Contact = mongoose.model('Contact', contactSchema);

// Define moongoose Schema for SignUp
const signUpSchema = new mongoose.Schema({
    signupUserName: String,
    name: String,
    email: String,
    signupPassword: String
});
const SignUpInfo = mongoose.model('SignUpInfo', signUpSchema);

// EXPRESS SPECIFIC STUFF 
app.use('/static', express.static('static'));// For serving static files 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(session({
    secret: 'secret',
    cookie: { maxAge: (7 * 24 * 86400) },
    resave: true,
    saveUninitialized: true
}));

// PUG SPECIFIC STUFF 
app.set('view engine', 'pug');// Set the template engine as pug         
app.set('views', path.join(__dirname, 'views'));// Set the views directory             

// Message
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    req.session.message = {
        type: '',
        intro: '',
        message: ''
    }
    next()
});

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next()
})

// EndPoints
// Home Page
app.get('/', (req, res) => {
    const params = {};
    res.status(200).render('index.pug');
});

app.post('/', (req, res) => {
    if (req.body.name == '' || req.body.age == '' || req.body.gender == '' || req.body.address == '' || req.body.phone == '' || req.body.email == '') {
        req.session.message = {
            type: 'danger',
            intro: 'Empty Fields!',
            message: ' Please insert the required information.'
        }
        res.redirect('/');
    }
    else if (!req.session.user) {
        req.session.message = {
            type: 'danger',
            intro: 'Login Problem!',
            message: ' Please Login first then submit your form.'
        }
        console.log(req.session.user);
        res.redirect('/');
    }
    else {
        let data = new Contact(req.body);
        data.save().then(() => {
            req.session.message = {
                type: 'success',
                intro: 'Successful!',
                message: ' Your Contact saved to the database.'
            }
            res.redirect('/');
            console.log(res.locals.message);
        }).catch(() => {
            req.session.message = {
                type: 'danger',
                intro: 'Failure!',
                message: ' Your Contact does not save to the database.'
            }
            res.redirect('/');
        });
    }
});

// Signup For User 
app.post('/signup', (req, res) => {
    if (req.body.signupUserName == '' || req.body.name == '' || req.body.email == '' || req.body.signupPassword == '' || req.body.signupConfirmPassword == '') {
        req.session.message = {
            type: 'danger',
            intro: 'Empty Fields!',
            message: ' Please insert the required information and Signup again.'
        }
        res.redirect('/');
    }
    else if (req.body.signupPassword != req.body.signupConfirmPassword) {
        req.session.message = {
            type: 'danger',
            intro: 'Password does not match!',
            message: ' Please check your password and confirm password and Signup again.'
        }
        res.redirect('/');
    }
    else {
        let salt = bcrypt.genSaltSync(10);
        secPass = bcrypt.hashSync(req.body.signupPassword, salt);
        let myData = new SignUpInfo({
            signupUserName: req.body.signupUserName,
            name: req.body.name,
            email: req.body.email,
            signupPassword: secPass
        });
        myData.save().then(() => {
            req.session.message = {
                type: 'success',
                intro: 'Successful!',
                message: ' Your SignupForm saved to the database.'
            }
            res.redirect('/');
        }).catch(() => {
            req.session.message = {
                type: 'danger',
                intro: 'Failure!',
                message: ' Your SignupForm does not save to the database.'
            }
            res.redirect('/');
        });
    }
});

// Login For User 
app.post('/login', async (req, res) => {
    try {
        const loginUserName = req.body.loginUserName;
        const loginPassword = req.body.loginPassword;

        const user = await SignUpInfo.findOne({ signupUserName: loginUserName });
        const passwordCompare = await bcrypt.compare(loginPassword, user.signupPassword);
        if (passwordCompare) {
            req.session.user = {
                userName: loginUserName,
                password: loginPassword
            }
            req.session.message = {
                type: 'success',
                intro: 'Successful!',
                message: ' You have Login successfully.'
            }
            res.redirect('/');
        }
        else {
            req.session.message = {
                type: 'danger',
                intro: 'Failure!',
                message: ' Please check your Username and Password, then Login again.'
            }
            res.redirect('/');
        }
    }
    catch (error) {
        req.session.message = {
            type: 'danger',
            intro: 'Failure!',
            message: ' Please check your Username and Password, then Login again.'
        }
        res.redirect('/');
    }
})

// Logout For User 
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

// About Page 
app.get('/about', (req, res) => {
    const params = {};
    res.status(200).render('about.pug');
});

// Fitness Calculator Page
app.get('/fitcal', (req, res) => {
    const params = {};
    res.status(200).render('fitness.pug');
});

// Contact Page 
app.get('/contact', (req, res) => {
    const params = {};
    res.status(200).render('contact.pug');
});

// START THE SERVER 
app.listen(process.env.PORT, () => {
    console.log(`The application started successfully on port ${process.env.PORT}`);
})