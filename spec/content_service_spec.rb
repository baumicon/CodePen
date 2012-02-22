#TODO: learn how to separate integraiton tests from standard ones

require 'spec_helper'
require './services/content_service'

MongoMapper.database = 'integration_test'

describe ContentService do

  describe "saving" do

    it "should save if user already owns slug" do
      clear_db
      Slug.new(:uid => '7', :name => 'testing').save
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save

      service = ContentService.new
      service.save_content('7', '{"slug":"testing", "version":"5"}')['success'].should == true
    end

    it "should save if slug is new and not already taken" do
      clear_db
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
      service = ContentService.new
      result = service.save_content('7', '{"slug":"new_slug", "version":"5"}')
      result['success'].should == true
    end

    it "should NOT save if slug is already taken by another user" do
      clear_db
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
      Slug.new(:name => 'new_slug', :uid => '5').save
      service = ContentService.new
      result = service.save_content('7', '{"slug":"new_slug", "version":"5"}')
      result['success'].should == false
    end

    it "should NOT allow invalid content" do
      clear_db
      service = ContentService.new
      result = service.save_content('7', '{"slug":"new_slug", "version":"beef"}')
      result['success'].should == false
    end

    it "should accept a valid sequence" do
      clear_db
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
      service = ContentService.new
      result = service.save_content('7', '{"slug":"new_slug", "version":"5"}')
      result = service.save_content('7', '{"slug":"new_slug", "version":"6"}')
      result['success'].should == true
    end

    it "should reject an invalid sequence" do
      clear_db
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
      service = ContentService.new
      result = service.save_content('7', '{"slug":"new_slug", "version":"8"}')
      result = service.save_content('7', '{"slug":"new_slug", "version":"6"}')
      result['success'].should == false
    end
  end

  describe "retrieving" do

    it "should retrieve the latest content" do
      clear_db
      service = ContentService.new
      service.save_content('7', '{"slug":"testing", "version":"5"}')['success'].should == true
      service.save_content('7', '{"slug":"testing", "version":"6"}')['success'].should == true
      content = service.latest "testing"
      content['success'].should == true
      content['payload']['version'].should equal 6
    end

    it "should return 'success' == false if no content exists for slug" do
      clear_db
      service = ContentService.new
      content = service.latest "testing"
      content['success'].should == false
    end

  end
end
