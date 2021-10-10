const express = require('express');
const port = 3000
const app = express();
const router = require('./routes');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = new require('connect-mongo')(session); // npm install connect-mongo@3.1.2

mongoose.connect('mongodb://localhost:27017/link_generator');

const db = mongoose.connection;

app.use(session({
    secret : "dfghfjkulijmkjnhgyjtfrdresewr34e5yt67yukyh",
    resave: false,
    saveUninitialized: true, 
    store: new MongoStore({
        mongooseConnection : db
    })
}))

app.set('views', "./views")
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('', router);

db.on('open', ()=>{
    console.log("DB connected successfully");
    app.listen(port, () => {
        console.log("Express app started on localhost:"+port);
    })
})
