require 'mongo_mapper'

class Slug
  include MongoMapper::Document

  key :uid, String
  key :name, String

  validate :validate_available
  timestamps!

  #TODO: validations
  #TODO: index on name, uid

  private

  def validate_available
    errors.add(:slug_not_owned, "That slug is already taken.") if Slug.find_by_name_and_uid(@name, @uid)
  end

end
