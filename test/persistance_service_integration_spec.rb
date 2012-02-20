#TODO: learn how to separate integraiton tests from standard ones

require '../services/persistance_service'
MongoMapper.database = 'integration_test'

def setup
  Slug.collection.remove
  Content.collection.remove
  User.collection.remove

  require 'awesome_print'
  ap 'hi'
  Slug.new(:uid => '7', :name => 'duder').save
  Slug.new(:uid => '7', :name => 'testing').save
  ap Slug.all
  User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
end

describe PersistanceService do
  it "should save without error", :type => 'integation' do
    require 'awesome_print'
    ap 'hello'
    setup
    service = PersistanceService.new
    service.save_content('7', '{"slug_name":"testing", "version":"5"}')['success'].should == true
  end
end
