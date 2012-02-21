require 'mongo_mapper'

module MongoUtil

  MongoMapper.database = 'integration_test'

  def clear_db
    MongoMapper.database.collections.each do |collection|
      collection.remove
    end
  end

end
