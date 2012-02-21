module AjaxUtil

  def success(payload = false)
    ret = {'success' => true}
    return ret unless payload
    ret['payload'] = payload
    ret
  end

  def errors(errors)
    {'success' => false, 'errors' => errors}
  end

end
