//severity ranking - higher = worse
const severityOrder = [
  'No Scheduled Service',
  'Station Notice',
  'Boarding Change',
  'Special Schedule',
  'Extra Service',
  'Planned - Stops Skipped',
  'Planned - Express to Local',
  'Planned - Reroute',
  'Planned - Part Suspended',
  'Planned - Suspended',
  'Reduced Service',
  'Slow Speeds',
  'Delays',
  'Severe Delays'
]

function pickWorstStatus(types) {
  let worst = types[0]
  let worstIndex = severityOrder.indexOf(worst)
  types.forEach(t => {
    let idx = severityOrder.indexOf(t)
    if (idx > worstIndex) { worst = t; worstIndex = idx }
  })
  return worst
}

function mapStatus(status) {
  if (status.startsWith('Planned')) return "planned work."
  switch (status) {
    case 'Severe Delays': return "delayed af."
    case 'Delays': return "delayed af."
    case 'Slow Speeds': return "slow af."
    case 'Reduced Service': return "reduced service."
    case 'No Scheduled Service': return "no service."
    case 'Boarding Change': return "boarding change."
    case 'Extra Service': return "extra service."
    case 'Station Notice': return "station notice."
    case 'Special Schedule': return "special schedule."
    default: return status.toLowerCase() + "."
  }
}

const allRoutes = ['1','2','3','4','5','6','7','A','C','E','B','D','F','M','G','J','Z','L','N','Q','R','W','S']
const sortOrder = {'1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'A':7,'C':8,'E':9,'B':10,'D':11,
                   'F':12,'M':13,'G':14,'J':15,'Z':16,'L':17,'N':18,'Q':19,'R':20,'W':21,'S':22}

exports.processAlerts = function(feedData) {
  let now = Date.now() / 1000
  let routeAlerts = {}

  //collect active alerts per route
  feedData.entity.forEach(e => {
    let alert = e.alert
    let mercury = alert['transit_realtime.mercury_alert']
    let alertType = mercury ? mercury.alert_type : null
    if (!alertType) return

    //check if alert is currently active
    let active = (alert.active_period || []).some(p => {
      let start = p.start || 0
      let end = p.end || Infinity
      return now >= start && now <= end
    })
    if (!active) return

    //map to affected routes
    ;(alert.informed_entity || []).forEach(ie => {
      if (ie.route_id && allRoutes.includes(ie.route_id)) {
        if (!routeAlerts[ie.route_id]) routeAlerts[ie.route_id] = []
        routeAlerts[ie.route_id].push(alertType)
      }
    })
  })

  //build sorted train array
  let trains = []
  allRoutes.forEach(route => {
    let alerts = routeAlerts[route]
    let status
    if (alerts && alerts.length > 0) {
      status = mapStatus(pickWorstStatus(alerts))
    } else {
      status = "all good."
    }
    trains[sortOrder[route]] = {
      route: route,
      statusDetails: { statusSummary: status }
    }
  })

  return {
    trains: trains,
    cacheTime: new Date
  }
}
