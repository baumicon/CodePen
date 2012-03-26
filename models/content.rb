require 'mongo_mapper'
require './models/incrementor'
require './models/slug'
require './lib/ajax_util'
require 'awesome_print'

class Content
  extend AjaxUtil
  include AjaxUtil
  include MongoMapper::Document

  @owned_by_current_user = false

  attr_accessible :uid, :slug, :version, :html, :css, :js, 
    :html_pre_processor, :css_pre_processor, :js_pre_processor, :anon,
    :html_classes, :css_starter, :css_prefix_free, :css_prefix_free,
    :css_external, :js_library, :js_modernizr, :js_external

  attr_accessor :owned_by_current_user

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
      # content = load_from_cache(slug)
      # content = Content.first(:order => :version.desc, :slug => "#{slug}") if content.nil?
      content = Content.first(:order => :version.desc, :slug => "#{slug}")
      return hash_success(content.attributes) if content
      return hash_errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return hash_errors({:get_latest => "Error getting most recent content for '#{slug}'."})
    end
  end

  def self.version(slug, version)
    begin
      return json_errors({:version_must_be_int => "Version must be an int"}) if not /^\d+$/.match("#{version}")
      # content = load_from_cache(slug, version)
      # content = Content.last(:order => :version.desc, :slug => "#{slug}", :version => Integer(version)) if content.nil?
      content = Content.last(:order => :version.desc, :slug => "#{slug}", :version => Integer(version))
      
      return self.hash_success(content.attributes) if content
      return self.hash_errors({:no_conent_for_slug => "Can't find content. Slug:#{slug} Version:#{version}"})
    rescue Exception => ex
      return self.hash_errors({:get_latest => "Error getting most recent content. Slug:#{slug} Version:#{version}"})
    end
  end

  def fork(user)
    begin
      content = Content.new(self.attributes)
      content.uid = user.uid
      content.anon = user.anon?
      
      if user.anon?
        content.slug = Incrementor.next_count("slug_next_anon")
      else
        if Content.first(:uid => uid, :slug => @slug)
          content.slug = Incrementor.next_count("slug_next_#{user.uid}")
        end
      end
      
      content.version = 1
      content.save
      # alextodo, see if we can cache
      # see why this doesn't work
      # self.class.cache content
      
      content
    end
  end

  def self.copy_ownership(user, new_uid)
    Content.all(:uid => user.uid).each{|c|
      content = Content.new(c.attributes)
      content.uid = new_uid
      content.anon = false
      content.save
      cache content
    }
  end

  def json_save
    if self.valid?
      self.save
      self.class.cache self
      
      #TODO: whitelist output
      return json_success(self.attributes)
    end
    
    json_errors(self.errors.messages)
  end

  private
  
  def self.load_from_cache(slug, version=0)
    key = 'slug:' + slug.to_s
    
    if version.to_i > 0
      key += ':version:' + version.to_s
    end
    
    content = $redis.get(key)
    content = JSON.parse(content) if !content.nil?
    
    content
  end
  
  # Cache the content with the $redis global value
  # Save content under slug and version and slug only. 
  # Because we know the last version of a slug saved is always the 
  # latest (because we don't do any overwrites). We can always look up
  # the latest by slug only as well as by slug and version.
  def self.cache(content)
    key = 'slug:' + content.slug.to_s + ':version:' + content.version.to_s
    $redis.set(key, content.to_json)
    
    key = 'slug:' + content.slug.to_s
    $redis.set(key, content.to_json)
  end

  def before_validation_on_create
    anon_prevalidate if @anon
    authed_prevalidate if not @anon
  end

  def authed_prevalidate
    @slug = Incrementor.next_count("slug_next_#{@uid}") if @slug.nil? || "#{@slug}".match(/^$/)
  end

  def anon_prevalidate
    @slug = Incrementor.next_count("slug_next_anon") if @slug.nil? || "#{@slug}".match(/^$/)
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
