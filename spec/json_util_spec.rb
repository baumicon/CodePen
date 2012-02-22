require './lib/json_util'

def get_json1
  '{"camelCased":"value"}'
end

def get_hash
  {'one_love' => 'booyakasha!'}
end

describe JsonUtil do

  it "should change camel-case json into underscored hash" do
    result = JsonUtil.js_to_ruby_hash(get_json1)
    result['camel_cased'].should == 'value'
  end

  it "should change snake-case hahs into underscored hash" do
    result = JsonUtil.snake_to_camel(get_hash)
    result['oneLove'].should == 'booyakasha!'
  end

end
