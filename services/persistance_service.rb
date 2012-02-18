require '../models/slug'
require '../models/content'
require '../lib/json_util'
require '../services/user_service'

class PersistanceService

  def save_content(session_id, json)
    user = UserService.new.user_by_session(session_id)
    slugs = Slug.where(:uid => user.uid).all.map{|slug| slug.name}
    content = Content.new_from_json(json, user.uid, slugs)
    return {'success' => true} unless not content.valid?

    require 'awesome_print'
    ap content.errors.messages

    begin
      content.save
    rescue
      #TODO: learn how to get a safe stack trace to display.  For now, generic message
      return {'success' => false, 'errors' => {:unable_to_save => 'get error stack'}}
    end
    {'success' => false, 'errors' => content.errors}
  end

end
