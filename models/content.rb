require 'mongo_mapper'

class Content
    include MongoMapper::Document

    attr_accessible :version, :html, :css, :js, :html_preprocessor, :css_preprocessor, :js_preprocesor

    #Foreign Keys
    key :user_id, String
    key :slug_id, String

    key :version, Integer
    key :html, String
    key :css, String
    key :js, String
    key :html_preprocessor, String
    key :css_preprocessor, String
    key :js_preprocesor, String

    timestamps!

    #TODO: validations

end
