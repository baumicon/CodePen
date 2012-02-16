require 'mongo_mapper'
require_relative '../models/user'

class UserService

  def initialize(db = 'tinkerbox')
    MongoMapper.database = db
  end

  def first_or_new(auth)
    begin
      # TODO: update user and resave if dirty
      User.find_by_uid(auth["uid"]) or new_user(auth)
    rescue Exception
      # TODO: Something smart.
    end
  end

  def default_user
    User.new(:uid => "0",
         :nickname => "default",
         :name => "Senior Default",
         :provider => "tinkerbox")
  end

  # ID is mongo identifier (and session ID)
  def user_by_id(id)
    User.find_by_id id
  end

  private

  def new_user auth
    User.new(:uid => auth["uid"],
      :nickname => auth["info"]["nickname"],
      :name => auth["info"]["name"],
      :provider => 'twitter')
    user.save
  end
end
