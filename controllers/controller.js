var helper = require('../helper.js')
var axios = require('axios')
var fs = require('fs')
var path = require('path')
var globalTrains = {}

const mtaURL = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json'
const bgDir = path.join(__dirname, '..', 'public', 'img', 'bg')
const bgCacheTTL = 300 //seconds

const defaultImages = [
  "https://images.unsplash.com/photo-1470290032981-3371c20736f6?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1465487438571-59340bfc35dd?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1433437728106-854c6e19699c?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1467250123231-1813550b3fd5?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1428976365951-b70e0fa5c551?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/39/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1463267511177-6ae5f8c670d4?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1414496213569-23220f1033cd?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1466500419182-8602dc906b51?w=1600&h=1200&fit=crop",
  "https://images.unsplash.com/photo-1464225495945-af130cc9f19e?w=1600&h=1200&fit=crop"
]

//get newest cached bg image file
function newestImage() {
  let files = fs.readdirSync(bgDir).filter(f => f.endsWith('.jpg'))
  if (files.length == 0) return null
  files.sort()
  return files[files.length - 1]
}

//check if cached image is still fresh
function cachedImageExists() {
  let file = newestImage()
  if (!file) return false
  let timestamp = parseInt(file.replace('.jpg', ''))
  return (Date.now() / 1000) - timestamp < bgCacheTTL
}

//fetch a random NYC bg image, cache to disk
async function getBgImg() {
  if (cachedImageExists()) {
    return '/img/bg/' + newestImage()
  }
  try {
    //delete old image
    let old = newestImage()
    if (old) fs.unlinkSync(path.join(bgDir, old))

    let url = defaultImages[Math.floor(Math.random() * defaultImages.length)]
    let response = await axios.get(url, { responseType: 'arraybuffer' })
    let filename = Math.floor(Date.now() / 1000) + '.jpg'
    fs.writeFileSync(path.join(bgDir, filename), response.data)
    return '/img/bg/' + filename
  } catch (err) {
    console.log('BG image error:', err.message)
    return defaultImages[Math.floor(Math.random() * defaultImages.length)]
  }
}

//fetch train data from MTA, process it, cache it, and render
async function fetchAndRender(res, bgImg) {
  try {
    let response = await axios.get(mtaURL)
    globalTrains = helper.processAlerts(response.data)
    res.render('trains', {data: globalTrains, bgImg: bgImg})
  } catch (err) {
    console.log('MTA API error:', err.message)
    res.status(500).send('Error fetching MTA data')
  }
}

//runs when main URL is hit.
exports.get_trains = async (req,res) => {
  let bgImg = await getBgImg()
  if (Object.keys(globalTrains).length == 0){
    fetchAndRender(res, bgImg)
  }else{
    let now = Date.parse(new Date)
    if (((now - globalTrains.cacheTime)/1000) < 300){
      console.log('sending cached')
      res.render('trains', {data: globalTrains, bgImg: bgImg})
    }else{
      console.log('fetching fresh data')
      fetchAndRender(res, bgImg)
    }
  }
}

const validTrains = ['1','2','3','4','5','6','7','A','C','E','B','D','F','M','G','J','Z','L','N','Q','R','W','S']

//individual train route
exports.get_train = async (req,res) => {
  let name = req.params.name.toUpperCase()
  if (validTrains.includes(name)) {
    res.redirect('/')
  } else {
    let bgImg = await getBgImg()
    res.status(404).render('error', {name: req.params.name, bgImg: bgImg})
  }
}

//keep post route for backward compat
exports.post_trains = (req,res) => {
  res.redirect('/')
}