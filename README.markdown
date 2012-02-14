#Tinkerbox

A thingly like Dabblet, JSBin, JSFiddle, CSS Desk, and the like. Only this one open source and licensed so that you can use it commercially or host it yourself or whatever you wanna do.

This app is composed of three individual services. The first is a sinatra ruby service, the second a node web service and the third a mongo db.

##Server Setup

To get the server running on your machine, do the following:

    gem install bundler
    bundle install

To run the server with reload, do this

    shotgun config.ru

However, shotgun will destroy sessions, so when working with auth, you must run

    rackup

##Installing Mongo

Follow the [homebrew](https://github.com/mxcl/homebrew/wiki/installation) setup instructions, then install mongo via homebrew:

    brew install mongodb
    
##Installing Node
    Visit Node http://nodejs.org/, download and install for your os.
    
    To run node service (handles a few preprocessors) call node app.js.
