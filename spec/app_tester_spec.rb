require './spec/app_tester'
require 'spec_helper'
require 'json'
require './models/user'
require './models/user_twitter'
require './spec/util_mongo'

describe 'the fake app' do

  def app
    AppTester
  end

  def clear_session
    get '/'
    if session
      session.clear
    end
  end

  describe "routing" do

    it "should properly route /:slug(int)/:version(int)" do
      get '/1/2', params={"test" => true}
      resp = JSON.parse(last_response.body)
      resp['slug'].should == "1"
      resp['version'].should == "2"
    end
  # sanity
  end

  describe "basic session proof" do

    it "should augment the session" do
      sesh = {}
      get '/session/hi/there', {}, 'rack.session' => sesh
      sesh['hi'] = 'there'
    end

    it "should allow you to create a session variable" do
      get '/session/hell/world'
      session['hell'].should == 'world'
    end

    it "should allow you to destroy a session variable" do
      get '/session/hell/world'
      session['hell'].should == 'world'
      session.clear
      session['hell'].should_not == 'world'
    end

  end

  describe "sessionator" do

    it "should return a base user type" do
      get '/sessionator'
      last_response.should be_ok
      payload = JSON.parse(last_response.body)['payload']
      payload['user']['uid'].should_not be ''
      payload['user']['_type'].should == "User"
    end

    it "should return the selected user" do
      clear_db
      app.send(:set, :sessions, false)
      t = TwitterUser.new(:uid => 1, :nickname => 'timmy', :name => "tired dad"); t.save
      sesh = {'uid' => t.uid}
      get '/sessionator', {}, 'rack.session' => sesh
      JSON.parse(last_response.body)['payload']['user']['uid'].should == '1'
    end

  # session
  end

end
