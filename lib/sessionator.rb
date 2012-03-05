require './models/user'
require './models/incrementor'

module Sessionator

  use Rack::Session::Cookie, :key => 'codepen'

  def set_session

    if uid = session['uid']
      @user = User.first(:uid => uid, :sort => :uid.desc)
    else
      @user = User.new(:uid => Incrementor.next_id('user'))
      @user.save
    end

    session['uid'] = @user.uid
  end

end
