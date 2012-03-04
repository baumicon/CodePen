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

  describe "api" do

    it "saves content for anon user" do
     
    end
  end
end
