require 'mongo_mapper'

class User
  include MongoMapper::Document

  attr_accessible :uid, :provider, :nickname, :name

  key :uid,       String, :required => true
  key :provider,    String, :required => true
  key :nickname,    String, :required => true
  key :name,      String, :required => true

  timestamps!

  #TODO: validations

  def self.get_by_session_id(id)
    if user = User.find_by_uid(id)
      return user
    end
    return User.new_default_user
  end

  def self.new_default_user
    User.new(:uid => "0",
      :nickname => "default",
      :name => "Senior Default",
      :provider => "tinkerbox")
  end

  def self.new_by_auth(auth)
    User.new(:uid => auth["uid"],
      :nickname => auth["info"]["nickname"],
      :name => auth["info"]["name"],
      :provider => 'twitter')
    user.save
  end

end
