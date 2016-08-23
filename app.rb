require "json"
require "nokogiri"
require "open-uri"
require "pry"
require "sinatra"
require "sinatra/namespace"
require "sinatra/reloader"

class MtaStatus < Sinatra::Base
  set :root, File.dirname(__FILE__)
  register Sinatra::Namespace
end

require_relative "helpers/service_status"
require_relative "routes/trains"
require_relative "routes/api/trains"

MtaStatus.helpers ServiceStatus
