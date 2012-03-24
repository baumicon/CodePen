require './models/user'
require './models/incrementor'
require 'digest'

module Sessionator

  use Rack::Session::Cookie, :key => 'codepen'

  def set_session
    if uid = session['uid']
      @user = User.first(:uid => uid, :sort => :uid.desc)
      if @user.nil?
        puts 'gonna clear the session here'
        session.clear
        set_session
      end
    else
      @user = User.new(:uid => Incrementor.next_count('user'))
      @user.save
    end

    session['uid'] = @user.uid
  end

  def set_auth_token
    salt = 'css-tricks'
    session['auth_token'] = Digest::SHA1.hexdigest(salt + Time.now.to_i.to_s)
  end

  def valid_auth_token?(auth_token)
    auth_token == session['auth_token']
  end
end
