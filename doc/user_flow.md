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
            @user = User.find(:uid)
            Content.save(content, @user)

    Login
        uuid?
            content = Content.find_by_uuid?
                slugs = slug.find_by_uuid(:uuid)
                User.find_or_create(:uuid, :uid_from_omniauth)
                content.update_user(:uid)
                slugs.update_user(:uid)
            session.remove[:uuid]
            @user = User.new(:uid_from_omniauth).save
        else
            User.new(:uid_from_omniauth).save


