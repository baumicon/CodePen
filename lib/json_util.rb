require 'json'

class String
  def underscore
    self.gsub(/::/, '/').
    gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2').
    gsub(/([a-z\d])([A-Z])/,'\1_\2').
    tr("-", "_").
    downcase
  end
end

class JsonUtil
  def self.condition_json(json)
    JSON.parse(json).inject({}) { |h, (k, v)| h[k.underscore] = v; h }
  end
end
