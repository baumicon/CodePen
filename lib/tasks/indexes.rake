namespace :db do
  namespace :mongo do
    desc "Create mongo_mapper indexes"
    task :index => :environment do
      CreateIndexes.all
    end
  end
end
