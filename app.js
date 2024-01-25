require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Gizli anahtarınızı çevre değişkeninden alabilir veya doğrudan burada tanımlayabilirsiniz.
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // HTTPS kullanıyorsanız, bu değeri true yapın
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = { isAuthenticated: false };
    }
    next();
});


// Giriş yapma route'u
app.post('/login', (req, res) => {
    const { username, password } = req.body; // Kullanıcı adı ve şifre formdan alınır
    // Kullanıcı adı ve şifre kontrolü yapın (örneğin, veritabanından)
    if (username === 'kullanici' && password === 'sifre') {
        req.session.user = { isAuthenticated: true, username: username };
        res.redirect('/map');
    } else {
        res.send('Kullanıcı adı veya şifre yanlış!');
    }
});

app.get('/login', (req, res) => {
    res.redirect('/');
})


dotenv.config(); // .env dosyasını yükle

const SECRET_KEY = process.env.SECRET_KEY;
console.log(SECRET_KEY);

// create user account through mobil app
app.post('/createAccount', (req, res) => {
    const secretKey = req.headers['secretkey'];
    const userId = req.headers['UserId'];
    const UserPass = req.headers['UserPass'];
    if (secretKey !== SECRET_KEY) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // İsteğin body'sinden diğer bilgileri al (örneğin, location)
    const location = req.body.location; // assuming location is an object with lat and long

    // Veritabanı mantığını buraya ekleyin
    // ...
    const databaseStatus = true;
    try {
        // Hesap oluşturma işlemleri...
        if (databaseStatus) {
            return res.status(201).json({ message: 'Account created successfully' });
        } else {
            // Beklenmeyen bir durum, hesap oluşturulamadı
            return res.status(500).json({ message: 'Could not create account due to an internal error' });
        }
    } catch (error) {
        console.error('Account creation failed:', error);
        return res.status(500).json({ message: 'Could not create account due to an internal error' });
    }
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


//check user already exist through mobil app
app.post('/checkUserExists', (req, res) => {
    const secretKey = req.headers['secretkey'];
    if (secretKey !== SECRET_KEY) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.body.userId;
    // Kullanıcı veritabanınızda userId kontrolü yapın
    // Örneğin: db.userExists(userId)
    // ...

    var userExists = true;
    if (userExists) {
        res.status(200).json({ exists: true });
    } else {
        res.status(200).json({ exists: false });
    }
});


// auth protect map personal data
app.get('/map', (req, res) => {
    if (req.session.user.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'map.html'));
    } else {
        res.redirect('/');
    }
})

//legal page
app.get('/legal', (req, res) => {
    res.sendFile(path.join(__dirname, 'legal.html'))
})

// home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});