class MtaStatus < Sinatra::Base
  get "/" do
    @trains = get_train_data
    erb :"trains/index"
  end

  get "/:id" do
    train = params[:id].upcase
    return erb :"trains/error" unless train_lines.flatten.include? train

    # working_hash = get_train_data
    #
    # almost_final_hash = []
    # @final_hash = []
    #
    # working_hash.each do |train|
    #   if train[0] == n.upcase
    #     almost_final_hash.push(train[0],train[1],train[2])
    #   end
    # end
    #
    # if almost_final_hash != []
    #   @final_hash.push(almost_final_hash)
    #   erb :index
    # else
    #   "<center>Sorry, but this train does not exist.</center>"
    # end
    erb :"trains/show"
  end

  private

  def train_lines
    [
      %w(1 2 3),
      %w(4 5 6),
      %w(7),
      %w(A C E),
      %w(B D F M),
      %w(G),
      %w(J Z),
      %w(L),
      %w(N Q R),
      %w(S)
    ]
  end

  def parse_subway(data, row)
    data
      .xpath("//subway")
      .xpath("//#{row}")
      .first(train_lines.count)
      .collect { |t| t.child.to_s }
  end

  def filter_html(html)
    html.to_s.gsub(/\n+ */, "").gsub(/&nbsp;|<br \/>/, " ")
  end

  def get_train_data
    # @TODO This should be cached for ~5 minutes.
    data = Nokogiri::XML(open("http://web.mta.info/status/serviceStatus.txt"))
    output = []

    # MTA data is mashed together; we only care about train lines
    trains = parse_subway(data, "name").zip(
      parse_subway(data, "status"),
      parse_subway(data, "text")
    )

    trains.each do |train_line, status, long_status|
      train_line.length.times do |train|
        output.push([
          train_line[train],
          status,
          filter_html(long_status)
        ])
      end
    end

    output
  end
end
