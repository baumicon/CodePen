require './app'
require 'spec_helper'

set :environment, :test

describe 'The App' do

  def app
    App.new
  end

  describe "initilization" do

    it "starts up without error" do
      get '/sanity'
      last_response.should be_ok
      last_response.body.should == 'working'
    end

    it "loads the home page" do
      get '/'
      last_response.should be_ok
    end

  end

  describe "api" do
    it "saves content" do
      post '/save/content', params={"payload" =>'{"SlugName":"testing", "html" : "<html><body>hi there</body></html>"}' }
      last_response.should be_ok
      last_response.body.should == '{"success":true}'
    end

  end

end
