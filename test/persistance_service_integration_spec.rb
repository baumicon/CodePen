#TODO: learn how to separate integraiton tests from standard ones

require '../services/persistance_service'

def setup
  MongoMapper.database = 'integration_tests'
  Slug.collection.remove
  Content.collection.remove
  Slug.new(:uid => '7', :name => 'duder').save
  Slug.new(:uid => '7', :name => 'testing').save
end

describe PersistanceService do
  it "should save without error" do
    setup
    service = PersistanceService.new
    service.save_content('7', '{"slug_name":"testing", "version":"5"}')['success'].should == true
  end
end
