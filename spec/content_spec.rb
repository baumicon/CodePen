require './models/content'
require './models/slug'
require './models/user_twitter'
require 'spec_helper'

describe Content do

  it "should save from json" do
    c = Content.new_from_json('{"slug":"testing", "version":"5"}', '555', true)
    c.valid?.should be_true
  end

  it "should retrieve the latest content by slug" do
      clear_db
      Content.new(:uid => 1, :slug => 'testing', :version => 1).save.should == true
      Content.new(:uid => 1, :slug => 'testing', :version => 2).save.should == true
      content = Content.latest("testing")
      content['success'].should == true
      content['payload']['version'].should equal 2
  end

  it "should retrieve the content by slug and version" do
      clear_db
      Content.new(:uid => 1, :slug => 'testing', :version => 1).save.should == true
      Content.new(:uid => 1, :slug => 'testing', :version => 2).save.should == true
      content = Content.version("testing", 1)
      content['success'].should == true
      content['payload']['version'].should equal 1
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

  describe "validation" do

    describe "anon user" do
      describe "blank slug" do

        it "should increment global slug integer and set version to 1" do
          clear_db
          content = Content.new(:uid => 1, :anon => true)
          content.save.should == true
          content.slug.should == '1'
          content.version.should == 1
        end
      end #blank slug
    end #anon user

    describe "logged in user" do
      it "should be allowed to save a slug even if another user owns it" do
        clear_db
        Content.new(:uid => 'twitter1', :version => 1, :slug => 'other_user').save
        content = Content.new(:uid => 'twitter2', :version => 1, :slug => 'other_user')
        content.save.should == true
      end
    end

    describe "all users" do
      it "should validate required fields" do
        c = Content.new_from_json('{}', nil, true)
        c.valid?.should be_false
        c.errors.should have_key :uid
      end

      it "should prevent saving negative version" do
        c = Content.new(:uid => 1, :slug => 'blah', :version => -6)
        c.save
        c.valid?.should be_false
        c.errors.should have_key :version_not_positive
      end
    end

  end

end
