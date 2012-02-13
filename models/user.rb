require 'mongo_mapper'

class User
    include MongoMapper::Document

    key :uid,           String
    key :provider,      String
    key :nickname,      String
    key :name,          String
    timestamps!
end
