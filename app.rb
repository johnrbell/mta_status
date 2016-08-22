require "pry"
require "sinatra"
require "nokogiri"
require "open-uri"
require "sinatra/reloader"

require_relative "routes/trains"

class MtaStatus < Sinatra::Base
  set :root, File.dirname(__FILE__)
end
