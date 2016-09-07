module FormatApiData

  def format_api_data(trains_data)

    trains_data.inject([]) do |prev, curr|
      curr[:name].split("").each do |train|
        prev.push({
          :name => train,
          :status => curr[:status],
          :long_status => curr[:long_status]
        })
      end
      prev
    end
    # formatted_data = []
    # trains_data.each do |line|
    #   line[:name].split("").each do |train|
    #     formatted_data.push({
    #       :name => train,
    #       :status => line[:status],
    #       :long_status => line[:long_status]
    #     })
    #   end
    # end
    #formatted_data
  end

end
