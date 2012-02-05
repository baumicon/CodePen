require 'sinatra'
require 'json'
require 'erb'

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
