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
*/var express=require("express"),app=express.createServer();app.use(express.bodyParser());app.listen(8124);console.log("Server running at http://127.0.0.1:8124/");app.get("/",function(a,b){var c="h1 This server is running. You better catch it.";b.send(compileJade(c))});app.post("/jade/",function(a,b){var c={};try{var d=require("jade"),e=d.compile(a.body.html,{pretty:!0});c.html=e({})}catch(f){c.error=f.message}b.send(JSON.stringify(c))});app.post("/less/",function(a,b){var c=require("less"),d={};c.render(a.body.css,function(a,b){a&&(d.error=a.message);d.css=b});b.send(JSON.stringify(d))});app.post("/stylus/",function(a,b){var c=require("stylus"),d={};c.render(a.body.css,{},function(a,b){a&&(d.error=a.message);d.css=b});b.send(JSON.stringify(d))});app.post("/coffeescript/",function(a,b){var c={};try{var d=require("coffee-script");c.js=d.compile(a.body.js,{})}catch(e){c.error=e.message}b.send(JSON.stringify(c))});