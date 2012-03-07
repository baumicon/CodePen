require 'mongo_mapper'
require './models/incrementor'
require './lib/ajax_util'

class Content
  extend AjaxUtil
  include MongoMapper::Document

  attr_accessible :uid, :slug, :version, :html, :css, :js, :html_pre_processor, :css_pre_processor, :js_pre_processor, :anon
  attr_accessor :slugs

  before_validation :before_validation_on_create, :on => :create
  validate :validate_slug_saveable

  # callback keys
  key :uid, String, :required => true
  key :slug, String, :default => nil
  key :version, Integer, :default => 0

  key :anon, Boolean, :default => false
  key :html, String
  key :css, String
  key :js, String
  key :html_pre_processor, String
  key :css_pre_processor, String
  key :js_pre_procesor, String

  timestamps!

  def self.new_from_json(json, uid, anon = false)
    payload = JSON.parse(json)
    payload['uid'] = uid
    payload['anon'] = anon
    Content.new(payload)
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

  def before_validation_on_create
    anon_prevalidate if @anon
  end

  def anon_prevalidate
    @version = 1 if @slug.nil?
    @slug = Incrementor.next_count('anon_slug_integer') if @slug.nil?
  end

  def validate_slug_saveable
    anon_validate       if @anon
    errors.add(:version_not_positive, "Version must be positive") unless @version > -1
  end

  def anon_validate
    opp = Content.first(:slug => @slug, :anon => true)
    errors.add(:slug_taken, "That slug is already owned") if opp
  end

end
