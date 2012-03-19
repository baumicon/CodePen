module SessionUtil

  def clear_session(session)
    get '/session/prime/me'
    session.clear
  end

end
