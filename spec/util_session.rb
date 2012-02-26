require 'mongo_mapper'

module MongoUtil

  MongoMapper.database = 'integration_test'

  def clear_session
    MongoMapper.database.collections.each do |collection|
      collection.remove
    end
  end

end
