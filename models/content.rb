require 'mongo_mapper'
require './lib/ajax_util'

class Content
  extend AjaxUtil
  include MongoMapper::Document

  attr_accessible :uid, :slug, :version, :html, :css, :js, :html_pre_processor, :css_pre_processor, :js_pre_processor, :anon
  attr_accessor :slugs

  validate :validate_slug_owned
  #validate :validate_version_is_positive

  #Foreign Keys
  key :uid, String, :required => true
  key :slug, String, :required => true

  key :version, Integer, :required => true
  key :anon, Boolean, :default => false
  key :html, String
  key :css, String
  key :js, String
  key :html_pre_processor, String
  key :css_pre_processor, String
  key :js_pre_procesor, String

  timestamps!

  def self.new_from_json(json, uid, slugs_by_user, anon = false)

    payload = JSON.parse(json)
    payload['uid'] = uid
    payload['anon'] = anon
    content = Content.new(payload)
    content.slugs = slugs_by_user
    content.slug = uid if anon
    content
  end

  def self.latest(slug)
    begin
      content = Content.first(:order => :version.desc, :slug => slug)
      return success(content.attributes) if content
      return errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return errors({:get_latest => "Error getting most recent content for '#{slug}'."})
    end
  end

  def self.version(slug, version)
    begin
      content = Content.first(:order => :version.desc, :slug => slug, :version => version)
      return success(content.attributes) if content
      return errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return errors({:get_latest => "Error getting most recent content for '#{slug}'."})
    end
  end

  def self.copy_ownership(user, new_uid)
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
      content.anon = false
      content.slugs = slug_arr
      content.save
    }
  end

  private

  def validate_slug_saveable
    errors.add(:slug_not_owned, "You must own a slug to save to it") if anon and Content.where(:slug => @slug, :uid.nin => @uid)

  end

  def validate_version_is_positive
    errors.add(:version_not_positive, "version must be positive") unless @version > -1
  end
end
