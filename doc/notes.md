##Objects!

    User
        UserId
        Nickname
        Settings -> json

    Slugs
        Name
        UserId

    Content
        slug_id
        user_id
        version
        html
        css
        js
        html_preprocessor
        css_preprocessor
        js_preprocesor
        css_options
        js_options

##Callbacks

    save_content
    save_settings

##URLs:


`/`

return the latest content for logged in user
load the default user if nobody is logged in

`/save/content`

save content for logged in user or default user

`/slugs`

show all slugs for logged in user

`/content/:slug_name`

i thought this was for rendering the latest content at the different subdomain

`/auth/failure`

I will hit this when login does not work.  The post param of
