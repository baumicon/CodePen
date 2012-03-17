require 'erb'
require 'uri'
require 'awesome_print'
require './services/preprocessor_service'

class Renderer
  
  @pps
  
  def initialize
    @pps = PreProcessorService.new
  end
  
  def render_full_page(data)
    @TITLE       = data['slug']
    puts 'DATA DATA'
    ap data

    # html related
    @HTML         = @pps.process_html(data['html_pre_processor'], data['html'])
    @HTML_CLASSES = value(data['html_classes'])
    # CSS related
    @CSS          = @pps.process_css(data['css_pre_processor'], data['css'])
    @CSS_STARTER  = get_css_starter(value(data['css_starter']))
    @PREFIX       = get_prefix(value(data['css_prefix_free']))
    @CSS_EXTERNAL = get_css_external(value(data['css_external']))
    # js related
    @JS           = get_js(data)
    @JSLIBRARY    = get_js_library(value(data['js_library']))
    @JS_MODERNIZR = get_js_modernizr(value(data['js_modernizr']))
    @JS_EXTERNAL  = get_js_external(value(data['js_external']))
    
    render_tpl()
  end
  
  private

  def value(value)
    value ||= ''
  end
  
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
    if css_starter == ''
      return ''
    elsif css_starter == 'normalize'
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
    (prefix == '') ? '' : '<script src="/box-libs/prefixfree.min.js"></script>'
  end
  
  def get_css_external(css_external)
    stylesheet = ''
    
    if css_external and css_external != ''
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
    
    if !js.nil? and js != ''
      script = "function __run() {\n"
      script+= js + "\n"
      script+= "}\n"
      script+= "__run();"
    else
      script = '<!-- no js -->'
    end
    
    return script
  end
  
  def get_js_library(js_library)
    if js_library == ''
      return ''
    elsif js_library == 'jquery'
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

    return '<script src="' + href + '"></script>'
  end
  
  def get_js_modernizr(js_modernizr)
    (js_modernizr == '') ? '' : '<script src="/js/libs/modernizr.js"></script>'
  end
  
  def get_js_external(js_external)
    script = ''
    
    if js_external and js_external != ''
      if !(js_external =~ URI::regexp).nil? and js_external[-2, 2] == 'js'
        script = '<script src="' + js_external + '"></script>'
      else
        script = '<!-- invalid external javascript file: ' + js_external + ' -->'
      end
    end
    
    script
  end
  
end
