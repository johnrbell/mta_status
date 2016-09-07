module FormatApiData
  # this method takes the trains array where each line has an array of trains
  # and returns a new array where each train has it's own hash
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
  end

end
