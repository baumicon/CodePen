module AjaxUtil

  require 'json'

  def json_success(payload = false)
    ret = {'success' => true}
    return ret unless payload
    ret = ret.merge(payload)
    ret.to_json
  end

  def json_errors(errors)
    {'success' => false, 'errors' => errors}.to_json
  end

end
