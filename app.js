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

function compileJade(html) {
    var tmpl_func = jade.compile(html);
    // execute the returned function without attributes
    return tmpl_func({ });
}

app.get('/', function(req, res) {
    var html = "h1 This server is running. You better catch it.";
    console.log('test');
    res.send(compileJade(html));
});

// url post sends request to /jade/ with post body
// {html: '[jade goes here]'}
app.post('/jade/', function(req, res) {
    var html = compileJade(req.body.html);
    res.send(html);
});

app.post('/less/', function(req, res) {
    var less = require('less');
    var css;
    
    less.render(req.body.css, function (e, css) {
        console.log(css);
        css = css;
    });
    
    res.send(css);
});

app.post('/stylus/', function(req, res) {
    var stylus = require('stylus');
    var css;
    
    stylus.render(css, function(err, css) {
      css = css;
      console.log(css);
    });
    
    res.send(css);
});

app.post('/js/', function(req, res) {
    var coffee = require("coffee-script");
    var nodes = coffee.nodes(coffee.tokens("a = 2 + 2"));

    console.log( nodes.compile() ); // var a = 2 + 2;
    
    var js;
    
    stylus.render(css, function(err, css) {
      css = css;
      console.log(css);
    });
    
    res.send(js);
});

app.listen(8124);

console.log('Server running at http://127.0.0.1:8124/');