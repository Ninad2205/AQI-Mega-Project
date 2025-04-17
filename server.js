const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const path = require('path');
const flash = require('connect-flash');

const app = express();
const session = require('express-session');
app.use(express.static('public'));

app.use(flash());
app.use(session({
  secret: '8767046619', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set true if using HTTPS
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/userAuthDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// Routes

app.get('/', (req, res) => {
  // Assuming you are passing messages in req.flash()
  res.render('main');
});

app.get('/signup', (req, res) => {
  // Assuming you are passing messages in req.flash()
  res.render('signup', { messages: req.flash('error') });
});


app.post('/signup', async (req, res) => {
  const messages = req.flash('error'); // Get flash messages
  const { firstName, lastName, emailId, password, mobileNumber, organizationName } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      req.flash('error', 'User already exists with this email.');
      return res.redirect('/signup');
    }

    // Save new user
    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password, // ⚠️ In production, hash this!
      mobileNumber,
      organizationName
    });

    await newUser.save();

    // Auto-login: set session
    req.session.user = {
      id: newUser._id,
      name: newUser.firstName,
      email: newUser.emailId
    };

    // Redirect to dashboard
    res.redirect('/dashboard');

  } catch (err) {
    console.log(err);
    req.flash('error', 'Error occurred during signup.');
    res.redirect('/signup');
  }
});




// Login GET route
app.get('/login', (req, res) => {
  const messages = req.flash('error'); // Get any flash messages
  res.render('login', { messages: messages });
});

app.post('/login', async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const user = await User.findOne({ emailId });

    // Check if user exists and compare passwords
    if (user && user.password === password) {
      // Set session user
      req.session.user = {
        id: user._id,
        name: user.firstName,
        email: user.emailId
      };

      // Redirect to dashboard after successful login
      res.redirect('/dashboard');
    } else {
      // Invalid credentials
      req.flash('error', 'Invalid credentials, please try again.');
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error occurred during login, please try again later.');
    res.redirect('/login');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/dashboard'); // or wherever you want to go if logout fails
    }
    res.clearCookie('connect.sid'); // optional: clears the session cookie
    res.redirect('/'); // redirects to home page
  });
});


// Dashboard route (optional if accessed directly)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // or /signup
  }

  res.render('dashboard', { user: req.session.user });
});

// Route
app.get('/dashboard', (req, res) => {
  res.render('aqi', {
    apiKey: '306f5a21f4611bca4f7a86231be36c38'  // Optional: move to .env for security
  });
});


// app.get('/calculate', (req, res) => {
//   res.render('calculate');
// });


// Start Server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000/');
});
