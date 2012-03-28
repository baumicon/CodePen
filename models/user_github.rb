require 'mongo_mapper'
require_relative './user'

class GithubUser < User
  include MongoMapper::Document

  key :uid,           String
  key :location,      String
  key :url,           String
  key :company,       String
  key :html_url,      String
  key :email,         String
  key :hireable,      Boolean
  key :name,          String, :required => true
  key :gravitar_url,  String
  key :id,            Integer
  key :login,         String
  key :public_gists,  String

  timestamps!

  before_validation :before_validation_on_create, :on => :create

  def before_validation_on_create
    #TODO: validate for unusable github usernames
    @uid = @login
  end

end
