var express    = require("express");
var morgan     = require("morgan");
var app        = express();

var port = process.env.PORT || 3002;

app.use(morgan("dev"));
app.use(express.static("./build"));

app.get("/", function(req, res) {
    res.sendFile("./build/index.html"); //index.html file of your angularjs application
});

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});
