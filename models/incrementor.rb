class Incrementor
  include MongoMapper::Document
  safe

  key :name, String
  key :count, Integer

  def self.next_count(name)
    begin
      model = MongoMapper.database.collection(:incrementors).find_and_modify(
        :query => {'name' => name}, :update => {'$inc' => {:count => 1}}, :new => true, :safe => true)
    rescue
      Incrementor.new(:name => name, :count => 0).save
      model = MongoMapper.database.collection(:incrementors).find_and_modify(
        :query => {'name' => name}, :update => {'$inc' => {:count => 1}}, :new => true, :safe => true)
    end
    model['count']
  end

end
