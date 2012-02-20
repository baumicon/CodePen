require '../models/slug'
require '../models/content'
require '../models/user'
require '../lib/json_util'

class PersistanceService

  def save_content(session_id, json)
    begin
      user = User.get_by_session_id(session_id)
      slugs = Slug.where(:uid => user.uid).all.map{|slug| slug.name}
      content = Content.new_from_json(json, user.uid, slugs)

      if not slugs.include? content['slug_name']
        slug = Slug.new(:uid => user.uid, :name => content['slug_name'])
        return errors(slug.errors) unless slug.valid?
        slug.save
        content.slugs << slug.name
      end

      return errors(content.errors) unless content.valid?
      content.save
      {'success' => true}
    rescue Exception => ex
      throw ex
      #TODO: learn how to get a safe stack trace to display.  For now, generic message
      return errors({:unable_to_save => 'Error Saving From Persistance Service'})
    end
  end

  def errors(errors)
    {'success' => false, 'errors' => errors}
  end
end
