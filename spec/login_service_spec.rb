require 'spec_helper'
require './services/login_service'
require './models/user'
require './models/user_twitter'
require './models/content'

def get_auth_info
  {'uid' => 2, 'name' => 'Tired Dad', 'nickname' => 'timmy', 'provider' => 'twitter'}
end

describe LoginService do

  it "should convert User type to TwitterUser type" do
    clear_db
    user = User.new(:uid => 1)
    auth_info = get_auth_info
    service = LoginService.new
    new_user = service.convert_anon_user(user, auth_info)
    new_user.uid.should == 'twitter2'
    User.first(:uid => 'twitter2').nickname.should == 'timmy'
  end

  it "should update a regular user's info based on omniauth info" do
    clear_db
    existing_auth_info = get_auth_info
    existing_auth_info['nickname'] = 'duder'
    existing_auth_info['uid'] = 'twitter'+existing_auth_info['uid'].to_s
    existing_user = TwitterUser.new(existing_auth_info)
    existing_user.save
    user = LoginService.new.update_regular_user(existing_user, get_auth_info)
    user.nickname.should == 'timmy'
    User.first(:uid => 'twitter2').nickname.should == 'timmy'
  end

  it "should successfully log in a base User" do
    clear_db
    Content.new(:uid => 40, :version => 5, :slug => 'pizza').save.should == true
    user = User.new(:uid => 40)
    user.save.should == true
    LoginService.new.login(user, get_auth_info)
    content = Content.first(:uid => 'twitter2')
    content.version.should == 5
    content.slug.should == 'pizza'
  end

end
