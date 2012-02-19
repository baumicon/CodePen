require 'mongo_mapper'

class Slug
    include MongoMapper::Document

    key :uid, String
    key :name, String

    timestamps!

    #TODO: validations
    #TODO: index on name, uid
end
