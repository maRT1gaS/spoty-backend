const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const filesRouter = require('./routes/files');
const artistsRouter = require('./routes/artists');
const albumsRouter = require('./routes/albums');
const songsRouter = require('./routes/songs');
const libraryRouter = require('./routes/library');
const searchRouter = require('./routes/search');
const recommendationsRouter = require('./routes/recommendations');
const authRouter = require('./routes/auth');

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/files', filesRouter);

app.use('/api/artists', artistsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/songs', songsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/search', searchRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/auth', authRouter);

app.use((req, res) => {
    if (fs.existsSync(__dirname + '/static' + req.path)) {
        res.sendFile(__dirname + '/static' + req.path);
        
    } else if (req.path !== '/') {
        res.redirect('/');
    } else {
        res.sendFile(__dirname + '/static/index.html');
    }
});

dotenv.config();
mongoose.connect(
    process.env.DB_LINK,
    { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log('Connected to MongoDB');
            app.listen(process.env.PORT || 5000, () => {
                console.log('We are live on', process.env.PORT || 5000);
            });   
        }
    }
);


