require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require './services/preprocessor_service'
require './services/gist_service'
require './services/user_service'

require_relative 'renderer.rb'
require_relative 'minify.rb'

class App < Sinatra::Base

  use Rack::Session::Cookie
  enable :sessions

  use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
  end

  get '/' do
    @user = UserService.new().user_by_session(session[:user_id])
    @tbdb = { }
    erb :index
  end

  post '/save/content' do
    {'success' => true}.to_json
  end

  get '/slugs' do
    return true
  end

  get '/content/:slug_name' do
    return true
  end

  post '/save/content' do
    {'success' => true}.to_json
  end

  get '/auth/:name/callback' do
    user_service = UserService.new
    user = user_service.first_or_new(request.env['omniauth.auth'])
    session[:user_id] = user._id
    redirect '/'
  end

  get '/auth/failure' do
    'Authentication Failed'
  end
  
  get '/list/' do
    @pens = [ ]
    
    erb :list
  end

  post '/process/' do
    pps = PreProcessorService.new
    results = { }
    
    if params[:html] != nil and !params[:html].empty?
      results['html'] = pps.process_html(params[:htmlPreProcessor], params[:html])
    end
    
    if params[:css] != nil and !params[:css].empty?
      results['css'] = pps.process_css(params[:cssPreProcessor], params[:css])
    end
    
    if params[:js] != nil and !params[:js].empty?
      results['js'] = pps.process_js(params[:jsPreProcessor], params[:js])
    end
    
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
  
  def get_data_by_slug
    return {
      'title'       => 'CODE PEN',
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
    data = get_gist_data(params[:data])
    rend = Renderer.new(data)
    result = rend.render_full_page()
    
    gs = GistService.new(data)
    url_to_gist = gs.create_gist(data, result)
    
    encode({ 'url' => url_to_gist })
  end
  
  # alextodo, look at replacing with tim's code that uses regex and underscores
  def get_gist_data(data)
    data = JSON.parse(data)
    
    return {
      'title' => data['name'],
      'html'  => data['html'],
      'css'   => data['css'],
      'js'    => data['js'],
      
      'html_pre_processor' => data['htmlPreProcessor'],
      'html_classes'       => data['htmlClasses'],
      
      'css_pre_processor' => data['cssPreProcessor'],
      'css_prefix_free'   => data['cssPrefixFree'],
      'css_starter'       => data['cssStarter'],
      'css_external'      => data['cssExternal'],
      
      'js_pre_processor' => data['jsPreProcessor'],
      'js_library'       => data['js_library'],
      'js_modernizr'     => data['jsModernizr'],
      'js_external'      => data['jsExternal']
    }
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
    def js_scripts(scripts)
      minify = Minify.new()
      minify.script_tags(scripts)
    end
    def close embedded_json
      embedded_json.gsub('</', '<\/')
    end
  end
  
end