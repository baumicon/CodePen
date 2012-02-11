require 'jsmin'

class Minify
    
    # alextodo, make these easy to set
    attr_accessor :minify
    
    @serveFromURL = ''
    @groupedFiles = ''
    
    @originJSDir = '/public/js'
    @destinationJSDir = '/public/prodjs'
    
    def initialize()
        @minify = true
    end
    
    # Prints the <script tags according to minify and combine level
    def script_tags(scripts)
      script_tags = ''
      
      if @minify == true
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
       js_file = path_to_prod.split("prodjs/").last
       
       '/prodjs/' + js_file
    end
    
    # Use the last script file passed in as the name of the production file
    # ex. if the last script passed in the array is 'js/main.js'
    # the production file will be named main.[git_hash].js
    def get_path_to_prodjs_file(scripts)
      # Current git commit hash
      hash = `git rev-parse HEAD`
      
      js_file_name = scripts[scripts.length - 1]
      js_file_name = js_file_name.split("/").last
      js_file_name = js_file_name.sub('.js', '.' + hash.strip + '.js')
      
      File.dirname(__FILE__) + '/public/prodjs/' + js_file_name
    end
    
    def get_path_to_public()
      File.dirname(__FILE__) + '/public/'
    end
end