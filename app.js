/*
* We'll need to install node for this app. Figure out how to configure this automagically.
* Install NPM - curl http://npmjs.org/install.sh | sh
*   If you get thsi error when you try to 'npm install jade'
        node.js:201
                throw e; // process.nextTick error, or 'error' event on first tick
                
        go to your /usr/bin and usr/bin/local directories. remove the instances of npm*, run this command
        sudo rm -rf npm* to remove the files, then reinstall node, also uninstall node
        sudo rm -rf node*
* Node packages required:
*   npm install jade
*   npm install express
*   npm install stylus
*   npm install less
*   npm install coffee-script
*/

var express = require('express');
var app = express.createServer();

app.use(express.bodyParser());
app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');

// Home page
app.get('/', function(req, res) {
    var html = "h1 This server is running. You better catch it.";
    
    res.send(compileJade(html));
});

// Process Jade template engine requests
app.post('/jade/', function(req, res) {
    var resp = { };
    
    try {
        var jade = require('jade');
        var tmpl_func = jade.compile(req.body.html);
        
        resp['html'] = tmpl_func({ });
    }
    catch(e) {
        resp['error'] = e.message;
    }
    
    res.send(JSON.stringify(resp));
});

// Process Less css requests
app.post('/less/', function(req, res) {
    var less = require('less');
    var resp = { };
    
    less.render(req.body.css, function (e, renderedCSS) {
        if(e) {
            resp['error'] = e.message;
        }
        
        resp['css'] = renderedCSS;
    });
    
    res.send(JSON.stringify(resp));
});

// Process stylus requests
app.post('/stylus/', function(req, res) {
    var stylus = require('stylus');
    var resp = { };
    
    stylus.render(req.body.css, { }, function(e, renderedCSS) {
        if(e) {
            resp['error'] = e.message;
        }
        
        resp['css'] = renderedCSS;
    });
    
    res.send(JSON.stringify(resp));
});

app.post('/coffeescript/', function(req, res) {
    var resp = { };
    
    try {
        var coffee = require("coffee-script");
        resp['js'] = coffee.compile(req.body.js, { });
    }
    catch(e) {
        console.log('err');
        console.log(e);
        resp['error'] = e.message;
    }
    console.log(resp);
    res.send(JSON.stringify(resp));
});