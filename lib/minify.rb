require 'find'
require 'jsmin'
require 'fileutils'
require 'time'

SERVE_FILES_FROM_URL = ''
GROUPED_FILES = ''

# relavtive path to public dir
PUBLIC_DIR = '/public/'

# path to dir where JS files live, relative to public dir
JS_DIR = '/js/'

# path to where production js file will live, relative to public dir
PRODJS_DIR = '/prodjs/'

# name of version file
VERSION_FILE = 'version.txt'

module PathUtil
  def clean_path(path)
    path.sub('//', '/')
  end
end

class Minify
  
  # determine if we should minify the JS
  @minify = false
  @project_path = ''
  
  @@version = -1
  
  include PathUtil
  
  def initialize(minify, project_path)
    @minify = minify
    @project_path = project_path
  end
  
  # Prints the <script> tags according to minify and combine level
  def script_tags(scripts, prod_filename)
    script_tags = ''
    
    if @minify
      src = get_src_to_prodjs(scripts, prod_filename)
      script_tags = '<script src="' + src + '"></script>'
    else
      # for non minified files
      scripts.length.times do |i|
        script_tags += '<script src="' + scripts[i] + '"></script>'
        script_tags += "\n\t"
      end
    end
    
    script_tags
  end
  
  def get_src_to_prodjs(scripts, prod_filename)
    clean_path(PRODJS_DIR + prod_filename + '.' + get_version() + '.js')
  end
  
  def get_version
    if @@version == -1
      path = clean_path(@project_path + PUBLIC_DIR + PRODJS_DIR)
      @@version = File.read(path + VERSION_FILE)
      @@version = @@version.to_s
    end
    
    @@version
  end
  
end

class MinifyProject
  
  # COMPRESS JS FOR PRODUCTION
  @tpl_path
  @js_path
  @prodjs_path
  
  include PathUtil
  
  def initialize(tpl_path, js_path, prodjs_path)
    @tpl_path = clean_path(tpl_path)
    @js_path = clean_path(js_path)
    @prodjs_path = clean_path(prodjs_path)
  end
  
  def minify_all_js_files
    # Find all the js_script filters embedded in template files.
    # Find the scripts in the js folder and minify them into a single js file
    # named after the template they were created for.
    # 
    # For example the template home_page.html with the following filter:
    #     {{ ['/js/jquery.js', '/js/home.js']|js_script|safe }}
    #     
    # Will create a production file named:
    #     /prodjs/home_page.[version].js
    #     
    # The version number is stored in the /prodjs/version.txt file.
    
    prep_prodjs_dir()
    
    files = index_project_files()
    filenames_to_scripts = get_filename_to_scripts(files)
    
    filenames_to_scripts.each do |filename, scripts|
      minify_page_scripts(filename, scripts)
    end
  end
  
  private
  
  def prep_prodjs_dir
    # Prepare the /prodjs/ directory for minification
    # Remove all the files in this directory
    if File.directory?(@prodjs_path)
      puts 'removing directory: !'
      FileUtils.remove_dir @prodjs_path
    end
    
    puts 'makding dirs: ' + @prodjs_path
    # Make sure the prod js dir exists
    FileUtils.makedirs @prodjs_path
    
    # use unix timestamp a version
    @@version = Time.now.to_i.to_s
    
    # Make the /prodjs/version.txt file and save current unix timestamp
    version_file = File.new(clean_path(@prodjs_path + '/' + VERSION_FILE), 'w')
    version_file.write(@@version)
    version_file.close()
  end
  
  def index_project_files
    glob = Dir[@tpl_path + '**/**']
    files = [ ]
    
    glob.each do |f|
      if File.file?(f)
        files.push(f)
      end
    end
    
    files
  end
  
  def get_filename_to_scripts(files)
    # Roll through the project files and find the scripts.
    # Add to the dict, with format:
    #     { filename: [list_of_js_files] }
    
    filenames_to_scripts = { }
    
    files.each do |f|
      js_scripts = find_js_scripts(f)
      
      if !js_scripts.empty?
        filenames_to_scripts[f] = js_scripts
      end
    end
    
    filenames_to_scripts
  end
  
  def find_js_scripts(path_to_file)
    # Find the js_scripts embedded in our templates
    #     ex. ['/js/jquery.js', '/js/bootstrap-dropdown.js', '/js/doula.js']
    js_scripts = ''
    contents = get_clean_contents(path_to_file)
    
    # the first back ref is to the js files, the second is to the file name
    # ignore for now
    contents.scan(/js_scripts\(\[(.*)\],\s?'([\w\d]+)'/) do |match|
      if $1
        js_scripts = $1
      end
    end
    
    js_scripts
  end
  
  def get_clean_contents(path_to_file)
    # Read the contents of the file into a single string.
    # Replace all new line characters with a space so that
    # we can run regex on the entire file as a single string
    contents = File.read(path_to_file)
    contents.gsub(/\s+/, ' ')
  end
  
  def minify_page_scripts(filename, scripts)
    scripts = get_cleaned_scripts(scripts)
    minified_js = get_minified_js(scripts)
    prod_filename = get_prod_filename(filename)
    
    create_prod_file(prod_filename, minified_js)
  end
  
  def get_cleaned_scripts(scripts)
    # Return string '/js/jquery.js', '/js/home.js'
    # as list of individual strings split by commas
    cleaned_scripts = [ ]
    scripts_list = scripts.split(',')
    
    scripts_list.each do |script|
      if !script.empty?
        clean_script = script.gsub('"', '').gsub!("'", "").strip()
        cleaned_scripts.push(clean_script)
      end
    end
    
    cleaned_scripts
  end
  
  def get_minified_js(js_files)
    # Minify js files in the list as a single file.
    # Roll through the js_files, read their contents,
    # put them into a single string for writing
    
    minified_js = ''
    
    for js_file in js_files
      js_file_path = clean_path(@js_path + js_file.sub('/js', ''))
      js_contents = File.read(js_file_path)
      
      minified_js += JSMin.minify(js_contents)
    end
    
    minified_js
  end
  
  def get_prod_filename(filename)
    # Return the production file name:
    #     Format template_name.version.js
    rel = filename.sub(@tpl_path, '')
    prod_file = File.basename(rel, ".erb")
    
    prod_file + '.' + @@version + '.js'
  end
  
  def create_prod_file(prod_filename, minified_js)
    # Actually write the minified files
    prod_file_path = clean_path(@prodjs_path + '/' + prod_filename)
    # Make sure the prod js dir exists
    prod_dir = File.dirname(prod_file_path)
    
    if !File.directory?(prod_dir)
      FileUtils.makedirs prod_dir
    end
    
    prod_file = File.new(prod_file_path, 'w')
    prod_file.write(minified_js)
    prod_file.close()
  end
  
  
  # FROM OLD COMPRESSION
  
  def compress_js(scripts)
    path_to_prod_file = get_path_to_prodjs_file(scripts)
    
    if not File.exists?(path_to_prod_file)
      # file does not exists, minify the scripts,
      # create the new prod file
      
      minifiedJS = ''
      
      # Roll through files minify them, save result to
      # single string,  then write to file
      scripts.length.times do |i|
        js_file = @project_path + PUBLIC_DIR + scripts[i]
        
        file = File.open(js_file, "rb")
        minifiedJS += JSMin.minify(file.read)
      end
      
      # Create the production JS file
      open(path_to_prod_file, 'w') do |f|
        f.puts minifiedJS
      end
    end
  end
  
end

if __FILE__ == $0
  put'RUNNINGINGNGN'
  if File.directory?(ARGV[0])
    tpl_path    = ARGV[0] + '/views/'
    js_path     = ARGV[0] + PUBLIC_DIR + JS_DIR
    prodjs_path = ARGV[0] + PUBLIC_DIR + PRODJS_DIR
    
    mp = MinifyProject.new(tpl_path, js_path, prodjs_path)
    mp.minify_all_js_files()
    
    puts 'Done minifing JS!'
  else
    puts ARGV[0] + ' is not a directory. Cannot find Javascript.'
  end
end