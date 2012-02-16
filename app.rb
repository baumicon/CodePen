require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require_relative 'minify.rb'

Dir.glob("services/*.rb").each {|r| require_relative r }

class App < Sinatra::Base

    use Rack::Session::Cookie
    enable :sessions

    use OmniAuth::Builder do
          provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
    end

    get '/' do
        user_service = UserService.new
        @user = user_service.user_by_id(session[:user_id]) or user_service.default_user

        @tbdb = get_tbdb()
        erb :index
    end

    get '/:slug/fullpage/' do
        return 'Full page'
    end

    def get_tbdb()
        # default instance of a tinker box
        # in the future, it will be loaded from db
        data = {
            "name" => "My kickass TB",
            "html" => "<div>Howdy, folks!</div>",
            "css"  => "body { background: #BADA55; }",
            "js"   => "var myString = 'Badda bing!';",
            "htmlOptions" => {
                "jade" => "",
                "haml" => ""
            },
            "cssOptions"  => {
                    "less"       => "",
                    "stylus"     => "",
                    "scss"       => "",
                    "sass"       => "",
                    "prefixTree" => "/box-libs/prefixfree.min.js"
                },
            "jsOptions"   => {
                "coffeeScript" => "",
                "libraries" => [ ]
            }
        }

        return data.to_json.gsub('/', '\/')
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
    
    # PREPROCESSORS
    
    post '/process/' do
      pps = PreProcessorService.new
      
      if params[:html] != nil and !params[:html].empty?
        html = pps.process_html(params[:htmlPreProcessor], params[:html])
      end
      
      if params[:css] != nil and !params[:css].empty?
        css = pps.process_css(params[:cssPreProcessor], params[:css])
      end
      
      if params[:js] != nil and !params[:js].empty?
        js = pps.process_js(params[:jsPreProcessor], params[:js])
      end

      encode({ 'html' => html, 'css' => css, 'js' => js})
    end
    
    def encode(obj)	  	
      obj.to_json.gsub('/', '\/')	  	
    end
    
    get '/:slug/fullpage/' do
      # todo, will need to actually pull
      # the right data for the url
      @tbdb = get_tbdb()

      erb :fullpage
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

        # alextodo, break out into second class that is configurable
        # should be able to simply include, but also make it configurable
        # so that certain libs are grouped into a single file together
        def js_scripts(scripts)
            minify = Minify.new()
            minify.script_tags(scripts)
        end
    end

end
