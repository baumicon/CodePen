require 'mongo_mapper'

class User

  include MongoMapper::Document

  attr_accessible :uid
  key :uid,         String

  timestamps!

  #TODO: validations

  def anon?
    self['_type'] == 'User' || self['_type'].nil?
  end

end
