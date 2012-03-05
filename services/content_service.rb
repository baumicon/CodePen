require './models/slug'
require './models/content'
require './models/user'
require './lib/json_util'
require './lib/ajax_util'

class ContentService
  include AjaxUtil

  def save_content(user, json)
    begin
      slugs = Slug.where(:uid => user.uid).all.map{|slug| slug.name}
      content = Content.new_from_json(json, user.uid, slugs)
      save(user, content, slugs)
    rescue Exception => ex
      #TODO: learn how to get a safe stack trace to display.  For now, generic message
      return errors({:unable_to_save => 'Error Saving From Persistance Service'})
    end
  end

  private

  def sequence_check(content)
    previous_content = Content.first(:order => :version.desc, :slug => content['slug'])
    return {:is_sequential => true} if previous_content.nil?
    return {:is_sequential => true} if content['version'] - previous_content['version'] == 1
    return {:is_sequential => false, :message => "Invalid Sequence.  Expected #{previous_content['version'] + 1}. Got #{content['version']}"}
  end

  def save(user, content, slugs)
      check = sequence_check(content)
      if not check[:is_sequential]
        return errors({:invalid_sequence => check[:message]})
      end

      if not slugs.include? content['slug']
        slug = Slug.new(:uid => user.uid, :name => content['slug'])
        return errors(slug.errors) unless slug.valid?
        slug.save
        content.slugs << slug.name
      end

      return errors(content.errors) unless content.valid?
      content.save
      success("slug" => content.slug)
  end

end
