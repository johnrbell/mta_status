require "spec_helper"

describe "Trains API" do
  describe "GET /trains" do
    it "responds with a 200" do
      VCR.use_cassette("api/trains") do
        get "/api/trains"
      end

      expect(last_response.status).to eq 200
    end

    it "responds with train data" do
      VCR.use_cassette("api/trains") do
        get "/api/trains"
      end

      response = JSON.parse(last_response.body)
      expect(response).to_not be_empty
    end
  end

  describe "GET /trains/:id" do
    context "when the train is valid" do
      it "responds with a 200" do
        VCR.use_cassette("api/trains/:id") do
          get "/api/trains/F"
        end

        expect(last_response.status).to eq 200
      end

      it "responds with train data" do
        VCR.use_cassette("api/trains/:id") do
          get "/api/trains/F"
        end

        status = JSON.parse(last_response.body)["status"]
        expect(status).to_not be_nil
      end
    end

    context "when the train is invalid" do
      it "responds with a 404" do
        VCR.use_cassette("api/trains/invalid") do
          get "/api/trains/invalid_train"
        end

        expect(last_response.status).to eq 404
      end

      it "responds with an error" do
        VCR.use_cassette("api/trains/invalid") do
          get "/api/trains/invalid_train"
        end

        error = JSON.parse(last_response.body)["error"]
        expect(error).to_not be_nil
      end
    end
  end
end
