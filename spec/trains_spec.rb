require "spec_helper"

describe "Trains" do
  describe "GET /trains" do
    it "responds with a 200" do
      VCR.use_cassette("trains") do
        get "/"
      end

      expect(last_response.status).to eq 200
    end
  end

  describe "GET /trains/:id" do
    context "when the id is valid" do
      it "responds with a 200" do
        VCR.use_cassette("trains") do
          get "/trains/F"
        end

        expect(last_response.status).to eq 404
      end
    end

    context "when the id is invalid" do
      it "responds with a 404" do
        VCR.use_cassette("trains/invalid") do
          get "/trains/invalid_train"
        end

        expect(last_response.status).to eq 404
      end
    end
  end
end
