#Tinkerbox

A thingly like Dabblet, JSBin, JSFiddle, CSS Desk, and the like. Only this one open source and licensed so that you can use it commercially or host it yourself or whatever you wanna do.

##Server Setup

To get the server running on your machine, do the following:

    gem install bundler
    bundle install

To run the server with reload, do this

    shotgun config.ru

However, shotgun will destroy sessions, so when working with auth, you must run

    rackup

