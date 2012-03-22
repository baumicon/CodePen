module AjaxUtil

  require 'json'

  def hash_success(payload = false)
    ret = {'success' => true}
    return ret unless payload
    ret.merge(payload)
  end

  def hash_errors(errors)
    {'success' => false, 'errors' => errors}
  end

  def json_success(payload = false)
    hash_success(payload).to_json
  end

  def json_errors(errors)
    hash_errors(errors).to_json
  end

end
