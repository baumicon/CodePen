uuid flow

    Any Page Load
        session?
            session[:uid]?
                @user = User.find(:uid)
            else
                @user = User.find(:uuid)
        else
            session[:uuid] = UUID.new
            @user = User.new

    Save
        session[:uuid]?
            @user = User.find_or_create(:uuid)
            Content.save(content, @user)
        else
            # i think instead of just else you should check for uid like this
            # it'll be another layer of protection from bots and automated creation
            #elsif session[:uid]?
            @user = User.find(:uid)
            Content.save(content, @user)

    Login
        session[:uuid]?
            content = Content.find_by_uuid?
                slugs = slug.find_by_uuid(:uuid)
                User.find_or_create(:uuid, :uid_from_omniauth)
                content.update_user(:uid)
                slugs.update_user(:uid)
            session.remove[:uuid]
            @user = User.new(:uid_from_omniauth).save
            session[:uuid] = @user.uid
        else
            @user = User.new(:uid_from_omniauth).save


