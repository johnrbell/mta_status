class MtaStatus < Sinatra::Base
  namespace "/api" do
    get "/trains" do
      new_data = []
      trains_data.each do |line|
      	line[:name].split("").each do |train|
      		new_data.push({
      			:name => train,
      			:status => line[:status],
      			:long_status => line[:long_status]
      		})
      	end
      end
      new_data.to_json
      #trains_data.to_json
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
