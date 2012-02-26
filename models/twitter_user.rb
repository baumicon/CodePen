require 'mongo_mapper'
require_relative './user'

class TwitterUser < User
  include MongoMapper::Document

  attr_accessible :uid, :provider, :nickname, :name

  key :uid,         String, :required => true
  key :nickname,    String, :required => true
  key :name,        String, :required => true

  timestamps!

  #TODO: validation

  def self.get_by_session_id(id)
    if user = TwitterUser.find_by_uid(id)
      return user
    end
    return TwitterUser.new_default_user
  end

  def self.new_default_user
    TwitterUser.new(:uid => "0",
      :nickname => "default",
      :name => "Senior Default",
      :provider => "tinkerbox")
  end

  def self.new_by_auth(auth)
    TwitterUser.new(:uid => auth["uid"],
      :nickname => auth["info"]["nickname"],
      :name => auth["info"]["name"],
      :provider => 'twitter')
    user.save
  end

end
