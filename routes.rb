require_relative 'models/user'

class UserService

end
=======
require 'sinatra'
require 'json'
require 'erb'
require 'net/http'
require_relative 'minify.rb'

get '/' do
  @tbdb = encode(get_tbdb())
  @user = get_user()

  erb :index
end

get '/:slug/' do
  @tbdb = encode(get_tbdb())
  @slug = params[:slug]

  erb :fullpage
end

post '/process/html/' do
  response = ''

  if params[:type] == 'jade'
    uri = URI('http://127.0.0.1:8124/jade/')
    res = Net::HTTP.post_form(uri, 'html' => params[:html])
    response = res.body
  end

  response
end

get '/:slug/fullpage/' do
  # todo, will need to actually pull
  # the right data for the url
  @tbdb = get_tbdb()

  erb :fullpage
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
		"slug" => "My kickass TB",
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
