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
    path.gsub('//', '/')
  end
end

class Minify
  
  # determine if we should minify the JS
  @minify = false
  @project_path = ''
  
  @version = -1
  
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
    clean_path(PRODJS_DIR + '/' + get_version() + '/' + prod_filename + '.js')
  end
  
  def get_version
    path = clean_path(@project_path + PUBLIC_DIR + PRODJS_DIR)
    version = File.read(path + VERSION_FILE)
    version.to_s
  end
  
end

class MinifyProject
  
  # COMPRESS JS FOR PRODUCTION
  @tpl_path
  @js_path
  @prodjs_path
  
  @version
  
  # a filepath to prod js file name hash
  @prod_file_names
  
  include PathUtil
  
  def initialize(tpl_path, js_path, prodjs_path)
    @tpl_path = clean_path(tpl_path)
    @js_path = clean_path(js_path)
    @prodjs_path = clean_path(prodjs_path)
    @prod_file_names = Hash.new
  end
  
  def minify_all_js_files
    # Find all the js_script filters embedded in template files.
    # Find the scripts in the js folder and minify them into a single js file
    # named after the template they were created for.
    # 
    # For example the template home_page.html with the following filter:
    #     <%= js_scripts(['/js/jquery.js', '/js/home.js'] %>
    #     
    # Will create a production file named:
    #     /prodjs/version/home_page.js
    #     
    # The version number is stored in the /prodjs/version.txt file.
    load_minify_attributes
    prep_directory
    
    files = index_project_files
    filenames_to_scripts = get_filename_to_scripts(files)
    
    filenames_to_scripts.each do |filename, scripts|
      minify_page_scripts(filename, scripts)
    end
    
    write_version_file
    clean_up_directory
  end
  
  private
  
  # Private: Load version numbers used for the rest of the process
  #
  def load_minify_attributes
    # use unix timestamp a version
    @version = Time.now.to_i.to_s
    @new_js_dir = clean_path(@prodjs_path + '/' + @version)
  end
  
  def prep_directory
    # Make the new version directory
    FileUtils.makedirs @new_js_dir
  end
  
  def write_version_file
    # Make the /prodjs/version.txt file and save current unix timestamp
    version_file = File.new(clean_path(@prodjs_path + '/' + VERSION_FILE), 'w')
    version_file.write(@version)
    version_file.close()
  end
  
  # Private: Delete the old directory with old production files
  def clean_up_directory
    dirs = Dir.glob(@prodjs_path + '**')
    
    dirs.each do |d|
      save_dir = clean_path(@prodjs_path + '/' + @version)
      
      if File.directory?(d) and save_dir != clean_path(d)
        FileUtils.remove_dir d
      end
    end
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
    #     ex. (['/js/jquery.js', '/js/bootstrap-dropdown.js', '/js/doula.js'], 'prodfilename')
    js_scripts = ''
    contents = get_clean_contents(path_to_file)
    
    # the first back ref is to the js files, the second is to the file name
    # ignore for now
    contents.scan(/js_scripts\(\[(.*)\],\s?'([\w\d]+)'/) do |match|
      if $1
        js_scripts = $1
        # store the path to file as key to the future prod file name
        @prod_file_names[path_to_file] = $2
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
  
  # Private: Minify all the scripts found in a single file
  #   write those files to the production directory
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
      if !script.strip().empty?
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
  
  # Private: Return the production js file name
  #   Name of file is the second argument passed to js_scripts
  #   Checks to see if the filename already has the .js extension
  def get_prod_filename(filename)
    prod_filename = @prod_file_names[filename]
    
    if !prod_filename.end_with?('.js')
      prod_filename += '.js'
    end
    
    prod_filename
  end
  
  def create_prod_file(prod_filename, minified_js)
    # Actually write the minified files
    prod_file_path = clean_path(@new_js_dir + '/' + prod_filename)
        
    prod_file = File.new(prod_file_path, 'w')
    prod_file.write(minified_js)
    prod_file.close()
  end
  
end

if __FILE__ == $0
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