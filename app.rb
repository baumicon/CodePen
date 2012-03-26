require 'sinatra'
require 'sinatra/flash'
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
require 'redis'

class App < Sinatra::Base
  # MongoMapper setup
  MongoMapper.database = 'tinkerbox'
  
  use Rack::Session::Cookie,
    :key => 'codepen',
    :expire_after => 2592000 # 30 days, make easy pacheesy on our user to not have to login.
  include Sessionator

  #https://github.com/nakajima/rack-flash
  register Sinatra::Flash

  @@minify = false

  # redis connection for now
  $redis = Redis.new
  $redis.set(:cached, "")
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

  ###########
  # HOME
  ###########
  
  get '/?' do
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

  get '/secure_iframe/?' do
    # Setting the x-frame-options headers allows the
    # content to be properly loaded in this iframe
    response.headers['X-Frame-Options'] = 'GOFORIT'
    erb :iframe
  end

  get '/about/?' do
    erb :about
  end

  get '/user/?' do
    erb :user
  end

  post '/save/content/?' do
    if valid_auth_token?(params[:auth_token])
      set_session
      content = Content.new_from_json(params[:content], @user.uid, @user.anon?)
      content = content.json_save
    else
      #TODO: log these
      ap 'illigal access'
      
      '{"success":false, "error":"illegal access."}'
    end
  end

  #######
  # Fork
  # #####
  post '/fork/:slug/?' do |slug|
    set_session
    fork_redirect(Content.first(:order => :version.desc, :slug => "#{slug}"))
  end

  post '/fork/:slug/:version/?' do |slug, version|
    set_session
    fork_redirect(Content.first(:order => :version.desc, :slug => "#{slug}"))
  end

  def fork_redirect(content)
    if content
      new_content = content.fork(@user)
      redirect "/#{new_content.slug}"
    end
    redirect request.referrer
  end

  get '/list/?' do
    @pens = [ ]

    erb :list
  end

  post '/process/?' do
    pps = PreProcessorService.new
    results = pps.process_content(params)

    if pps.errors.length > 0
      @errors = pps.errors
      results['error_html'] = erb :errors
    end

    encode(results)
  end

  ############
  # Full Page
  # ##########
  get %r{/([\d]+)/([\d]+)/full} do |slug, version|
    render_full_page Content.version(slug, version)
  end

  get %r{/([\d]+)/full} do |slug|
    render_full_page Content.latest(slug)
  end

  def render_full_page(content)
    show_404 if not content
    rend = Renderer.new
    rend.render_full_page(content)
  end

  #############
  # Anon User
  # ##########
  get %r{/embed/([\d]+)} do |slug|
    @c_data = Content.latest(slug)
    @iframe_src = get_iframe_url(request) + '/embed_secure/' + slug
    
    erb :embed
  end
  
  # load the result only for the slug
  get %r{/embed_secure/([\d]+)} do |slug|
    render_full_page Content.latest(slug)
  end
  
  get %r{/([\d]+)/([\d]+)} do |slug, version|
    set_content Content.version(slug, version)
    erb :index
  end

  get %r{/([\d]+)} do |slug|
    set_content Content.latest(slug)
    erb :index
  end

  def set_content(content)
    show_404 if not content['success']
    set_session
    
    @owned = (content['uid'] == @user.uid)
    @slug = true
    @iframe_src = get_iframe_url(request)
    @c_data = content
    @c_data['auth_token'] = set_auth_token
  end

  #############
  # Gist
  ###########
  post '/gist/?' do
    data = JSON.parse(params[:data])

    rend = Renderer.new()
    result = rend.render_full_page(data)

    gs = GistService.new
    url_to_gist = gs.create_gist(data, result)

    encode({ 'url' => url_to_gist })
  end

  get '/test/coderenderer/?' do
    erb :test_code_renderer
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

  not_found do
    erb :'404'
  end

  error do
    erb :'500'
  end

  def show_404(reason=false)
    flash[:error] = reason if reason
    raise Sinatra::NotFound
  end

  get '/auth/:name/callback/?' do
    puts 'here'
    set_session
    LoginService.new.login(@user, request.env['omniauth.auth'])
    redirect request.cookies['last_visited'] or '/'
  end

  get '/auth/failure/?' do
    'Authentication Failed'
  end

  get '/logout/?' do
    session[:uid] = false
    redirect '/'
  end

  get '/test/coderenderer/?' do
    erb :test_code_renderer
  end

end
