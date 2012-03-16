require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require 'mongo_mapper'
require './services/gist_service'
require './services/preprocessor_service'
require './lib/sessionator'
require './services/renderer'
require './lib/minify'
require 'awesome_print'
require './models/content'

class App < Sinatra::Base
  # MongoMapper setup
  MongoMapper.database = 'tinkerbox'
  use Rack::Session::Cookie, :key => 'codepen'
  include Sessionator

  @@minify = false

  configure :production do
    @@minify = true
    disable :run, :reload, :show_exceptions
  end

  use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
  end

  get '/' do
    @c_data = {}
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
  
  post '/save/content' do
    set_session
    content = Content.new_from_json(params[:content], @user.uid, @user.anon?)
    content.json_save
  end

  get '/auth/:name/callback' do
    set_session
    LoginService.new.update_regular_user(@user, request.env['omniauth.auth'])
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

  def encode(obj)
    obj.to_json.gsub('/', '\/')
  end

  get '/:slug/fullpage/' do |slug|
    data = Content.latest(slug)
    rend = Renderer.new(data)
    rend.render_full_page()
  end

  # anon user
  get %r{/(\d)} do |slug|
    # TODO: this is a hack.  we need to return a non-json version
    # and deal with errors in flash.  Same with below.
    content = JSON.parse(Content.latest(slug))
    ap content
    @iframe_src = get_iframe_url(request)
    @c_data = encode(content['payload'].to_json) or {}.to_json
    erb :index
  end

  # anon user
  get %r{/(\d+)/(\d+)} do |slug, version|
    content = JSON.parse(Content.version(slug, version))
    @iframe_src = get_iframe_url(request)
    @c_data = encode(content['payload'].to_json) or {}.to_json
    erb :index
  end

  def get_data_by_slug
    return {
      'slug'       => 'CODE PEN',
      'html'        => '<h1>holy guac batman!</h1>',
      'css'         => 'body { background-color: blue; }',
      'js'          => 'console.log("testing");',

      'html_pre_processor' => 'none',
      'html_classes'       => 'en',

      'css_pre_processor' => 'none',
      'css_prefix_free'   => '',
      'css_starter'       => 'none',
      'css_external'      => '',

      'js_pre_processor' => 'none',
      'js_library'       => 'jquery-latest',
      'js_modernizr'     => '',
      'js_external'      => ''
    }
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
    def close embedded_json
      embedded_json.gsub('</', '<\/')
    end
  end

end
