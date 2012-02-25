require 'net/http'
require 'haml'
require 'sass'
require 'compass'
require 'json'

NODE_URL = 'http://127.0.0.1:8124'

class PreProcessorService

  attr_accessor :errors

  def initialize()
    @errors = { }
  end
  
  def process_content(data)
    results = { }
    
    if !empty?(data[:html])
      results['html'] = process_html(data[:html_pre_processor], data[:html])
    end

    if !empty?(data[:css])
      results['css'] = process_css(data[:css_pre_processor], data[:css])
    end

    if !empty?(data[:js])
      results['js'] = process_js(data[:js_pre_processor], data[:js])
    end
    
    results
  end
  
  def process_html(type, html)
    if type == 'jade'
      html = node_req('/jade/', 'html', html, 'Jade')
    elsif type == 'haml'
      begin
        html = Haml::Engine.new(html).render
      rescue Exception => e
        @errors['HAML'] = e.message
      end
    end

    html
  end

  def process_css(type, css)
    if type == 'less'
      # alextodo take a look at less errors
      # they should be able to add to errors array
      css = node_req('/less/', 'css', css, 'LESS')
    elsif type == 'stylus'
      css = node_req('/stylus/', 'css', css, 'Stylus')
    elsif type == 'scss'
      begin
        # simple scss
        css = Sass::Engine.new(css, :syntax => :scss).render
      rescue Sass::SyntaxError => e
        @errors['SCSS'] = e.message
      end
    elsif type == 'sass'
      begin
        # sass with compass
        engine = get_sass_compass_engine(css)
        css = engine.render
      rescue Sass::SyntaxError => e
        msg = suggest_compass_error_fix(e.message)
        @errors['SASS with Compass'] = msg
      end
    end

    css
  end
  
  # alextodo, talk to coyier about adding a suggestion spot
  # for now ghettofy it
  def suggest_compass_error_fix(msg)
    # suggest a fix for Undefined mixins
    match = msg.scan(/undefined mixin '([-\d\w]+)'/i)
    match = match[0][0]
    
    if !empty?(match)
      suggestions = {
        'box-shadow'    => 'Try adding @import "compass/css3/box-shadow"',
        'border-radius' => 'Try adding @import "compass/css3/border-radius"'
      }
      
      if suggestions.has_key?(match)
        msg += "\n<br />" + suggestions[match]
      end
    end
    
    msg
  end
  
  # A sass engine for compiling sass content with compass
  # Read this file 
  # http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#syntax
  # alextodo, would be really cool to detect the mixins like
  # @include border-radius, and tell the user they need to
  # add this import, @import "compass/css3/border-radius"
  # otherwise, you get this error
  #   (sass):4:in `border-radius': Undefined mixin 'border-radius'.
  # we can tell them that we added it for them, or tell them how to fix it
  def get_sass_compass_engine(content)
    opts = Compass.sass_engine_options
    opts[:style]  = :expanded
    opts[:syntax] = :sass
    # set the full exception to false so that Sass engine throws
    # a ruby exception instead of adding error to CSS
    opts[:full_exception] = false
    # Give Sass engine access to all the compass sass files
    opts[:load_paths] = Compass.configuration.sass_load_paths
    
    Sass::Engine.new(content, opts)
  end

  def process_js(type, js)
    if type == 'coffeescript'
      js = node_req('/coffeescript/', 'js', js, 'CoffeeScript')
    end

    js
  end

  def node_req(path, key, value, err_key)
    uri = URI(NODE_URL + path)
    res = Net::HTTP.post_form(uri, key => value)

    obj = JSON.parse(res.body)
    record_errors(obj, err_key)

    obj[key]
  end

  # Add any errors to the errors hash
  def record_errors(obj, key)
    if obj['error']
      @errors[key] = obj['error']
    end
  end
  
  def empty?(content)
    content == nil or content.empty?
  end
  
end