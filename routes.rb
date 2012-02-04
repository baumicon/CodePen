require 'sinatra'

get '/do' do
    "Hello World"
    erb :index
end
