require "json"
require "nokogiri"
require "open-uri"
require "pry"
require "sinatra"
require "sinatra/namespace"
require "sinatra/reloader"
require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

class MtaStatus < Sinatra::Base
  set :root, File.dirname(__FILE__)
  register Sinatra::Namespace
end

require_relative "helpers/service_status"
require_relative "routes/trains"
require_relative "routes/api/trains"
require_relative "helpers/get_bg_image"
require_relative "helpers/format_api_data"

MtaStatus.helpers GetBGImage
MtaStatus.helpers ServiceStatus
MtaStatus.helpers FormatApiData
