require 'rubygems'
require 'spork'
require 'awesome_print'
#uncomment the following line to use spork with the debugger
#require 'spork/ext/ruby-debug'

Spork.prefork do
  # Loading more in this block will cause your tests to run faster. However,
  # if you change any configuration or code from libraries loaded here, you'll
  # need to restart spork for it take effect.
  require 'mongo_mapper'
end

Spork.each_run do
  # This code will be run each time you run your specs.
  Dir.glob("./models/*.rb") do |filename|
    load filename
  end
end

ENV['RACK_ENV'] = "test"

require 'rspec'
#NOTE: order here is important.  Read: http://stackoverflow.com/a/7179152/182484
require 'rack/test'
require 'mongo_mapper'
require './spec/util_mongo'
require 'sinatra/sessionography'
require './app'

include MongoUtil
include Rack::Test::Methods

def app
  App.helpers Sinatra::Sessionography
  App
end

