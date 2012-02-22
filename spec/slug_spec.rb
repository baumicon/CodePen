require './models/slug'
require 'spec_helper'

def setup
  Slug.collection.remove
  Slug.new(:uid => '7', :name => 'duder').save
end

describe Slug do
  it "should not allow duplicates" do
    setup
    slug = Slug.new(:uid => '7', :name => 'duder')
    slug.valid?.should == false
  end
end
