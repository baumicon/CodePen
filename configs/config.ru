# this rackup file is used to run the application
# when run via the Thin rack interace 

require 'rubygems'
require 'sinatra'
require 'app'
require 'auth_keys'

Sinatra::Application.default_options.merge!(
  :run => false,
  :env => :production
)
 
run Sinatra.application