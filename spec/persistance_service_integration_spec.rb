#TODO: learn how to separate integraiton tests from standard ones

require '../services/persistance_service'
MongoMapper.database = 'integration_test'

def clear_db
  MongoMapper.database.collections.each do |collection|
    collection.remove
  end
end

describe PersistanceService do

  it "should save if user already owns slug" do
    clear_db
    Slug.new(:uid => '7', :name => 'testing').save
    User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save

    service = PersistanceService.new
    service.save_content('7', '{"slug_name":"testing", "version":"5"}')['success'].should == true
  end

  it "should save if slug is new and not already taken" do
    clear_db
    User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
    service = PersistanceService.new
    result = service.save_content('7', '{"slug_name":"new_slug", "version":"5"}')
    result['success'].should == true
  end

  it "should NOT save if slug is already taken by another user" do
    clear_db
    User.new(:uid => '7', :name => 'user', :provider => 'twitter', :nickname => 'booger').save
    Slug.new(:name => 'new_slug', :uid => '5').save
    service = PersistanceService.new
    result = service.save_content('7', '{"slug_name":"new_slug", "version":"5"}')
    result['success'].should == false
  end
end
