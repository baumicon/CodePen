require './models/user'
require 'uuid'

module Sessionator

  use Rack::Session::Cookie, :key => 'codepen'

  def set_session

    if uid = session['uid']
      @user = User.first(:uid => uid, :sort => :uid.desc)
    else
      @user = User.new(:uid => UUID.new.generate)
    end

  end
end
