require './models/mongomapper_id2'

class Counter
  include MongoMapper::Document
  include Incrementor

  key :name, String
  key :count, Integer


end
