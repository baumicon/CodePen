require 'sinatra'
require 'json'
require 'omniauth-github'

# Authentication
use Rack::Session::Cookie
use OmniAuth::Builder do
      provider :github, ENV['GITHUB_KEY'], ENV['GITHUB_SECRET'], scope: "user,repo,gist"
end

helpers do
    def close embedded_json
        embedded_json.gsub('</', '<\/')
    end
    def get_templates
        {'result' => (erb :template)}.to_json
    end
end

get '/' do
    erb :index
end

post '/auth/:name/callback' do
    auth = request.env['omniauth.auth']
    require 'pp'
    pp auth
end
