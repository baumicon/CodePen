class Incrementor
  include MongoMapper::Document
  safe

  key :name, String
  key :count, Integer

  def self.next_count(name)
    begin
      model = MongoMapper.database.collection(:incrementors).find_and_modify(
        :query => {'name' => name}, :update => {'$inc' => {:count => 1}}, :new => true, :safe => true)
      if not model
        Incrementor.new(:name => name, :count => 0).save
        model = MongoMapper.database.collection(:incrementors).find_and_modify(
          :query => {'name' => name}, :update => {'$inc' => {:count => 1}}, :new => true, :safe => true)
      end
    rescue Exception => ex
      #TODO: this is a bit of a cludge... Why would model return nul above sometimes
      #and throw exeptions others?  Mystery for another time
      begin
        Incrementor.new(:name => name, :count => 0).save
        model = MongoMapper.database.collection(:incrementors).find_and_modify(
          :query => {'name' => name}, :update => {'$inc' => {:count => 1}}, :new => true, :safe => true)
      rescue Exception => ex
        #TODO: Log and throw this!
        ap ex
      end
    end

    model['count']
  end

end
