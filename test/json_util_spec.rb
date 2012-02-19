require '../lib/json_util'

def get_json1
  '{"camelCased":"value"}'
end

describe JsonUtil do
  it "should change camel-case json into underscored hash" do
    result = JsonUtil.condition_json(get_json1)
    result['camel_cased'].should == 'value'
  end
end
