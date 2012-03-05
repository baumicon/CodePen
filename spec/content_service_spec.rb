#TODO: learn how to separate integraiton tests from standard ones

require 'spec_helper'
require './services/content_service'
require './models/user_twitter'

MongoMapper.database = 'integration_test'

describe ContentService do

  describe "saving" do

    it "should save if user already owns slug" do
      clear_db
      Slug.new(:uid => '7', :name => 'testing').save
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service = ContentService.new
      service.save_content(user, '{"slug":"testing", "version":"5"}')['success'].should == true
    end

    it "should save if slug is new and not already taken" do
      clear_db
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service = ContentService.new
      result = service.save_content(user, '{"slug":"new_slug", "version":"5"}')
      result['success'].should == true
    end

    it "should save if slug is already taken by another user" do
      clear_db
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      Slug.new(:name => 'new_slug', :uid => '5').save
      service = ContentService.new
      result = service.save_content(user, '{"slug":"new_slug", "version":"5"}')
      result['success'].should == true
    end

    it "should return the slug name on successful save" do
      clear_db
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service = ContentService.new
      result = service.save_content(user, '{"slug":"new_slug", "version":"5"}')
      result['success'].should == true
      result['payload']['slug'].should == 'new_slug'
    end

    it "should NOT allow invalid content" do
      clear_db
      service = ContentService.new
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      result = service.save_content(user, '{"slug":"new_slug", "version":"beef"}')
      result['success'].should == false
    end

    it "should accept a valid sequence" do
      clear_db
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service = ContentService.new
      result = service.save_content(user, '{"slug":"new_slug", "version":"5"}')
      result = service.save_content(user, '{"slug":"new_slug", "version":"6"}')
      result['success'].should == true
    end

    it "should reject an invalid sequence" do
      clear_db
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service = ContentService.new
      result = service.save_content(user, '{"slug":"new_slug", "version":"8"}')
      result = service.save_content(user, '{"slug":"new_slug", "version":"6"}')
      result['success'].should == false
    end
  end

end
