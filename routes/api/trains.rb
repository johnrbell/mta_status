class MtaStatus < Sinatra::Base
  namespace "/api" do
    get "/trains" do
      trains_data.to_json
    end

    get "/trains/:name" do
      train = params[:name].upcase
      return invalid_train unless valid_train? train
      train_data(train).to_json
    end

    private

    def invalid_train
      status 404
      { error: "Invalid train." }.to_json
    end
  end
end
