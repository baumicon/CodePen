require 'jsmin'

class Minify
    
    # determine if we should minify the JS
    MINIFY = true
    
    # relavtive path to public dir
    PUBLIC_DIR = '/public/'
    
    # path to dir where JS files live, relative to public dir
    ORIGIN_DIR = '/js/'
    
    # path to where production js file will live, relative to public dir
    DEST_DIR = '/prodjs/'
    
    SERVE_FILES_FROM_URL = ''
    GROUPED_FILES = ''
    
    # Prints the <script> tags according to minify and combine level
    def script_tags(scripts)
      script_tags = ''
      
      if MINIFY == true
        self.compress_js(scripts)
        src = get_src_to_prodjs(scripts)
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
    
    def compress_js(scripts)
      path_to_prod_file = self.get_path_to_prodjs_file(scripts)
      
      if not File.exists?(path_to_prod_file)
        # file does not exists, minify the scripts,
        # create the new prod file
        
        minifiedJS = ''
        
        # Roll through files minify them, save result to
        # single string,  then write to file
        scripts.length.times do |i|
          js_file = self.get_path_to_public() + scripts[i]
          
          file = File.open(js_file, "rb")
          minifiedJS += JSMin.minify(file.read)
        end
        
        # Create the production JS file
        open(path_to_prod_file, 'w') do |f|
          f.puts minifiedJS
        end
      end
    end
    
    def get_src_to_prodjs(scripts)
       path_to_prod = get_path_to_prodjs_file(scripts)
       js_file = path_to_prod.split(DEST_DIR).last
       
       DEST_DIR + js_file
    end
    
    # Use the last script file passed in as the name of the production file
    # ex. if the last script passed in the array is 'js/main.js'
    # the production file will be named main.[git_hash].js
    def get_path_to_prodjs_file(scripts)
      # Current git commit hash
      js_file_id = get_unique_filename_id()
      
      js_file_name = scripts[scripts.length - 1]
      js_file_name = js_file_name.split("/").last
      js_file_name = js_file_name.sub('.js', '.' + js_file_id + '.js')
      
      clean_path(File.dirname(__FILE__) + PUBLIC_DIR + DEST_DIR + js_file_name)
    end
    
    # uses some sort of counter to create a unique id for the
    # production js file name
    def get_unique_filename_id()
      hash = `git rev-parse HEAD`
      hash.strip
    end
    
    def get_path_to_public()
      clean_path(File.dirname(__FILE__) + PUBLIC_DIR)
    end
    
    def clean_path(path)
      path.sub('//', '/')
    end
end