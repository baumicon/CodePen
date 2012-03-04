class Incrementor
  include MongoMapper::Document
  safe

  key :name, String
  key :id2, Integer

  def self.next_id(name)
    begin
      model = MongoMapper.database.collection(:incrementors).find_and_modify(
        :query => {'name' => name}, :update => {'$inc' => {:id2 => 1}}, :new => true, :safe => true)
    rescue
      Incrementor.new(:name => name, :id2 => 0).save
      model = MongoMapper.database.collection(:incrementors).find_and_modify(
        :query => {'name' => name}, :update => {'$inc' => {:id2 => 1}}, :new => true, :safe => true)
    end
    model['id2']
  end

end
