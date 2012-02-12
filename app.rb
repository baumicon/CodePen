require 'sinatra'
require 'mongo_mapper'
require 'json'
require 'omniauth'
require 'omniauth-twitter'
require_relative 'models/user'

Dir.glob("controllers/*.rb").each {|r| require_relative r }

class App < Sinatra::Base

    use Rack::Session::Cookie
    enable :sessions

    MongoMapper.database = 'tinkerbox'

    use OmniAuth::Builder do
          provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
    end

    get '/' do
        @tbdb = encode(get_tbdb())
        erb :index
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

        return data
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
