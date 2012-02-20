require 'json'
require 'net/https'
require 'net/http'
require 'uri'

GIST_URL = 'https://api.github.com/gists'

class GistService
  
  def create_gist(data, result)
    html_ext = get_ext(data['html_pre_processor'], 'html')
    css_ext = get_ext(data['css_pre_processor'], 'css')
    js_ext = get_ext(data['js_pre_processor'], 'js')
    
    data = get_data(data['html'], data['css'], data['js'], html_ext, css_ext, js_ext, result)
    resp = post(data)
    
    obj = JSON.parse(resp)
    obj['html_url']
  end
  
  private
  
  def get_ext(type, default)
    if type == 'none' or type == ''
      return default
    else
      return type
    end
  end
  
  def post(data)
    uri = URI.parse(GIST_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    req = Net::HTTP::Post.new(uri.request_uri)
    req["Content-Type"] = "application/json"
    req.body = data
    res = http.request(req)
    
    res.body
  end
  
  # alextodo, what do we want to name these files?
  def get_data(html, css, js, html_ext, css_ext, js_ext, result)
    data = {
      'description' => 'A code snippet, created with Code Pen',
      'public'      => true,
      'files'       => {
        'index.' + html_ext => {
          'content' => html
          },
        'style.' + css_ext  => {
          'content' => css
          },
        'index.' + js_ext   => {
          'content' => js
          },
        'fullpage.html' => {
          'content' => result
          }
        }
    }
    
    data.to_json.gsub('/', '\/')
  end
  
end