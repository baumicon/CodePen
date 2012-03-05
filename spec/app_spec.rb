require './app'
require './spec/util_mongo'
require 'spec_helper'
require 'json'

describe 'The App' do

  describe "initilization" do

    it "loads the home page" do
      get '/'
      last_response.should be_ok
    end

  end

  describe "session" do

    it "should create a new anon user each time a new session saves content" do
      clear_db

      Sinatra::Sessionography.session.clear

      post '/save/content', {:content => {'slug' => 'testing', 'version' => 1}.to_json}
      last_response.should be_ok
      Sinatra::Sessionography.session['uid'].should == "1"

      Sinatra::Sessionography.session.clear

      post '/save/content', {:content => {'slug' => 'testing', 'version' => 1}.to_json}
      last_response.should be_ok
      Sinatra::Sessionography.session['uid'].should == "2"
    end

  end

end
