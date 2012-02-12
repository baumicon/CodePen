require 'sinatra'
require 'mongo_mapper'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require_relative 'models/user'
require_relative 'minify.rb'

Dir.glob("controllers/*.rb").each {|r| require_relative r }

class App < Sinatra::Base

    use Rack::Session::Cookie
    enable :sessions

    MongoMapper.database = 'tinkerbox'

    use OmniAuth::Builder do
          provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
    end

    get '/' do
        @tbdb = get_tbdb()
        @user = get_user()
        erb :index
    end

    get '/:slug/fullpage/' do
        return 'Full page'
    end

    helpers do
        def close embedded_json
            embedded_json.gsub('</', '<\/')
        end
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


    # todo, flesh out the data held by the user
    # need a list of past tinker boxes, and urls to those
    # it would probably make sense to hang all the data 
    # off the user object
    def get_user()
        user = {
            'username' => 'huckle bucker',
            'loggedin' => false
        }
        return user
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
        auth = request.env['omniauth.auth']
        begin
            query = User.query(:uid => auth["uid"]).all
            if(query.count == 1)
                user = query[0]
            else
                user = User.new(:uid => auth["uid"],
                    :nickname => auth["info"]["nickname"],
                    :name => auth["info"]["name"],
                    :provider => 'twitter')
                user.save
            end
            session[:user_id] = user._id
        rescue Exception
            require 'pp'
            pp e
        end
        redirect '/'
    end

    get '/auth/failure' do
        'Authentication Failed'
    end
end
