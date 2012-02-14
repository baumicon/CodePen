require 'sinatra'
require 'json'
require 'erb'
require 'net/http'
require 'haml'
require 'sass'
require 'compass'
require_relative 'minify.rb'

NODE_URL = 'http://127.0.0.1:8124'

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
  html = params[:html]
  
  begin
    if params[:type] == 'jade'
      uri = URI(NODE_URL + '/jade/')
      res = Net::HTTP.post_form(uri, 'html' => html)
      html = res.body
    elsif params[:type] == 'haml'
      html = Haml::Engine.new(html).render
    end
  rescue
    # pass continue
  end

  encode({'html' => html})
end

# // less, npm install less
# // stylus - npm , npm install stylus
# // sass - ruby
# // sass with compass - gem install compass
post '/process/css/' do
  css = params[:css]
  
  begin
    if params[:type] == 'less'
      uri = URI(NODE_URL + '/less/')
      res = Net::HTTP.post_form(uri, 'css' => css)
      css = res.body
    elsif params[:type] == 'stylus'
      uri = URI(NODE_URL + '/stylus/')
      res = Net::HTTP.post_form(uri, 'css' => css)
      css = res.body
    elsif params[:type] == 'scss'
      # just simple sass
      css = Sass::Engine.new(css, :syntax => :scss).render
    elsif params[:type] == 'sass'
      # compass with sass
      css = Sass::Engine.new(css).render
    end
  rescue
    # continue, nothing to see
  end

  encode({'css' => css})
end

post '/process/js/' do
  css = params[:css]
  
  begin
    if params[:type] == 'less'
      uri = URI(NODE_URL + '/less/')
      res = Net::HTTP.post_form(uri, 'css' => css)
      css = res.body
    elsif params[:type] == 'stylus'
      uri = URI(NODE_URL + '/stylus/')
      res = Net::HTTP.post_form(uri, 'css' => css)
      css = res.body
    elsif params[:type] == 'scss'
      # just simple sass
      css = Sass::Engine.new(css, :syntax => :scss).render
    elsif params[:type] == 'sass'
      # compass with sass
      css = Sass::Engine.new(css).render
    end
  rescue
    # continue, nothing to see
  end

  encode({'css' => css})
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
    
    def logged_in
        return session[:user_id]
    end
    
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
