require "rack/test"
require "rspec"

ENV["RACK_ENV"] = "test"

require File.expand_path("../../app.rb", __FILE__)

def app
  # Sinatra::Application
  MtaStatus
end

RSpec.configure do |config|
  include Rack::Test::Methods
end
