uuid flow

An anon user is represented with the base `User` class.

When a user logs in with omniauth, the user becomes a
`<login_type>User` instead of the base `User` class.

If the anon user has a session and content when they
log in, any content or slugs they created with that
anon uuid becomes the property of the logged in user.

    Any Page Load
        session[:uid]?
            @user = User.find(:uid)
        else
            session[:uid] = uuid = UUID.new
            @user = User.new(:uid => uuid)

    Save
        # saving is a snap, because we just use whatever user is in session
        Content.save(content, @user)

    Login
        if @user && @user[_type] == <the base User type>
            @new_user = User.new(from_onmiauth)
            content = Content.find_by_uid(@user.id)?
                slugs = slug.find_by_uid(@user.id)
                content.update_user(@new_user.uid)
                slugs.update_user(@new_user.uid)
            @user.delete
            @user = @new_user
        else
            @user = User.find_or_new(omniauth_stuff).save

        session[:uid] = @user.uid
