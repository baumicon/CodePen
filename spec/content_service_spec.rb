#TODO: learn how to separate integraiton tests from standard ones

require '../services/content_service'
MongoMapper.database = 'integration_test'

def clear_db
  MongoMapper.database.collections.each do |collection|
    collection.remove
  end
end

describe ContentService do

  describe "saving" do

    it "should save if user already owns slug" do
      clear_db
      Slug.new(:uid => '7', :name => 'testing').save
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save

      service = ContentService.new
      service.save_content('7', '{"slug_name":"testing", "version":"5"}')['success'].should == true
    end

    it "should save if slug is new and not already taken" do
      clear_db
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
      service = ContentService.new
      result = service.save_content('7', '{"slug_name":"new_slug", "version":"5"}')
      result['success'].should == true
    end

    it "should NOT save if slug is already taken by another user" do
      clear_db
      User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
      Slug.new(:name => 'new_slug', :uid => '5').save
      service = ContentService.new
      result = service.save_content('7', '{"slug_name":"new_slug", "version":"5"}')
      result['success'].should == false
    end

  end #end Save

  describe "retrieving" do
    it "should retrieve the latest content" do
      clear_db
      service = ContentService.new
      service.save_content('7', '{"slug_name":"testing", "version":"5"}')['success'].should == true
      service.save_content('7', '{"slug_name":"testing", "version":"6"}')['success'].should == true
      content = service.get_latest "testing"
      require 'awesome_print'
      ap content
      content['success'].should == true
      content['payload']['version'].should == "6"
    end
  end
end
