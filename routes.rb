require 'sinatra'
require 'json'
require 'erb'

get '/' do
    erb :index
end

helpers do
    def close embedded_json
        embedded_json.gsub('</', '<\/')
    end
    def get_templates
        {'result' => (erb :template)}.to_json.gsub('/', '\/')
    end
end