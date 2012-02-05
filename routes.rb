require 'sinatra'
require 'json'
require 'erb'

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
				"prefixTree" => ""
			},
		"jsOptions"   => {
			"coffeeScript" => "",
			"libraries" => [ ]
		}
	}

	return data
end