require 'sinatra'
require 'json'
require 'erb'

helpers do
    def get_templates
        {'results' => [(erb :template)]}.to_json
    end
end

get '/' do
    erb :index
end
