require 'json'
require 'awesome_print'

class ZipService
  
  def zip(content)
    ap content
    
    # alextodo need ti figure out how to create subdirectories dynamically
    # need 2 things, the first is that we need to actually pull the data
    # for modernizr, prefix free, and what ever other js lib we use
    # then need to pull the style sheets
    # then will probably need a custom renderer for the zip files
    zippy = Zippy.new{ |zip|
      zip['README'] = get_readme(content)
      zip['index.html'] = get_result(content)
      zip['js/modernizr.js'] = 'example of what can be donw with modernizer'
    }.data
  end
  
  private
  
  def get_readme(content)
    'A Code Pen. You can find it at http://codepen.io/' + content['slug']
  end
  
  def get_result(content)
    rend = Renderer.new()
    rend.render_full_page(content)
  end
end
