class CreateIndexes
  def self.all
    puts "*"*15 + " GENERATING INDEXES" + "*"*15
    MongoMapper.database.collection_names.each do |coll|
      # Avoid "system.indexes"
      next if coll.index(".")

      model = coll.singularize.camelize.constantize
      model.create_indexes if model.respond_to?(:create_indexes)
      model.show_indexes if model.respond_to?(:show_indexes)
    end
  end
end
