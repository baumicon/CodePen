require 'mongo_mapper'
require_relative '../models/content'

class ContentService

  def initialize(db = 'tinkerbox')
    MongoMapper.database = db
  end

  def save_content(content)
    begin
      Content.new(content).save
    rescue
      #TODO: handle exceptions
      throw "Fuck!"
    end
  end

end
