require 'net/http'
require 'haml'
require 'sass'
require 'compass'

NODE_URL = 'http://127.0.0.1:8124'

class PreProcessorService
  
  def process_html(type, html)
    begin
      if type == 'jade'
        uri = URI(NODE_URL + '/jade/')
        res = Net::HTTP.post_form(uri, 'html' => html)
        html = res.body
      elsif type == 'haml'
        html = Haml::Engine.new(html).render
      end
    rescue Exception => msg
      puts 'Unable to process HTML: ' + msg
    end

    html
  end

  def process_css(type, css)
    begin
      if type == 'less'
        uri = URI(NODE_URL + '/less/')
        res = Net::HTTP.post_form(uri, 'css' => css)
        css = res.body
      elsif type == 'stylus'
        uri = URI(NODE_URL + '/stylus/')
        res = Net::HTTP.post_form(uri, 'css' => css)
        css = res.body
      elsif type == 'scss'
        # just simple sass
        css = Sass::Engine.new(css, :syntax => :scss).render
      elsif type == 'sass'
        # compass with sass
        css = Sass::Engine.new(css).render
      end
    rescue Exception => msg
      puts 'Unable to process CSS: ' + msg
    end
    
    css
  end
  
  def process_js(type, js)
    begin
      if type == 'coffeescript'
        uri = URI(NODE_URL + '/coffeescript/')
        res = Net::HTTP.post_form(uri, 'js' => js)
        js = res.body
      end
    rescue Exception => msg
      puts 'Unable to process JS: ' + msg
    end
    
    js
  end
  
end