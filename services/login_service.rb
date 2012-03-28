require "./models/user_github"

class LoginService

  def login(user, auth_info)
    if user.anon?
      new_user = GithubUser.new(auth_info)
      Content.copy_ownership(user, new_user.uid)
      new_user
    else
      update_regular_user(user, auth_info)
    end
  end

  def update_regular_user(user, auth_info)
    if auth_info['nickname'] != user.nickname || auth_info['name'] != user.name
      user.nickname = auth_info['nickname']
      user.name = auth_info['name']
      user.save
      user
    end
  end

end
