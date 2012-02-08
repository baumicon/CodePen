require 'sinatra'
require 'json'
require 'omniauth'
require 'omniauth-twitter'

class App < Sinatra::Base


    use Rack::Session::Cookie
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

    def encode(obj)
        obj.to_json.gsub('/', '\/')
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
        require 'pp'
        pp auth
    end

    get '/auth/failure' do
        'Authentication Failed'
    end
end
