require 'compass'
require 'net/http'
require 'haml'
require 'json'
require 'slim'
require 'sass'
require 'awesome_print'

NODE_URL = 'http://127.0.0.1:8124'

class PreProcessorService

  attr_accessor :errors

  def initialize()
    @errors = { }
  end
  
  # Public: Process all three parts of content (html, css and js) at once.
  #
  # data - the hash with keys, html, css, js, and (html|css|js)_pre_processor
  #
  # Examples
  # process_content({
  #   'html' => 'h1 level one header',
  #   'html_pre_processor' => 'jade',
  #   'css' => '@color: blue; h1 { color: @color;}'
  #   'css_pre_processor' => 'less'
  # })
  #
  #  => {'html' => '<h1>level one header</h1>', 'css' => 'h1 { color: blue; }' }
  #
  def process_content(data)
    results = { }
    
    if !empty?(data[:html])
      results['html'] = process_html(data[:html_pre_processor], data[:html])
    end

    if !empty?(data[:css])
      results['css'] = process_css(data[:css_pre_processor], data[:css])
    end

    if !empty?(data[:js])
      results['js'] = process_js(data[:js_pre_processor], data[:js])
    end
    
    results
  end
  
  # Public: Process HTML with preprocessors
  #
  # type - the preprocessor type (jade|haml)
  # html - the content to process
  #
  # Examples
  #
  #   process_html('jade', 'h1 level one header')
  #     => '<h1>level one header</h1>'
  #
  def process_html(type, html)
    if type == 'jade'
      html = node_req('/jade/', 'html', html, 'Jade')
    elsif type == 'slim'
      begin
        Slim::Engine.set_default_options :pretty => true
        slim_tmpl = Slim::Template.new { html }
        html = slim_tmpl.render
      rescue Exception => e
        @errors['Slim'] = e.message
      end
    elsif type == 'haml'
      begin
        html = Haml::Engine.new(html).render
      rescue Exception => e
        @errors['HAML'] = e.message
      end
    end
    
    html = (html) ? html.strip() : ''
  end

  # Public: Process CSS with preprocessors
  #
  # type - the preprocessor type (less|stylus|scss|sass)
  # css  - the content to process
  # 
  # Examples
  #
  #   process_css('less', '@color: blue; h1 { color: @color;}')
  #     => 'h1 { color: blue; }'
  def process_css(type, css)
    if type == 'less'
      # alextodo take a look at less errors
      # they should be able to add to errors array
      css = node_req('/less/', 'css', css, 'LESS')
    elsif type == 'stylus'
      css = node_req('/stylus/', 'css', css, 'Stylus')
    elsif type == 'scss'
      begin
        # simple scss
        engine = get_scss_engine(css)
        css = engine.render
      rescue Sass::SyntaxError => e
        @errors['SCSS'] = e.message
      end
    elsif type == 'sass'
      begin
        # sass with compass
        imports_and_css = get_compass_imports(css) + "\n" + css
        engine = get_sass_compass_engine(imports_and_css)
        css = engine.render
      rescue Sass::SyntaxError => e
        @errors['SASS with Compass'] = e.message
      end
    end

    css
  end
  
  def get_scss_engine(content)
    opts = { }
    opts[:style]  = :expanded
    opts[:syntax] = :scss
    opts[:line_numbers] = false
    opts[:line_comments] = false
    # set the full exception to false so that Sass engine throws
    # a ruby exception instead of adding error to CSS
    opts[:full_exception] = false
    
    Sass::Engine.new(content, opts)
  end
  
  # A sass engine for compiling sass content with compass
  # Read this file 
  # http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#syntax
  # alextodo, would be really cool to detect the mixins like
  # @include border-radius, and tell the user they need to
  # add this import, @import "compass/css3/border-radius"
  # otherwise, you get this error
  #   (sass):4:in `border-radius': Undefined mixin 'border-radius'.
  # we can tell them that we added it for them, or tell them how to fix it
  def get_sass_compass_engine(content)
    opts = Compass.sass_engine_options
    opts[:style]  = :expanded
    opts[:syntax] = :sass
    opts[:line_numbers] = false
    opts[:line_comments] = false
    # set the full exception to false so that Sass engine throws
    # a ruby exception instead of adding error to CSS
    opts[:full_exception] = false
    # Give Sass engine access to all the compass sass files
    opts[:load_paths] = Compass.configuration.sass_load_paths
    
    Sass::Engine.new(content, opts)
  end
  
  # compass imports maps each mixin available via compass
  # to the import file where they actually live
  def get_compass_imports(content)
    mixins_to_imports = {
      "image-dimensions" => "lemonade",
      "sprite-image" => "lemonade",
      "sized-sprite-image" => "lemonade",
      "sprite-folder" => "lemonade",
      "sized-sprite-folder" => "lemonade",
      "appearance" => "compass/css3/appearance",
      "background-clip" => "compass/css3/background-clip",
      "background-origin" => "compass/css3/background-origin",
      "background-size" => "compass/css3/background-size",
      "border-radius" => "compass/css3/border-radius",
      "border-corner-radius" => "compass/css3/border-radius",
      "border-top-left-radius" => "compass/css3/border-radius",
      "border-top-right-radius" => "compass/css3/border-radius",
      "border-bottom-left-radius" => "compass/css3/border-radius",
      "border-bottom-right-radius" => "compass/css3/border-radius",
      "border-top-radius" => "compass/css3/border-radius",
      "border-right-radius" => "compass/css3/border-radius",
      "border-bottom-radius" => "compass/css3/border-radius",
      "border-left-radius" => "compass/css3/border-radius",
      "box-shadow" => "compass/css3/box-shadow",
      "single-box-shadow" => "compass/css3/box-shadow",
      "box-sizing" => "compass/css3/box-sizing",
      "display-box" => "compass/css3/box",
      "box-orient" => "compass/css3/box",
      "box-align" => "compass/css3/box",
      "box-flex" => "compass/css3/box",
      "box-flex-group" => "compass/css3/box",
      "box-ordinal-group" => "compass/css3/box",
      "box-direction" => "compass/css3/box",
      "box-lines" => "compass/css3/box",
      "box-pack" => "compass/css3/box",
      "columns" => "compass/css3/columns",
      "column-count" => "compass/css3/columns",
      "column-gap" => "compass/css3/columns",
      "column-width" => "compass/css3/columns",
      "column-rule-width" => "compass/css3/columns",
      "column-rule-style" => "compass/css3/columns",
      "column-rule-color" => "compass/css3/columns",
      "column-rule" => "compass/css3/columns",
      "font-face" => "compass/css3/font-face",
      "background" => "compass/css3/images",
      "background-with-css2-fallback" => "compass/css3/images",
      "background-image" => "compass/css3/images",
      "filter-gradient" => "compass/css3/images",
      "border-image" => "compass/css3/images",
      "list-style-image" => "compass/css3/images",
      "list-style" => "compass/css3/images",
      "content" => "compass/css3/images",
      "inline-block" => "compass/css3/inline-block",
      "opacity" => "compass/css3/opacity",
      "transparent" => "compass/css3/opacity",
      "opaque" => "compass/css3/opacity",
      "pie-container" => "compass/css3/pie",
      "pie-element" => "compass/css3/pie",
      "pie" => "compass/css3/pie",
      "pie-watch-ancestors" => "compass/css3/pie",
      "experimental" => "compass/css3/shared",
      "experimental-value" => "compass/css3/shared",
      "text-shadow" => "compass/css3/text-shadow",
      "single-text-shadow" => "compass/css3/text-shadow",
      "apply-transform" => "compass/css3/transform-legacy",
      "apply-origin" => "compass/css3/transform-legacy",
      "transform-origin" => "compass/css3/transform-legacy",
      "transform" => "compass/css3/transform-legacy",
      "scale" => "compass/css3/transform-legacy",
      "rotate" => "compass/css3/transform-legacy",
      "translate" => "compass/css3/transform-legacy",
      "skew" => "compass/css3/transform-legacy",
      "apply-origin" => "compass/css3/transform",
      "transform-origin" => "compass/css3/transform",
      "transform" => "compass/css3/transform",
      "transform2d" => "compass/css3/transform",
      "transform3d" => "compass/css3/transform",
      "perspective" => "compass/css3/transform",
      "perspective-origin" => "compass/css3/transform",
      "transform-style" => "compass/css3/transform",
      "backface-visibility" => "compass/css3/transform",
      "scale" => "compass/css3/transform",
      "scaleX" => "compass/css3/transform",
      "scaleY" => "compass/css3/transform",
      "scaleZ" => "compass/css3/transform",
      "scale3d" => "compass/css3/transform",
      "rotate" => "compass/css3/transform",
      "rotateZ" => "compass/css3/transform",
      "rotateX" => "compass/css3/transform",
      "rotateY" => "compass/css3/transform",
      "rotate3d" => "compass/css3/transform",
      "translate" => "compass/css3/transform",
      "translateX" => "compass/css3/transform",
      "translateY" => "compass/css3/transform",
      "translateZ" => "compass/css3/transform",
      "translate3d" => "compass/css3/transform",
      "skew" => "compass/css3/transform",
      "skewX" => "compass/css3/transform",
      "skewY" => "compass/css3/transform",
      "create-transform" => "compass/css3/transform",
      "simple-transform" => "compass/css3/transform",
      "transition-property" => "compass/css3/transition",
      "transition-duration" => "compass/css3/transition",
      "transition-timing-function" => "compass/css3/transition",
      "transition-delay" => "compass/css3/transition",
      "single-transition" => "compass/css3/transition",
      "transition" => "compass/css3/transition",
      "build-prefix-values" => "compass/css3/transition",
      "user-select" => "compass/css3/user-interface",
      "baseline-grid-background" => "compass/layout/grid-background",
      "column-grid-background" => "compass/layout/grid-background",
      "grid-background" => "compass/layout/grid-background",
      "sticky-footer" => "compass/layout/sticky-footer",
      "stretch-y" => "compass/layout/stretching",
      "stretch-x" => "compass/layout/stretching",
      "stretch" => "compass/layout/stretching",
      "global-reset" => "compass/reset/utilities-legacy",
      "nested-reset" => "compass/reset/utilities-legacy",
      "reset-box-model" => "compass/reset/utilities-legacy",
      "reset-font" => "compass/reset/utilities-legacy",
      "reset-focus" => "compass/reset/utilities-legacy",
      "reset-body" => "compass/reset/utilities-legacy",
      "reset-list-style" => "compass/reset/utilities-legacy",
      "reset-table" => "compass/reset/utilities-legacy",
      "reset-table-cell" => "compass/reset/utilities-legacy",
      "reset-quotation" => "compass/reset/utilities-legacy",
      "reset-image-anchor-border" => "compass/reset/utilities-legacy",
      "reset-html5" => "compass/reset/utilities-legacy",
      "reset-display" => "compass/reset/utilities-legacy",
      "global-reset" => "compass/reset/utilities",
      "nested-reset" => "compass/reset/utilities",
      "reset-box-model" => "compass/reset/utilities",
      "reset-font" => "compass/reset/utilities",
      "reset-focus" => "compass/reset/utilities",
      "reset-body" => "compass/reset/utilities",
      "reset-list-style" => "compass/reset/utilities",
      "reset-table" => "compass/reset/utilities",
      "reset-table-cell" => "compass/reset/utilities",
      "reset-quotation" => "compass/reset/utilities",
      "reset-image-anchor-border" => "compass/reset/utilities",
      "reset-html5" => "compass/reset/utilities",
      "reset-display" => "compass/reset/utilities",
      "establish-baseline" => "compass/typography/verticalrhythm",
      "reset-baseline" => "compass/typography/verticalrhythm",
      "debug-vertical-alignment" => "compass/typography/verticalrhythm",
      "adjust-font-size-to" => "compass/typography/verticalrhythm",
      "adjust-leading-to" => "compass/typography/verticalrhythm",
      "leader" => "compass/typography/verticalrhythm",
      "padding-leader" => "compass/typography/verticalrhythm",
      "margin-leader" => "compass/typography/verticalrhythm",
      "trailer" => "compass/typography/verticalrhythm",
      "padding-trailer" => "compass/typography/verticalrhythm",
      "margin-trailer" => "compass/typography/verticalrhythm",
      "rhythm" => "compass/typography/verticalrhythm",
      "apply-side-rhythm-border" => "compass/typography/verticalrhythm",
      "rhythm-borders" => "compass/typography/verticalrhythm",
      "leading-border" => "compass/typography/verticalrhythm",
      "trailing-border" => "compass/typography/verticalrhythm",
      "horizontal-borders" => "compass/typography/verticalrhythm",
      "h-borders" => "compass/typography/verticalrhythm",
      "hover-link" => "compass/typography/links/hover-link",
      "link-colors" => "compass/typography/links/link-colors",
      "unstyled-link" => "compass/typography/links/unstyled-link",
      "no-bullet" => "compass/typography/lists/bullets",
      "no-bullets" => "compass/typography/lists/bullets",
      "pretty-bullets" => "compass/typography/lists/bullets",
      "horizontal-list-container" => "compass/typography/lists/horizontal-list",
      "horizontal-list-item" => "compass/typography/lists/horizontal-list",
      "horizontal-list" => "compass/typography/lists/horizontal-list",
      "inline-block-list-container" => "compass/typography/lists/inline-block-list",
      "inline-block-list-item" => "compass/typography/lists/inline-block-list",
      "inline-block-list" => "compass/typography/lists/inline-block-list",
      "inline-list" => "compass/typography/lists/inline-list",
      "delimited-list" => "compass/typography/lists/inline-list",
      "comma-delimited-list" => "compass/typography/lists/inline-list",
      "ellipsis" => "compass/typography/text/ellipsis",
      "force-wrap" => "compass/typography/text/force-wrap",
      "nowrap" => "compass/typography/text/nowrap",
      "replace-text" => "compass/typography/text/replacement",
      "replace-text-with-dimensions" => "compass/typography/text/replacement",
      "hide-text" => "compass/typography/text/replacement",
      "squish-text" => "compass/typography/text/replacement",
      "print-utilities" => "compass/utilities/print",
      "contrasted" => "compass/utilities/color/contrast",
      "clearfix" => "compass/utilities/general/clearfix",
      "legacy-pie-clearfix" => "compass/utilities/general/clearfix",
      "pie-clearfix" => "compass/utilities/general/clearfix",
      "float-left" => "compass/utilities/general/float",
      "float-right" => "compass/utilities/general/float",
      "float" => "compass/utilities/general/float",
      "reset-float" => "compass/utilities/general/float",
      "has-layout" => "compass/utilities/general/hacks",
      "has-layout-zoom" => "compass/utilities/general/hacks",
      "has-layout-block" => "compass/utilities/general/hacks",
      "bang-hack" => "compass/utilities/general/hacks",
      "min-height" => "compass/utilities/general/min",
      "min-width" => "compass/utilities/general/min",
      "hacked-minimum" => "compass/utilities/general/min",
      "tag-cloud" => "compass/utilities/general/tag-cloud",
      "sprite-dimensions" => "compass/utilities/sprites/base",
      "sprite-background-position" => "compass/utilities/sprites/base",
      "sprite" => "compass/utilities/sprites/base",
      "sprite-selectors" => "compass/utilities/sprites/base",
      "sprites" => "compass/utilities/sprites/base",
      "sprite-img" => "compass/utilities/sprites/sprite-img",
      "sprite-background" => "compass/utilities/sprites/sprite-img",
      "sprite-background-rectangle" => "compass/utilities/sprites/sprite-img",
      "sprite-column" => "compass/utilities/sprites/sprite-img",
      "sprite-row" => "compass/utilities/sprites/sprite-img",
      "sprite-position" => "compass/utilities/sprites/sprite-img",
      "sprite-replace-text" => "compass/utilities/sprites/sprite-img",
      "sprite-replace-text-with-dimensions" => "compass/utilities/sprites/sprite-img",
      "alternating-rows-and-columns" => "compass/utilities/tables/alternating-rows-and-columns",
      "outer-table-borders" => "compass/utilities/tables/borders",
      "inner-table-borders" => "compass/utilities/tables/borders",
      "table-scaffolding" => "compass/utilities/tables/scaffolding",
    }

    lines = content.split("\n")
    imports = ''

    lines.each do |line|
      reg = /@include([-\w\s]+)/.match(line)

      if reg
        mix = reg[1].strip

        mixins_to_imports.each do |mixin, import|
          if mix == mixin
            imports += '@import "' + import + '"' + "\n"
          end
        end
      end
    end

    imports
  end
  
  def process_js(type, js)
    if type == 'coffeescript'
      js = node_req('/coffeescript/', 'js', js, 'CoffeeScript')
    end

    js
  end

  def node_req(path, key, value, err_key)
    uri = URI(NODE_URL + path)
    res = Net::HTTP.post_form(uri, key => value)
    
    obj = JSON.parse(res.body)
    record_errors(obj, err_key)
    
    obj[key]
  end

  # Add any errors to the errors hash
  def record_errors(obj, key)
    if obj['error']
      @errors[key] = obj['error']
    end
  end
  
  def empty?(content)
    content == nil or content.empty?
  end
  
end