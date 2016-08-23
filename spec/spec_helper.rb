require "rack/test"
require "rspec"
require "vcr"
require "webmock"

ENV["RACK_ENV"] = "test"

require File.expand_path("../../app.rb", __FILE__)

def app
  MtaStatus
end

RSpec.configure do |config|
  include Rack::Test::Methods
end

VCR.configure do |config|
  config.cassette_library_dir = "spec/vcr_cassettes"
  config.hook_into :webmock
end
