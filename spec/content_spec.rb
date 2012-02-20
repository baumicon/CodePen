require '../models/content'
require '../models/slug'

describe Content do
  it "should validate required fields" do
    c = Content.new_from_json('{}', 'my_uid', [])
    c.valid?.should be_false
    c.errors.should have_key :version
    c.errors.should have_key :slug_name
    c.errors.should have_key :slug_not_owned
  end

  it "should prevent you from saving to a slug you don't own" do
    c = Content.new_from_json('{"slug_name":"testing", "version":"5"}', '555', ['bingo'])
    c.valid?.should be_false
    c.errors.should have_key :slug_not_owned
  end

  it "should allow you to save a slug if you own it" do
    c = Content.new_from_json('{"slug_name":"testing", "version":"5"}', '555', ['testing'])
    c.valid?.should be_true
  end
end
