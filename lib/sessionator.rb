require './models/user'
require './models/incrementor'

module Sessionator

  use Rack::Session::Cookie, :key => 'codepen'

  def set_session

    if uid = session['uid']
      @user = User.first(:uid => uid, :sort => :uid.desc)
      if @user.nil?
        session.clear
        set_session
      end
    else
      @user = User.new(:uid => Incrementor.next_count('user'))
      @user.save
    end

    session['uid'] = @user.uid
  end

end
