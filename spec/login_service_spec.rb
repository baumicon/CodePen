require 'spec_helper'
require './services/login_service'
require './models/user'
require './models/user_twitter'
require './services/content_service'

def get_auth_info
  {'uid' => 2, 'name' => 'Tired Dad', 'nickname' => 'timmy', 'provider' => 'twitter'}
end

describe LoginService do

  #it "should convert User type to TwitterUser type" do
    #clear_db
    #user = User.new(:uid => 1)
    #auth_info = get_auth_info
    #service = LoginService.new
    #new_user = service.convert_anon_user(user, auth_info)
    #new_user.uid.should == 'twitter2'
    #User.first(:uid => 'twitter2').nickname.should == 'timmy'
  #end

  #it "should update a regular user's info based on omniauth info" do
    #clear_db
    #existing_auth_info = get_auth_info
    #existing_auth_info['nickname'] = 'duder'
    #existing_auth_info['uid'] = 'twitter'+existing_auth_info['uid'].to_s
    #existing_user = TwitterUser.new(existing_auth_info)
    #existing_user.save
    #user = LoginService.new.update_regular_user(existing_user, get_auth_info)
    #user.nickname.should == 'timmy'
    #User.first(:uid => 'twitter2').nickname.should == 'timmy'
  #end

  it "should successfully log in a base User" do
    clear_db
    user = User.new(:uid => 1)
    user.save
    service = ContentService.new
    result = service.save_content(user, '{"slug":"new_slug", "version":"5"}')
    LoginService.new.login(user, get_auth_info)
    Content.first(:uid => 'twitter2').version.should == 5
    Slug.first(:uid => 'twitter2').name.should == 'new_slug'
  end

end
