require 'sinatra'
require 'sinatra/flash'
require 'json'
require './lib/sessionator'
require './lib/ajax_util'

class AppTester < Sinatra::Base

  include Sessionator
  include AjaxUtil
  register Sinatra::Flash

  #use Rack::Flash, :sweep => true, :accessorize => [:notice, :error]

  get '/session/:key/:value' do |key, value|
    session[key] = value
  end

  get '/flash/retrieve' do
    flash[:notice]
  end

  get '/flash/:word' do |word|
    flash[:notice] = word
  end

  get %r{/(\d)/(\d)} do |slug, version|
    return {"slug" => slug, "version" => version}.to_json if params[:test]
  end

  get '/sessionator' do
    set_session
    json_success('user' => @user)
  end

  get '/' do
    'hell world'
  end

end
