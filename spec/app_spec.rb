require './app'
require 'spec_helper'
require 'json'

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

    it "should properly route /:slug(int)/:version(int)" do
      get '/1/2', params={"test" => true}
      resp = JSON.parse(last_response.body)
      resp['slug'].should == "1"
      resp['version'].should == "2"
    end

    it "saves content" do
      clear_db
      post '/save/content', params={"content" =>'{"slug":"testing", "html" : "<html><body>hi there</body></html>", "version" : "1"}' }
      last_response.should be_ok
      JSON.parse(last_response.body)["success"].should == true
    end

    it "retrieves content" do
      clear_db
      post '/save/content', params={"content" =>'{"slug":"testing", "html" : "<html><body>hi there</body></html>", "version" : "1"}' }
      post '/save/content', params={"content" =>'{"slug":"testing", "html" : "<html><body>hi there</body></html>", "version" : "2"}' }
      get '/content/testing'
      last_response.should be_ok
      body = JSON.parse(last_response.body)
      body['payload']['slug'].should == 'testing'
    end

  end
end
