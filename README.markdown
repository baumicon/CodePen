#Tinkerbox

A thingly like Dabblet, JSBin, JSFiddle, CSS Desk, and the like. Only this one open source and licensed so that you can use it commercially or host it yourself or whatever you wanna do.

##Server Setup

To get the server running on your machine, do the following:

    gem install bundler
    bundle install

To run the server with reload, do this

    shotgun routes.rb

##OAuth

We use Github OAuth for our authentication provider.  You must sign up for a github app and then set environment variables with your keys in order for this to work.  For development, create a `startup.sh` in the root of this project. The file should looke like this:

    export GITHUB_KEY=<your_key>
    export GITHUB_SECRET=<your_secret>
    bundle exec shotgun


Then then make it executable, like so:

    chmod +x startup.sh
    #! /bin/bash

Run the app like this:

    ./startup.sh
