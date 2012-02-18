require 'mongo_mapper'
require '../lib/json_util'

class Content
    include MongoMapper::Document

    attr_accessible :uid, :slug_name, :version, :html, :css, :js, :html_preprocessor, :css_preprocessor, :js_preprocesor
    attr_accessor :slugs

    validate :validate_slug_owned

    #Foreign Keys
    key :uid, String, :required => true
    key :slug_name, String, :required => true

    key :version, Integer, :required => true
    key :html, String
    key :css, String
    key :js, String
    key :html_preprocessor, String
    key :css_preprocessor, String
    key :js_preprocesor, String

    timestamps!

    def self.new_from_json(json, uid, slugs = [])
      payload = JsonUtil.condition_json(json)
      payload['uid'] = uid
      content = Content.new payload
      content.slugs = slugs
      content
    end

    private

    def validate_slug_owned
        errors.add(:slug_not_owned, "You must own a slug to save to it") unless @slugs.include?(@slug_name)
    end
end
