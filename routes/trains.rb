class MtaStatus < Sinatra::Base
  get "/" do
    @trains = trains_data
    @bg_img = get_bg_img
    erb :"trains/index"
  end

  get "/:name" do
    train = params[:name].upcase
    return invalid_train unless valid_train? train

    @train = train_data(train)
    @bg_img = get_bg_img
    erb :"trains/show"
  end

  private

  def invalid_train
    status 404
    erb :"trains/error"
  end
end
