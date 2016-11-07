module ServiceStatus
  SERVICE_STATUS_URL = "http://web.mta.info/status/serviceStatus.txt".freeze

  def train_data(name)
    line_name = line_name_for(name)
    line = service_status_data.xpath("//line[name='#{line_name}']")
    parse_line(line, name)
  end

  def trains_data
    trains_data = service_status_data.xpath("//line")
      .map { |line| parse_line(line) }
      .select { |line| train_lines.include? line[:name] }
  end

  private

  def service_status_data
    Nokogiri::XML(open(SERVICE_STATUS_URL)) # @TODO This should be cached
  end

  def train_lines
    %w(123 456 7 ACE BDFM G JZ L NQRW S)
  end

  def valid_train?(train)
    train_lines.join.split("").include? train
  end

  def line_name_for(train)
    train_lines.each do |t|
      return t if t.split("").include? train
    end
  end

  def filter_html(html)
    html.to_s.gsub(/\n+ */, "").gsub(/&nbsp;|<br \/>/, " ")
  end

  def parse_line(line, name = nil)
    {
      name: name || line.xpath("name").text,
      status: modify_status(line.xpath("status").text),
      long_status: filter_html(line.xpath("text").text)
    }
  end

  def status_string_map
    {
      "PLANNED WORK": "planned <br> work.",
      "SERVICE CHANGE": "service <br> change.",
      "DELAYS": "delayed <br> af.",
      "GOOD SERVICE": "all good.",
      "DEFAULT": "probably <br> screwed."
    }
  end

  def modify_status(status)
    status_string_map[status.to_sym] || status_string_map[:DEFAULT]
  end

  module_function :train_data, :trains_data
end
