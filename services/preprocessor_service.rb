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
      css = node_req('/less/', 'css', css, 'LESS')
    elsif type == 'stylus'
      css = node_req('/stylus/', 'css', css, 'Stylus')
    elsif type == 'scss'
      begin
        # simple sass
        css = Sass::Engine.new(css, :syntax => :scss).render
      rescue Sass::SyntaxError => e
        @errors['SCSS'] = e.message
      end
    elsif type == 'sass'
      begin
        # sass with compass
        css = Sass::Engine.new(css, :syntax => :sass).render
      rescue Sass::SyntaxError => e
        @errors['SASS with Compass'] = e.message
      end
    end

    css
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
end
