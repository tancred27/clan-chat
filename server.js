// import express and create an instance of it
var express = require("express");
var app = express();

// add headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// create http server with express instance
var http = require("http").createServer(app);

// create socket instance with http
var io = require("socket.io")(http);

// user mysql
var mysql = require("mysql");

// create db connection
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web-chat"
});

connection.connect(error => console.log(error));

// add a listener for new connections
io.on("connection", socket => {
    // this is a socket for each user
    console.log("User Connected : ", socket.id);

    // server should listen from each client via it's socket
    socket.on("new_message", data => {
        if (data.length === 0) return null;
        //save message in db
        connection.query(
            "INSERT INTO messages (message) VALUES (?)", [data],
            (error, result) => {
                // server will send same message back to all connected clients
                io.emit("new_message", data);
            }
        );
    });
});

// API :
app.get("/", (req, res) => {
    res.send("Chat Boi");
});

app.get("/get_messages", (req, res) => {
    connection.query("SELECT * FROM messages", (error, messages) => {
        res.send(JSON.stringify(messages));
    });
});

// start the server
http.listen(3000, () => console.log("Server started on port 3000"));
