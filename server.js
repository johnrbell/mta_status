require('dotenv').config()
var express = require('express')
app = express()
port = process.env.PORT || 3000
app.set('view engine', 'ejs')
bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var routes = require('./routes/routes'); //importing route
routes(app); //register the route

app.listen(port);
console.log('todo list RESTful API server started on: ' + port);
