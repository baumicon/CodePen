require '../app'  # <-- your sinatra app
require 'rack/test'

set :environment, :test

describe 'The HelloWorld App' do
  include Rack::Test::Methods

  def app
    App.new
  end

  it "says hello" do
    get '/hi'
    last_response.should be_ok
    last_response.body.should == 'Hello World'
  end
end
