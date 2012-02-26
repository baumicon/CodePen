require 'sinatra'
require 'json'
require './lib/sessionator'
require './lib/ajax_util'

class AppTester < Sinatra::Base

  include Sessionator
  include AjaxUtil

  get '/session/:key/:value' do |key, value|
    session[key] = value
  end

  get %r{/(\d)/(\d)} do |slug, version|
    return {"slug" => slug, "version" => version}.to_json if params[:test]
  end

  get '/sessionator' do
    set_session
    success('user' => @user).to_json
  end

  get '/' do
    'hell world'
  end

end
