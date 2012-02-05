require 'sinatra'
require 'json'

get '/do' do
    @tpl = get_templates()
	puts @tpl

require 'erb'

helpers do
    def get_templates
        {'results' => (erb :template)}.to_json
    end
end

get '/' do
    erb :index
end

def get_templates()
	file = File.open("./views/template.erb", "rb")
	result_template = file.read()

    templates = {'result' => result_template }

	JSON.to_json(templates)
end