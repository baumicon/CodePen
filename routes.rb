require 'sinatra'
require 'json'
require 'erb'
require_relative 'minify.rb'

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
    
    # alextodo, break out into second class that is configurable
    # should be able to simply include, but also make it configurable
    # so that certain libs are grouped into a single file together
    def js_scripts(scripts)
      minify = Minify.new()
      minify.script_tags(scripts)
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