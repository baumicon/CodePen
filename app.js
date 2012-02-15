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

var jade = require('jade');

var express = require('express');
var app = express.createServer();
app.use(express.bodyParser());

app.get('/', function(req, res) {
    var html = "h1 This server is running. You better catch it.";
    
    res.send(compileJade(html));
});

function compileJade(html) {
    try {
        var tmpl_func = jade.compile(html);

        return tmpl_func({ });
    }
    catch(e) {
        // Don't had back errors, yet. will need a different pane for that later.
        // will need to format the error.
        return html;
    }
}

// url post sends request to /jade/ with post body
// {html: '[jade goes here]'}
app.post('/jade/', function(req, res) {
    var html = compileJade(req.body.html);
    
    res.send(html);
});

app.post('/less/', function(req, res) {
    var less = require('less');
    var css = req.body.css;
    
    less.render(css, function (e, renderedCSS) {
        css = renderedCSS;
    });
    
    res.send(css);
});

app.post('/stylus/', function(req, res) {
    var stylus = require('stylus');
    var css = req.body.css;
    
    stylus.render(css, { }, function(err, renderedCSS) {
        if(renderedCSS) {
            css = renderedCSS;
        }
    });
    
    res.send(css);
});

app.post('/coffeescript/', function(req, res) {
    var CoffeeScript = require("coffee-script");
    var code = req.body.js;
    
    code = CoffeeScript.compile(code, { });
    res.send(code);
});

app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');