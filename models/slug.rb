require 'mongo_mapper'

class Slug
    include MongoMapper::Document

    key :user_id, String
    key :name, String

    timestamps!

    #TODO: validations
end
