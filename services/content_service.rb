require '../models/slug'
require '../models/content'
require '../models/user'
require '../lib/json_util'
require '../lib/ajax_util'

class ContentService
  include AjaxUtil

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
      success
    rescue Exception => ex
      #TODO: learn how to get a safe stack trace to display.  For now, generic message
      return errors({:unable_to_save => 'Error Saving From Persistance Service'})
    end
  end

  def get_latest(slug_name)
    begin
      content = Content.first(:order => :created_at.desc, :slug_name => slug_name).attribute
      content['t_obj_type'] = 'content'
      success content
    rescue Exception => ex
      require 'awesome_print'; ap ex
      return errors({:get_latest => "Error getting most recent content for '#{slug_name}'."})
    end
  end
end
