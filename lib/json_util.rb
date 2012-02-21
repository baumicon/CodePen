require 'json'
require 'active_support/inflector'

class JsonUtil
  def self.js_to_ruby_hash(json)
    JSON.parse(json).inject({}) { |h, (k, v)| h[k.underscore] = v; h }
  end

  def self.snake_to_camel(hash)
    return hash.inject({}) {|h, (k, v)| h[k.camelize(:lower)] = v; h}
  end
end
