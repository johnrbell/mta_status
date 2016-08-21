require 'pry'
require 'sinatra'
require 'nokogiri'
require 'open-uri'
require 'sinatra/reloader'

class Application<Sinatra::Base

  ##############################################################################################

  get '/' do #get all trains
    working_hash = get_train_data

    working_hash.each do |train|
      train.pop #pops off the last item for each train (the long status)
    end
    erb :index
  end

  ##############################################################################################

  get '/:train' do |n| #get a single train
    working_hash = get_train_data

    almost_final_hash = []
    @final_hash = []

    working_hash.each do |train|
      if train[0] == n.upcase
        almost_final_hash.push(train[0],train[1],train[2])
      end
    end

    if almost_final_hash != []
      @final_hash.push(almost_final_hash)
      erb :index
    else
      "<center>Sorry, but this train does not exist.</center>"
    end
  end

  ##############################################################################################

  def get_train_data #this gets the train data and puts it into a simple, usable hash. 
    group_count = 10 #this is how many train groups the xml file has. i.e. ABC is one group.
    @final_hash = [] #blank hash for final ouput

    data = Nokogiri::XML(open('http://web.mta.info/status/serviceStatus.txt')) #opens xml file.
    trains = data.xpath('//subway').xpath('//name').first(group_count) #gets X train names from xml
    status = data.xpath('//subway').xpath('//status').first(group_count) #get X status for trains from xml
    text = data.xpath('//subway').xpath('//text').first(group_count) #get X status for trains from xml

    trains.map! do |train| train = train.text.to_s end #reduces to simple array. 
    status.map! do |train| train = train.text.to_s end #reduces to simple array. 
    text.map! do |train| train = train.text.to_s.gsub(/\n+ */, "").gsub("&nbsp;"," ").gsub("<br/>"," ") end #reduces to simple array. 

    work_hash = trains.zip(status,text) #zips the arrays together.

    work_hash.each do |train,status,text| #split multiple trains to individual. ACE > A,C,E
      train.length.times do |i|
        @final_hash.push([train[i],status,text]) #after split, push to new array. 
      end
    end

    return @final_hash #returns the hash. 
  end

  ##############################################################################################

end
