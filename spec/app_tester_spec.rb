require './spec/app_tester'
require 'spec_helper'
require 'json'
require './models/user'
require './spec/util_mongo'

describe 'the fake app' do

  def app
    AppTester.new
  end

  describe "sanity" do

    it "should properly route /:slug(int)/:version(int)" do
      get '/1/2', params={"test" => true}
      resp = JSON.parse(last_response.body)
      resp['slug'].should == "1"
      resp['version'].should == "2"
    end

  end

  describe "session" do

    it "should allow you to create a session variable" do
      get '/session/hell/world'
      session['hell'].should == 'world'
      session.clear
      session['hell'].should_not == 'world'
    end

    it "should allow you to destroy a session variable" do
      get '/session/hell/world'
      session['hell'].should == 'world'
      session.clear
      session['hell'].should_not == 'world'
    end

    it "should return a basic user type" do
      get '/sessionator'
      last_response.should be_ok
      JSON.parse(last_response.body)['payload']['user']['uid'].should_not be ''
    end



  end
end
