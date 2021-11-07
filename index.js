const express = require('express');
const port = 3000
const app = express();
const router = require('./routes/auth')
const lg_router = require("./routes/link_generator")
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = new require('connect-mongo')(session); // npm install connect-mongo@3.1.2
const fileUpload = require("express-fileupload")

// mongoose.connect('mongodb://localhost:27017/link_generator'); // development
mongoose.connect('mongodb+srv://admin:admin123@cluster0.kzjs2.mongodb.net/link_generator?retryWrites=true&w=majority'); // production

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

app.use(fileUpload());

const path = __dirname 

app.use('', router);
app.use('', lg_router);

db.on('open', ()=>{
    console.log("DB connected successfully");
    app.listen(port, () => {
        console.log("Express app started on localhost:"+port);
    })
})
