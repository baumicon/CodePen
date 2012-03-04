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
    rescue Exception => ex
      #TODO: learn how to get a safe stack trace to display.  For now, generic message
      return errors({:unable_to_save => 'Error Saving From Persistance Service'})
    end
  end

  def latest(slug, uid = nil)
    begin
      if uid
        content = Content.first(:order => :version.desc, :slug => slug, :uid => uid.to_s)
      else
        content = Content.first(:order => :version.desc, :slug => slug)
      end
      return success(content.attributes) if content
      return errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return errors({:get_latest => "Error getting most recent content for '#{slug}'."})
    end
  end

  def copy_ownership(user, new_uid)
    slugs = Slug.all(:uid => user.uid)
    slugs.each{|s|
      slug = Slug.new(s.attributes)
      slug.uid = new_uid
      slug.save
    }
    slug_arr = slugs.map{|slug| slug.name}
    Content.all(:uid => user.uid).each{|c|
      content = Content.new(c.attributes)
      content.uid = new_uid
      content.slugs = slug_arr
      content.save
    }
  end

  private

  def sequence_check(content)
    previous_content = Content.first(:order => :version.desc, :slug => content['slug'])
    return {:is_sequential => true} if previous_content.nil?
    return {:is_sequential => true} if content['version'] - previous_content['version'] == 1
    return {:is_sequential => false, :message => "Invalid Sequence.  Expected #{previous_content['version'] + 1}. Got #{content['version']}"}
  end
end
