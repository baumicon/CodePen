require 'compass'
require 'net/http'
require 'haml'
require 'json'
require 'slim'
require 'sass'
require 'awesome_print'

NODE_URL = 'http://127.0.0.1:8124'

class PreProcessorService

  attr_accessor :errors

  def initialize()
    @errors = { }
  end
  
  # Public: Process all three parts of content (html, css and js) at once.
  #
  # data - the hash with keys, html, css, js, and (html|css|js)_pre_processor
  #
  # Examples
  # process_content({
  #   'html' => 'h1 level one header',
  #   'html_pre_processor' => 'jade',
  #   'css' => '@color: blue; h1 { color: @color;}'
  #   'css_pre_processor' => 'less'
  # })
  #
  #  => {'html' => '<h1>level one header</h1>', 'css' => 'h1 { color: blue; }' }
  #
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
  
  # Public: Process HTML with preprocessors
  #
  # type - the preprocessor type (jade|haml)
  # html - the content to process
  #
  # Examples
  #
  #   process_html('jade', 'h1 level one header')
  #     => '<h1>level one header</h1>'
  #
  def process_html(type, html)
    if type == 'jade'
      html = node_req('/jade/', 'html', html, 'Jade')
    elsif type == 'slim'
      begin
        Slim::Engine.set_default_options :pretty => true
        slim_tmpl = Slim::Template.new { html }
        html = slim_tmpl.render
      rescue Exception => e
        @errors['Slim'] = e.message
      end
    elsif type == 'haml'
      begin
        html = Haml::Engine.new(html).render
      rescue Exception => e
        @errors['HAML'] = e.message
      end
    end
    
    html = (html) ? html.strip() : ''
  end

  # Public: Process CSS with preprocessors
  #
  # type - the preprocessor type (less|stylus|scss|sass)
  # css  - the content to process
  # 
  # Examples
  #
  #   process_css('less', '@color: blue; h1 { color: @color;}')
  #     => 'h1 { color: blue; }'
  def process_css(type, css)
    if type == 'less'
      # alextodo take a look at less errors
      # they should be able to add to errors array
      css = node_req('/less/', 'css', css, 'LESS')
    elsif type == 'stylus'
      css = node_req('/stylus/', 'css', css, 'Stylus')
    elsif type == 'scss'
      begin
        # scss with compass
        imports_and_css = '@import "compass";' + "\n" + css
        engine = get_sass_scss_engine(imports_and_css, :scss)
        css = engine.render
      rescue Sass::SyntaxError => e
        @errors['SCSS'] = e.message
      end
    elsif type == 'sass'
      begin
        # sass with compass
        imports_and_css = "@import \"compass\"\n" + css
        engine = get_sass_scss_engine(imports_and_css, :sass)
        css = engine.render
      rescue Sass::SyntaxError => e
        @errors['SASS with Compass'] = e.message
      end
    end

    css
  end
  
  # A sass engine for compiling sass/scss content with compass
  # Read this file for options we can change
  # http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#syntax
  def get_sass_scss_engine(content, syntax)
    opts = Compass.sass_engine_options
    opts[:style]  = :expanded
    opts[:syntax] = syntax
    opts[:line_numbers] = false
    opts[:line_comments] = false
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