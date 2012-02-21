require 'erb'
require 'uri'
require './services/preprocessor_service'

class Renderer
  
  @pps
  @data
  
  def initialize(data)
    @data = data
    @pps = PreProcessorService.new
  end
  
  def render_full_page
    @TITLE       = @data['slug']
    
    # html related
    @HTML         = @pps.process_html(@data['html_pre_processor'], @data['html'])
    @HTML_CLASSES = @data['html_classes']
    # CSS related
    @CSS          = @pps.process_css(@data['css_pre_processor'], @data['css'])
    @CSS_STARTER  = get_css_starter(@data['css_starter'])
    @PREFIX       = get_prefix(@data['prefix'])
    @CSS_EXTERNAL = get_css_external(@data['css_external'])
    # js related
    @JS           = @pps.process_js(@data['js_pre_processor'], @data['js'])
    @JSLIBRARY    = get_js_library(@data['js_library'])
    @JS_MODERNIZR = get_js_modernizr(@data['js_modernizr'])
    @JS_EXTERNAL  = get_js_external(@data['js_external'])
    
    render_tpl()
  end
  
  private
  
  def render_tpl()
    tpl = File.open("./views/fullpage.erb", "rb")
    renderer = ERB.new(tpl.read)
    renderer.result(binding)
  end
  
  def get_css_starter(css_starter)
    if css_starter == 'normalize'
      href = '/stylesheets/css/normalize.css';
      return '<link rel="stylesheet" href="'+ href + '">';
    elsif css_starter == 'reset'
      href = '/stylesheets/css/reset.css';
      return '<link rel="stylesheet" href="'+ href + '">';
    else
      return ''
    end
  end
  
  def get_prefix(prefix)
    (prefix) ? '<script src="/box-libs/prefixfree.min.js"></script>' : ''
  end
  
  def get_css_external(css_external)
    stylesheet = ''
    
    if css_external and css_external != ''
      if !(css_external =~ URI::regexp).nil? and css_external[-3, 3] == 'css'
        stylesheet = '<link rel="stylesheet" href="' + css_external + '">'
      else
        stylesheet = '<!-- invalid external stylesheet: ' + css_external + '-->'
      end
    end
    
    stylesheet
  end
  
  def get_js_library(js_library)
    if js_library == 'jquery-latest'
      return '<script src="http://code.jquery.com/jquery-latest.js"></script>'
    elsif js_library == 'mootools'
      href = '//ajax.googleapis.com/ajax/libs/mootools/1.4.1/mootools-yui-compressed.js'
      return '<script src="' + href + '"></script>'
    elsif js_library == 'prototype'
      href = '//ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js'
      return '<script src="' + href + '"></script>'
    end
  end
  
  def get_js_modernizr(js_modernizr)
    (js_modernizr) ? '<script src="/js/libs/modernizr.js"></script>' : ''
  end
  
  def get_js_external(js_external)
    script = ''
    
    if js_external and js_external != ''
      if !(js_external =~ URI::regexp).nil? and js_external[-2, 2] == 'js'
        script = '<script src="' + js_external + '"></script>'
      else
        script = '<!-- invalid external javascript file: ' + js_external + '-->'
      end
    end
    
    script
  end
  
end
