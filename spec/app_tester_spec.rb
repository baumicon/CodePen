require './spec/app_tester'
require 'spec_helper'
require 'json'
require './models/user'
require './models/user_twitter'
require './spec/util_mongo'

describe 'the fake app' do

  def app
    AppTester.helpers Sinatra::Sessionography
    AppTester
  end

  describe "routing" do

    it "should properly route /:slug(int)/:version(int)" do
      get '/1/2', params={"test" => true}
      resp = JSON.parse(last_response.body)
      resp['slug'].should == "1"
      resp['version'].should == "2"
    end

  end

  describe "flash" do

    it "should show up" do
      get '/flash/dance'
      get '/flash/retrieve'
      last_response.body.should == 'dance'
    end

  end

  describe "basic session proof" do

    it "should augment the session" do
      get '/session/hi/there'
      Sinatra::Sessionography.session['hi'].should == 'there'
    end

    it "should allow you to destroy a session variable" do
      get '/session/hell/world'
      Sinatra::Sessionography.session['hell'].should == 'world'
      Sinatra::Sessionography.session.clear
      Sinatra::Sessionography.session['hell'].should == nil
    end

  end

  describe "sessionator" do

    it "should return a base user type" do
      get '/sessionator'
      last_response.should be_ok
      content = JSON.parse(last_response.body)
      content['user']['uid'].should_not be ''
      content['user']['_type'].should == "User"
    end

    it "should return the selected user" do
      clear_db
      app.send(:set, :sessions, false)
      t = TwitterUser.new(:uid => 1, :nickname => 'timmy', :name => "tired dad"); t.save
      Sinatra::Sessionography.session['uid'] = t.uid
      get '/sessionator'
      JSON.parse(last_response.body)['user']['uid'].should == '1'
    end

  # session
  end

end
