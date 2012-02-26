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
# http://bloggitation.appspot.com/entry/access-to-the-rack-session-from-rspec
require 'mongo_mapper'

require 'rack/test'
require './spec/util_mongo'
require 'rspec'
require 'awesome_print'

include MongoUtil
include Rack::Test::Methods


def session
    last_request.env['rack.session']
end
