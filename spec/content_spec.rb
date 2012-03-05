require './models/content'
require './models/slug'
require './models/user_twitter'
require 'spec_helper'

describe Content do
  it "should validate required fields" do
    c = Content.new_from_json('{}', 'my_uid', [])
    c.valid?.should be_false
    c.errors.should have_key :version
    c.errors.should have_key :slug
    c.errors.should have_key :slug_not_owned
  end

  it "should prevent you from saving to a slug you don't own" do
    c = Content.new_from_json('{"slug":"testing", "version":"5"}', '555', ['bingo'])
    c.valid?.should be_false
    c.errors.should have_key :slug_not_owned
  end

  it "should allow you to save a slug if you own it" do
    c = Content.new_from_json('{"slug":"testing", "version":"5"}', '555', ['testing'])
    c.valid?.should be_true
  end

  it "should retrieve the latest content by slug" do
      clear_db
      service = ContentService.new
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service.save_content(user, '{"slug":"testing", "version":"5"}')['success'].should == true
      service.save_content(user, '{"slug":"testing", "version":"6"}')['success'].should == true
      content = Content.latest("testing")
      content['success'].should == true
      content['payload']['version'].should equal 6
  end

  it "should retrieve the content by slug and version" do
      clear_db
      service = ContentService.new
      user = TwitterUser.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger')
      user.save
      service.save_content(user, '{"slug":"testing", "version":"5"}')['success'].should == true
      service.save_content(user, '{"slug":"testing", "version":"6"}')['success'].should == true
      content = Content.latest("testing")
      content['success'].should == true
      content['payload']['version'].should equal 6
  end

  it "should return 'success' == false if no content exists for slug" do
    clear_db
    content = Content.latest("testing")
    content['success'].should == false
  end

  describe "ownership" do

    it "should change ownership of content and slugs" do
      clear_db
      service = ContentService.new
      user = User.new(:uid => 2)
      user.save
      result = service.save_content(user, '{"slug":"new_slug", "version":"5"}')
      result = service.save_content(user, '{"slug":"new_slug", "version":"6"}')
      Content.copy_ownership(user, 10)
      content = Content.where(:uid => "10").all
      slugs = Slug.where(:uid => "10").all

      (content + slugs).each{|x|
        x.uid.should == "10"
      }
    end

  end


end
