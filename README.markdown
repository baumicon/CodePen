#Tinkerbox

A thingly like Dabblet, JSBin, JSFiddle, CSS Desk, and the like. Only this one open source and licensed so that you can use it commercially or host it yourself or whatever you wanna do.

##Server Setup

To get the server running on your machine, do the following:

    gem install bundler
    bundle install

To run the server with reload, do this

    shotgun routes.rb

##OAuth

We use Github OAuth for our authentication provider.  You must sign up for a github app and then set environment variables with your keys in order for this to work.  For development, create a `startup.sh` in the root of this project.  Then then make it executable, like so:

    echo 'GITHUB_KEY=<your_key_here>; GITHUB_SECRET=<your_secret_here>; shotgun routes.rb' > startup.sh
    chmod +x startup.sh

You'll then have to open that file and change the keys and values to match your Github app.
