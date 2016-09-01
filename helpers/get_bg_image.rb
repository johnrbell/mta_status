module GetBGImage 
  IMG_API_URL = "https://source.unsplash.com/category/buildings/1600x1200/?new+york".freeze

  def get_bg_img
    if check_for_cached(newest_image)
      newest_image.gsub!('./public','')
    else
      fetch_external_img
    end
  end

  private

  def check_for_cached(file)
    old_time = file.gsub!('./public/img/bg/','').gsub!('.jpg','').to_i
    Time.now.to_i-old_time < 300 ? true : false
  end

  def newest_image
    Dir["./public/img/bg/*"].last
  end

  def fetch_external_img
    begin
      File.delete(newest_image)  
      download = open(IMG_API_URL)
      IO.copy_stream(download, 'public/img/bg/'+build_filename)
      newest_image.gsub!('./public','')
    rescue #if download of external fails: 
      default_images.sample 
    end
  end

  def build_filename
    Time.now.to_i.to_s+".jpg"
  end

  # TODO: save locally 
  def default_images
    ["https://images.unsplash.com/photo-1470290032981-3371c20736f6?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=2874c6f4523d7302fc5a2f7809613ec6"]
  end

  module_function :get_bg_img
end
