module AjaxUtil

  def success(payload = false)
    return ret = {'success' => true} unless payload
    ret['payload'] = payload
    ret
  end

  def errors(errors)
    {'success' => false, 'errors' => errors}
  end

end
