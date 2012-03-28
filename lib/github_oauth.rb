require 'httparty'

class GithubOAuth

  def initialize(client_id, client_secret, domain, callback='/auth/github/callback')
    @client_id = client_id
    @client_secret = client_secret
    @domain = domain
    @callback = callback
  end

  def url_auth
    'https://github.com/login/oauth/authorize?' +
      "client_id=#{@client_id}&" +
      "redirect_url=#{@domain}#{@callback}"
  end

  def url_token(code)
    '/login/oauth/access_token?' +
      "client_id=#{@client_id}&" +
      "redirect_uri=#{@domain}#{@callback}&" +
      "client_secret=#{@client_secret}&" +
      'code='+code
  end

  def url_user(token)
    "/user?access_token=#{token}"
  end

  def authorize(code)
    ap "getting token"
    response = validate_response(Authorize.post(url_token(code)))
    parsed_response = CGI.parse(response)
    access_token = parsed_response['access_token'][0]
    ap "getting api info"
    user_hash = validate_response(Api.get(url_user(access_token)))
    user_hash['token'] = access_token
    user_hash
  end

  def validate_response(response)
    ap response
    return response if response.code == 200
    raise GithubUnauthorizedException if response.code == 403
    raise GithubOAuthErrorExcption
  end

  private

  class Authorize
    include HTTParty
    base_uri 'https://github.com'
  end

  class Api
    include HTTParty
    base_uri 'https://api.github.com'
  end

  class GithubOAuthErrorExcption < Exception
  end

  class GithubUnauthorizedException < Exception
  end
end
