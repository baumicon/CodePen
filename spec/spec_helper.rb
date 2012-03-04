require 'rubygems'
require 'spork'
#uncomment the following line to use spork with the debugger
#require 'spork/ext/ruby-debug'

Spork.prefork do
  # Loading more in this block will cause your tests to run faster. However,
  # if you change any configuration or code from libraries loaded here, you'll
  # need to restart spork for it take effect.

end

Spork.each_run do
  # This code will be run each time you run your specs.

end

ENV['RACK_ENV'] = "test"
#

require 'rspec'
#NOTE: order here is important.  Read: http://stackoverflow.com/a/7179152/182484
require 'rack/test'
require 'mongo_mapper'
require './spec/util_mongo'
require 'awesome_print'
require 'sinatra/sessionography'
require './app'

include MongoUtil
include Rack::Test::Methods

def app
  App
end

app.helpers Sinatra::Sessionography

# http://bloggitation.appspot.com/entry/access-to-the-rack-session-from-rspec
def session
    last_request.env['rack.session']
end
