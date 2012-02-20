require_relative 'services/preprocessor_service.rb'

class Renderer
  @pps
  
  def initialize()
    @pps = PreProcessorService.new
  end
  
  def get_html(html, html_pre_processor)
    if html_pre_processor == 'jade'
      return html
    elsif html_pre_processor == 'haml'
      return html
    else
      return html
    end
  end
  
  def get_css(css, css_pre_processor)
    if css_pre_processor == 'jade'
      return css
    elsif css_pre_processor == 'haml'
      return css
    else
      return css
    end
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
  
  def get_js(js, js_pre_processor)
    if js_pre_processor == 'jade'
      return js
    elsif js_pre_processor == 'haml'
      return js
    else
      return js
    end
  end
  
  def get_jslib(jslib)
    if jslib == 'jquery-latest'
        return '<script src="http://code.jquery.com/jquery-latest.js"></script>'
    elsif jslib == 'mootools'
        href = '//ajax.googleapis.com/ajax/libs/mootools/1.4.1/mootools-yui-compressed.js'
        return '<script src="' + href + '"></script>'
    elsif jslib == 'prototype'
        href = '//ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js'
        return '<script src="' + href + '"></script>'
    end
  end
  
end
