require 'json'
require 'net/https'
require 'net/http'
require 'uri'
require './services/preprocessor_service'

GIST_URL = 'https://api.github.com/gists'

class GistService
  
  def create_gist(data, result)
    gist = get_gist(data, result)
    resp = post(gist)
    
    obj = JSON.parse(resp)
    obj['html_url']
  end
  
  private
  
  def post(gist)
    uri = URI.parse(GIST_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    
    req = Net::HTTP::Post.new(uri.request_uri)
    req["Content-Type"] = "application/json"
    req.body = gist
    res = http.request(req)
    
    res.body
  end
  
  # alextodo, what do we want to name these files?
  def get_gist(data, result)
    html_ext = get_ext(data['html_pre_processor'], 'html')
    css_ext = get_ext(data['css_pre_processor'], 'css')
    js_ext = get_ext(data['js_pre_processor'], 'js')
    
    gist = {
      'description' => 'A code snippet, created with Code Pen',
      'public'      => true,
      'files'       => {
        'index.' + html_ext => {
          'content' => data['html']
          },
        'style.' + css_ext => {
          'content' => get_css(data)
          },
        'index.' + js_ext => {
          'content' => data['js']
          },
        'fullpage.html' => {
          'content' => result
          }
        }
    }
    
    gist.to_json.gsub('/', '\/')
  end
  
  def get_css(data)
    css = data['css']
    
    if data['css_pre_processor'] == 'sass'
      # add imports we pulled from compass
      pps = PreProcessorService.new
      css = pps.get_compass_imports(css) + "\n" + css
    end
    
    css
  end
  
  def get_ext(type, default)
    if type == 'none' or type == ''
      return default
    else
      return type
    end
  end
  
end