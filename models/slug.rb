require 'mongo_mapper'

class Slug
    include MongoMapper::Document

    key :user_id
end
