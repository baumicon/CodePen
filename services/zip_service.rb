require 'json'
require 'awesome_print'

class ZipService
  
  def zip(content)
    zip_hash = { }
    zip_hash['README'] = get_readme(content)
    zip_hash['index.html'] = get_result(content)
    
    load_css_starter(content['css_starter'], zip_hash)
    load_prefix(content['css_prefix_free'], zip_hash)
    load_modernizr(content['js_modernizr'], zip_hash)
    
    zip_it_up_and_zip_it_out(zip_hash)
  end
  
  private
  
  def zip_it_up_and_zip_it_out(zip_hash)
    zippy = Zippy.new { |zip|
      zip_hash.each { |name, value|
        zip[name] = value
      }
    }.data
  end
  
  def load_css_starter(css_starter, hash)
    if css_starter == 'normalize'
      hash['css/normalize.css'] = get_file_contents('./public/stylesheets/css/normalize.css')
    elsif css_starter == 'reset'
      hash['css/reset.css'] = get_file_contents('./public/stylesheets/css/reset.css')
    end
  end
  
  def load_prefix(prefix, hash)
    if prefix != '' and !prefix.nil?
      hash['js/prefixfree.min.js'] = get_file_contents('./public/js/libs/prefixfree.min.js')
    end
  end
  
  def load_modernizr(js_modernizr, hash)
    if js_modernizr != '' and !js_modernizr.nil?
      hash['js/modernizr.js'] = get_file_contents('./public/js/libs/modernizr.js')
    end
  end
  
  def get_file_contents(path)
    key = 'zipfile:' + path
    contents = $redis.get(key)
    
    if !contents
      contents = File.read(path)
      $redis.set(key, contents)
    end
    
    contents
  end
  
  def get_readme(content)
    'A Code Pen. You can find it at http://codepen.io/' + content['slug']
  end
  
  def get_result(content)
    rend = Renderer.new()
    rend.render_download_page(content)
  end
end
