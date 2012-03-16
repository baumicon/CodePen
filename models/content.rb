require 'mongo_mapper'
require './models/incrementor'
require './models/slug'
require './lib/ajax_util'

class Content
  extend AjaxUtil
  include AjaxUtil
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
    payload['slug'] = nil if payload['slug'] == ''
    Content.new(payload)
  end

  def self.latest(slug)
    begin
      content = Content.first(:order => :version.desc, :slug => slug)
      return self.json_success(content.attributes) if content
      return self.json_errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return json_errors({:get_latest => "Error getting most recent content for '#{slug}'."})
    end
  end

  def self.version(slug, version)
    begin
      content = Content.first(:order => :version.desc, :slug => slug, :version => version)
      return self.json_success(content.attributes) if content
      return self.json_errors({:no_conent_for_slug => "Can't find content for slug name '#{slug}'"})
    rescue Exception => ex
      return json_errors({:get_latest => "Error getting most recent content for '#{slug}'."})
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
      ap self
      #TODO: whitelist output
      return json_success(self.attributes)
    end
    return json_errors(self.errors.messages)
  end

  private

  def before_validation_on_create
    @version = 1 if @slug.nil?
    anon_prevalidate if @anon
    authed_prevalidate if not @anon
  end

  def authed_prevalidate
    @slug = Incrementor.next_count("slug_integer_authed_#{@uid}") if @slug.nil?
  end

  def anon_prevalidate
    @slug = Incrementor.next_count('slug_integer_anon') if @slug.nil?
  end

  def validate_slug_saveable
    anon_validate if @anon
    # TODO: Sequence Check
    #check = sequence_check
    #errors.add(:invalid_sequence, check[:message]) if not check[:is_sequential]
    if not @version.to_s.match(/^\b\d+\b$/)
      errors.add(:version_not_positive, "Version must be positive integer")
    end
  end

  def anon_validate
    if not @slug.to_s.match(/^\b\d+\b$/)
      errors.add(:wrong_type, "Slugs must be integers when user type is Anon")
      return
    end
    errors.add(:slug_taken, "That slug is already owned") if Content.first(:slug => @slug, :anon => true)
  end

  def sequence_check
    previous_content = Content.first(:order => :version.desc, :slug => @slug)
    return {:is_sequential => true} if previous_content.nil?
    return {:is_sequential => true} if @version - previous_content['version'] == 1
    return {:is_sequential => false, :message => "Invalid Sequence.  Expected #{previous_content['version'] + 1}. Got #{content['version']}"}
  end


end
