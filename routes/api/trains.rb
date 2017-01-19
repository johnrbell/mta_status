class MtaStatus < Sinatra::Base
  register Sinatra::CrossOrigin
  enable :cross_origin
    
  namespace "/api" do
    get "/trains" do
      format_api_data(trains_data).to_json
    end

    get "/trains/:name" do
      train = params[:name].upcase
      return invalid_train unless valid_train? train
      train_data(train).to_json
    end

    get "/get_bg" do
      send_file File.join(settings.public_folder, get_bg_img)
    end

    private

    def invalid_train
      status 404
      { error: "Invalid train." }.to_json
    end
  end
end
