require '../models/slug'
require '../models/content'
require '../models/user'
require '../lib/json_util'

class PersistanceService

  def save_content(session_id, json)
    user = User.get_by_session_id(session_id)
    slugs = Slug.where(:uid => user.uid).all.map{|slug| slug.name}
    content = Content.new_from_json(json, user.uid, slugs)

    return {'success' => true} unless not content.valid?
    begin
      content.save
    rescue
      #TODO: learn how to get a safe stack trace to display.  For now, generic message
      return {'success' => false, 'errors' => {:unable_to_save => 'get error stack'}}
    end
    {'success' => false, 'errors' => content.errors}
  end

end
