require 'mongo_mapper'
require './models/incrementor'
require './models/slug'
require './lib/ajax_util'

class Content
  extend AjaxUtil
  include AjaxUtil
  include MongoMapper::Document

  attr_accessible :uid, :slug, :version, :html, :css, :js, 
    :html_pre_processor, :css_pre_processor, :js_pre_processor, :anon,
    :html_classes, :css_starter, :css_prefix_free, :css_prefix_free,
    :css_external, :js_library, :js_modernizr, :js_external

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
    content = JSON.parse(json)
    content['uid'] = uid
    content['anon'] = anon
    content['slug'] = nil if content['slug'] == ''
    Content.new(content)
  end

  def self.latest(slug)
    begin
      #convert to string
      content = Content.first(:order => :version.desc, :slug => "#{slug}")
      return self.json_success(content.attributes) if content
      return self.json_errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return json_errors({:get_latest => "Error getting most recent content for '#{slug}'."})
    end
  end

  def self.version(slug, version)
    begin
      #convert to string
      return json_errors({:version_must_be_int => "Version must be an int"}) if not /^\d+$/.match("#{version}")
      content = Content.last(:order => :version.desc, :slug => "#{slug}", :version => Integer(version))
      return self.json_success(content.attributes) if content
      return self.json_errors({:no_conent_for_slug => "Can't find content. Slug:#{slug} Version:#{version}"})
    rescue Exception => ex
      return json_errors({:get_latest => "Error getting most recent content. Slug:#{slug} Version:#{version}"})
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

  def json_save
    if self.valid?
      self.save
      #TODO: whitelist output
      return json_success(self.attributes)
    end
    return json_errors(self.errors.messages)
  end

  private

  def before_validation_on_create
    anon_prevalidate if @anon
    authed_prevalidate if not @anon
  end

  def authed_prevalidate
    set_slug("auth_next")
  end

  def anon_prevalidate
    set_slug("anon_next")
  end

  def set_slug(incrementor_name)
    @slug = Incrementor.next_count("#{incrementor_name}_#{@uid}") if @slug.nil? || "#{@slug}".match(/^$/)
  end

  def validate_slug_saveable
    anon_validate if @anon
    @version = next_version
  end

  def next_version
    content = Content.first(:uid => @uid, :slug => @slug, :order => :updated_at.desc)
    return content.version + 1 if content
    return 1
  end

  def anon_validate
    if not @slug.to_s.match(/^\b\d+\b$/)
      errors.add(:wrong_type, "Slugs must be integers when not logged in")
      return
    end
    errors.add(:slug_taken, "That slug is already owned") if Content.first(:slug => @slug, :anon => true, :uid.ne => @uid)
  end

  def sequence_check
    previous_content = Content.first(:order => :version.desc, :slug => @slug)
    return {:is_sequential => true} if previous_content.nil?
    return {:is_sequential => true} if @version - previous_content['version'] == 1
    return {:is_sequential => false, :message => "Invalid Sequence.  Expected #{previous_content['version'] + 1}. Got #{content['version']}"}
  end

end
