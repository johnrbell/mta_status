module GetBGImage
  IMG_API_URL = "https://source.unsplash.com/category/buildings/1600x1200/?new+york".freeze

  def get_bg_img
    if cached_image_exists?
      newest_image.gsub("./public", "")
    else
      fetch_external_img
    end
  end

  private

  def cached_image_exists?
    return unless file = newest_image

    old_time = file.gsub(/\.\/public\/img\/bg\/|\.jpg/, "").to_i
    Time.now.to_i - old_time < 300
  end

  def newest_image
    Dir["./public/img/bg/*"].last
  end

  def fetch_external_img
    begin
      File.delete(newest_image) if newest_image

      download = open(IMG_API_URL)
      IO.copy_stream(download, "public/img/bg/" + build_filename)

      newest_image.gsub!("./public", "")
    rescue => e
      p e.backtrace
      default_images.sample
    end
  end

  def build_filename
    Time.now.to_i.to_s + ".jpg"
  end

  # TODO: save locally 
  def default_images
    [# factory
    "https://images.unsplash.com/photo-1470290032981-3371c20736f6?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=2874c6f4523d7302fc5a2f7809613ec6",
    # esb
    "https://images.unsplash.com/photo-1465487438571-59340bfc35dd?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=9fa78486dbc49708bb377a49a031bd77",
    # flatiron
    "https://images.unsplash.com/photo-1433437728106-854c6e19699c?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=e7f56fbd788432d64c5101e50d6bd8ed",
    # wtc
    "https://images.unsplash.com/photo-1467250123231-1813550b3fd5?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=ea3c6bd57306b0616d91507cdfdc4638",
    # flatiron 2
    "https://images.unsplash.com/photo-1428976365951-b70e0fa5c551?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=e81a3dab508c7c545fb32e1cf0339d96",
    # cabs
    "https://images.unsplash.com/39/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=3f50188f1e5cf13b10f4b0492ae6ac1f",
    # chrysler
    "https://images.unsplash.com/photo-1463267511177-6ae5f8c670d4?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=da09a211ea3ef975c1f3259d328381bb",
    # brooklyn bridge
    "https://images.unsplash.com/photo-1414496213569-23220f1033cd?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=8f72e46744fd8958c1d992d53062eaaa",
    # street
    "https://images.unsplash.com/photo-1466500419182-8602dc906b51?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=0d406540cd55d48f045186106dd0c0fb",
    # park
    "https://images.unsplash.com/photo-1464225495945-af130cc9f19e?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1600&h=1200&fit=crop&s=cf114e43f8289edc5e821d13ea08deff"]
  end

  module_function :get_bg_img
end
