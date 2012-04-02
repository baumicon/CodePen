require 'erb'
require 'uri'
require 'awesome_print'
require './services/preprocessor_service'

class Renderer
  
  @pps
  # path type is either web_page_relative or download
  # depending on the relative path the files should use
  @path_type = 'web_page_relative'
  
  def initialize
    @pps = PreProcessorService.new
  end
  
  # Render the user's full page for them to download in a zip file
  def render_download_page(data)
    @path_type = 'download'
    
    render_full_page(data)
  end
  
  # Render the user's full page to display on codepen.io
  def render_full_page(data)
    @TITLE       = data['slug']

    # html related
    @HTML         = @pps.process_html(data['html_pre_processor'], data['html'])
    @HTML_CLASSES = data['html_classes']
    # CSS related
    @CSS          = @pps.process_css(data['css_pre_processor'], data['css'])
    @CSS_STARTER  = get_css_starter(data['css_starter'])
    @PREFIX       = get_prefix(data['css_prefix_free'])
    @CSS_EXTERNAL = get_css_external(data['css_external'])
    # js related
    @JS           = get_js(data)
    @JSLIBRARY    = get_js_library(data['js_library'])
    @JS_MODERNIZR = get_js_modernizr(data['js_modernizr'])
    @JS_EXTERNAL  = get_js_external(data['js_external'])
    
    render_tpl()
  end
  
  private
  
  def render_tpl()
    tpl = File.open("./views/fullpage.erb", "rb")
    renderer = ERB.new(tpl.read)
    result = renderer.result(binding)
    
    # Replaces lines that only have whitespaces a new line char
    result = result.gsub(/^\s*$/, "\n")
    # Combine two or more line breaks into just 2 line breaks
    result.gsub(/[\n]{2,}/, "\n\n")
  end
  
  def get_css_starter(css_starter)
    stylesheet = ''
    path = (@path_type == 'download') ? 'css' : '/stylesheets/css'

    if css_starter == 'normalize'
      href = path + '/normalize.css';
      stylesheet = '<link rel="stylesheet" href="'+ href + '">';
    elsif css_starter == 'reset'
      href = path + '/reset.css';
      stylesheet = '<link rel="stylesheet" href="'+ href + '">';
    end

    stylesheet
  end
  
  def get_prefix(prefix)
    path = (@path_type == 'download') ? 'js' : '/js/libs'
    
    (prefix == '' or prefix.nil?) ? '' : '<script src="' + path + '/prefixfree.min.js"></script>'
  end
  
  def get_css_external(css_external)
    stylesheet = ''
    
    if css_external != '' and !css_external.nil?
      if !(css_external =~ URI::regexp).nil? and css_external[-3, 3] == 'css'
        stylesheet = '<link rel="stylesheet" href="' + css_external + '">'
      else
        stylesheet = '<!-- invalid external stylesheet: ' + css_external + ' -->'
      end
    end
    
    stylesheet
  end
  
  def get_js(data)
    js = @pps.process_js(data['js_pre_processor'], data['js'])
    script = '<!-- no js -->'
    
    if !js.nil? and js != ''
      script = "(function() {\n\n"
      script+= "// Your Code!\n"
      script+= js + "\n\n"
      script+= "})();"
    end
    
    script
  end
  
  def get_js_library(js_library)
    href = ''
    path = (@path_type == 'download') ? 'http:' : ''
    
    if js_library == 'jquery'
      href = '//code.jquery.com/jquery-latest.js'
    elsif js_library == 'mootools'
      href = '//ajax.googleapis.com/ajax/libs/mootools/1/mootools-yui-compressed.js'
    elsif js_library == 'prototype'
      href = '//ajax.googleapis.com/ajax/libs/prototype/1/prototype.js'
    elsif js_library == 'extjs'
      href = '//ajax.googleapis.com/ajax/libs/ext-core/3/ext-core.js'
    elsif js_library == 'dojo'
      href = '//ajax.googleapis.com/ajax/libs/dojo/1/dojo/dojo.xd.js'
    end
    
    if href.nil? or href == ''
      return ''
    else
      return '<script src="' + path + href + '"></script>'
    end
  end
  
  def get_js_modernizr(js_modernizr, path='/js/libs')
    path = (@path_type == 'download') ? 'js' : '/js/libs'
    
    (js_modernizr == '' or js_modernizr.nil?) ? 
      '' : '<script src="' + path + '/modernizr.js"></script>'
  end
  
  def get_js_external(js_external)
    script = ''
    
    if js_external != '' and !js_external.nil?
      # make sure the javascript is a valid URL and it ends with .js
      if !(js_external =~ URI::regexp).nil? and js_external[-2, 2] == 'js'
        script = '<script src="' + js_external + '"></script>'
      else
        script = '<!-- invalid external javascript file: ' + js_external + ' -->'
      end
    end
    
    script
  end
  
end
