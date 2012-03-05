require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require 'mongo_mapper'
require './services/gist_service'
require './services/content_service'
require './services/preprocessor_service'
require './lib/sessionator'
require './services/renderer'
require './lib/minify'

class App < Sinatra::Base
  # MongoMapper setup
  MongoMapper.database = 'tinkerbox'

  include Sessionator

  use Rack::Session::Cookie, :key => 'codepen'

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
    erb :index
  end

  post '/save/content' do
    set_session
    service = ContentService.new
    result = service.save_content(@user, params[:content])
    return result.to_json
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

  get '/:slug/fullpage/' do
    # todo, will need to actually pull
    # the right data for the url from data service
    data = get_data_by_slug()
    rend = Renderer.new(data)
    rend.render_full_page()
  end

  # anon user
  get %r{/(\d)} do |slug|
    content = ContentService.new.latest(slug)
    @c_data = content['payload'] or {}
    erb :index
  end

  # anon user
  get %r{/(\d)/(\d)} do |slug, version|
    content = ContentService.new.latest(slug, version)
    @c_data = content['payload'] or {}
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

  helpers do
    def get_templates
      {'result' => (erb :template)}.to_json.gsub('/', '\/')
    end
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
