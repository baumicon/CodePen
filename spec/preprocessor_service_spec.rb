require './services/preprocessor_service'

# run with rspec spec/preprocessor_service_spec.rb --color --format doc

describe PreProcessorService do
  
  before(:each) do
    @pps = PreProcessorService.new
  end
  
  it "should return all the imports from compass." do
    imports = @pps.get_compass_imports
    imports.should be_true
  end
  
  it "should return the html untouched." do
    expected = '<h1>test</h1>'
    result = @pps.process_html('html', expected)
    
    result.should == expected
  end
  
  it "should return the processed haml." do
    expected = '<strong>Words</strong>'
    haml = '%strong Words'
    result = @pps.process_html('haml', haml).strip!
    
    result.should == expected
  end
  
  it "should return the css untouched." do
    expected = 'body { color: blue }'
    result = @pps.process_css('css', expected)
    
    result.should == expected
  end
  
  it "should return the processed sass." do
    value = <<HERE
li
  font:
    family: serif
    weight: bold
    size: 1.2em
HERE
    
    result = @pps.process_css('sass', value)
    result.should =~ /font-family: serif/
  end
  
  it "should return the processed scss." do
    value = <<HERE
    li {
      font: {
        family: serif;
        weight: bold;
        size: 1.2em;
      }
    }
HERE

    result = @pps.process_css('scss', value)
    result.should =~ /font-family: serif/
  end
  
  it "should returned the js untouched" do
    expected = "alert(1);"
    result = @pps.process_js("js", expected)
    
    result.should == expected
  end
end