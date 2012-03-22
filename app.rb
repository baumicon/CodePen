require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require 'mongo_mapper'
require './services/gist_service'
require './services/preprocessor_service'
require './services/login_service'
require './lib/sessionator'
require './services/renderer'
require './lib/minify'
require 'awesome_print'
require './models/content'

class App < Sinatra::Base
  # MongoMapper setup
  MongoMapper.database = 'tinkerbox'
  use Rack::Session::Cookie, 
    :key => 'codepen', 
    :expire_after => 2592000 # 30 days, make easy pacheesy on our user to not have to login.
  include Sessionator

  @@minify = false

  configure :production do
    @@minify = true
    disable :run, :reload, :show_exceptions
  end

  use OmniAuth::Builder do
    if not (ENV.has_key?('TWITTER_KEY') and ENV.has_key?('TWITTER_SECRET'))
      require './auth_keys.rb'
    end
    provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
  end

  get '/' do
    @c_data = {}
    @c_data['auth_token'] = set_auth_token
    @iframe_src = get_iframe_url(request)
    erb :index
  end

  # Returns the URL for the iframe
  # on localhost (for development) their is no subdomain.
  # This makes testing easier. On Production. we add a 'secure'
  # subdomain so that sneaky users can't XSS attack our home base.
  def get_iframe_url(request)
    if Sinatra::Application.environment == :development
      return request.scheme + '://' + request.host_with_port
    else
      # Bug in request.host_with_port that does not return .io
      # instead it returns codepen. We've hard coded the domain because of this
      url = request.scheme + '://secure.codepen.io'
    end
  end

  get '/secure_iframe' do
    # Setting the x-frame-options headers allows the
    # content to be properly loaded in this iframe
    response.headers['X-Frame-Options'] = 'GOFORIT'
    erb :iframe
  end

  get '/about' do
    erb :about
  end

  get '/four' do
    erb :four
  end

  post '/save/content' do
    if valid_auth_token?(params[:auth_token])
      set_session
      content = Content.new_from_json(params[:content], @user.uid, @user.anon?)
      content = content.json_save
    else
      raise "Access Forbidden"
    end
  end

  post '/fork/:slug' do |slug|
    set_session
    content = Content.latest(slug)
    new_content = content.fork(@user) if content
    redirect "/#{@user.id}/#{new_content.slug}"
    #TODO: flash for errors
  end

  post '/fork/:slug/:version' do |slug, version|
    set_session
    content = Content.version(slug, version)
    conent.fork(@user) if content
    redirect "/#{@user.id}/#{new_content.slug}"
  end

  get '/auth/:name/callback' do
    puts 'here'
    set_session
    LoginService.new.login(@user, request.env['omniauth.auth'])
    redirect request.cookies['last_visited'] or '/'
  end

  get '/auth/failure' do
    'Authentication Failed'
  end

  get '/logout' do
    session[:uid] = false
    redirect '/'
  end

  get '/list/' do
    @pens = [ ]

    erb :list
  end

  post '/process/' do
    pps = PreProcessorService.new
    results = pps.process_content(params)

    if pps.errors.length > 0
      @errors = pps.errors
      results['error_html'] = erb :errors
    end

    encode(results)
  end

  # show full page for slug and version
  get %r{/([\d]+)/([\d]+)/full} do |slug, version|
    # pulling the version doesn't seem to work right now
    # use the latest version for now
    # content = JSON.parse(Content.version(slug, version))
    content = JSON.parse(Content.latest(slug))
    rend = Renderer.new
    rend.render_full_page(content)
  end

  # show the full page for latest version of slug
  get %r{/([\d]+)/full} do |slug|
    content = JSON.parse(Content.latest(slug))
    rend = Renderer.new
    rend.render_full_page(content)
  end

  # anon user
  get %r{/([\d]+)/([\d]+)} do |slug, version|
    set_auth_token
    content = JSON.parse(Content.version(slug, version))
    ap content
    @slug = true
    @iframe_src = get_iframe_url(request)
    @c_data = content
    @c_data['auth_token'] = set_auth_token

    erb :index
  end

  # anon user
  get %r{/([\d]+)} do |slug|
    set_auth_token

    ap 'slug:'
    ap slug

    # TODO: this is a hack.  we need to return a non-json version
    # and deal with errors in flash.  Same with below.
    content = JSON.parse(Content.latest(slug))
    ap content

    @slug = true
    @iframe_src = get_iframe_url(request)
    @c_data = content
    @c_data['auth_token'] = set_auth_token

    erb :index
  end

  post '/gist/' do
    data = JSON.parse(params[:data])

    rend = Renderer.new()
    result = rend.render_full_page(data)

    gs = GistService.new
    url_to_gist = gs.create_gist(data, result)

    encode({ 'url' => url_to_gist })
  end

  get '/test/coderenderer' do
    erb :test_code_renderer
  end

  error do
    'Unable to process request. ' + env['sinatra.error'].message
  end

  def encode(obj)
    obj.to_json.gsub('/', '\/')
  end

  helpers do
    def partial template
      erb template, :layout => false
    end
    def logged_in
      return session[:user_id]
    end
    def js_scripts(scripts, prod_filename)
      minify = Minify.new(@@minify, File.dirname(__FILE__))
      minify.script_tags(scripts, prod_filename)
    end
    def stringify obj
      json = obj.to_json or { }.to_json
      json.gsub('/', '\/')
    end
  end

end
