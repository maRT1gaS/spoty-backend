const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const artistsRouter = require('./routes/artists');
const albumsRouter = require('./routes/albums');
const songsRouter = require('./routes/songs');
const libraryRouter = require('./routes/library');
const searchRouter = require('./routes/search');
const recommendationsRouter = require('./routes/recommendations');
const authRouter = require('./routes/auth');

const link = 'mongodb+srv://admin:12345@cluster0-stmo1.mongodb.net/loudly?retryWrites=true&w=majority';

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/files/:dir/:filename', (req, res) => {
    const {dir, filename} = req.params;
    const file = `${__dirname}/files/${dir}/${filename}`;
    res.download(file);
});

app.use('/artists', artistsRouter);
app.use('/albums', albumsRouter);
app.use('/songs', songsRouter);
app.use('/library', libraryRouter);
app.use('/search', searchRouter);
app.use('/recommendations', recommendationsRouter);
app.use('/auth', authRouter);

mongoose.connect(
    link,
    { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log('Connected');
            app.listen(5000, () => {
                console.log('We are live');
            });   
        }
    }
);


