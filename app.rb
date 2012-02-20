require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require 'mongo_mapper'
require_relative 'models/user'
require_relative 'services/preprocessor_service'
require_relative 'minify.rb'


class App < Sinatra::Base

  MongoMapper.database = 'tinkerbox'
  use Rack::Session::Cookie
  enable :sessions

  use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
  end

  def set_session
    @user = User.get_by_session_id(session[:user_id])
    session[:user_id] = @user.uid
  end

  get '/sanity' do
    "working"
  end

  get '/' do
    set_session
    @tbdb = {}
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
    rend = Renderer.new
    data = get_data_by_slug()

    @TITLE       = data['title']
    @HTML        = rend.get_html(data['html'], data['html_pre_processor'])
    @CSS         = rend.get_css(data['css'], data['css_pre_processor'])
    @JS          = rend.get_js(data['js'], data['js_pre_processor'])
    @CSS_STARTER = rend.get_css_starter(data['CSS_STARTER'])
    @PREFIX      = rend.get_prefix(data['PREFIX'])
    @JSLIB       = rend.get_jslib(data['JSLIB'])

    erb :fullpage
  end

  def get_data_by_slug
    return {
      'title'       => 'CODE PEN',
      'css'         => 'body { background-color: blue; }',
      'html'        => '<h1>holy guac batman!</h1>',
      'js'          => 'console.log("testing");',
      'jslib'       => 'jquery-latest',
      'prefix'      => '',
      'css_starter' => 'none',
    }
  end

  post '/gist/' do
    # alextodo, create a public gist, with 4 files
    # html, css, js, and result
    # http://developer.github.com/v3/gists/
    gistData = {
        'Description' => 'A code snippet, created with Code Pen',
        'public'      => true,
        'files'       => {
            'index.html' => {
                'content' => params[:html]
            },
            'style.css'  => {
                'content' => params[:css]
            },
            'index.js'   => {
                'content' => params[:js]
            }
        }
    }

    # see about getting the result in a bit
    # 'result.html' => {
    #     'content' => this.getIFrameHTML()
    # }
    uri = URI.parse("https://api.github.com/gists")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    request = Net::HTTP::Post.new(uri.request_uri)
    puts encode(gistData)
    request.set_form_data({ "data" => encode(gistData) })

    res = http.request(request)
    puts 'response ' + res.body

    obj = JSON.parse(res.body)

    res.body
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
