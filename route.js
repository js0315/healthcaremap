// 13.388860,52.517037
// 13.428555,52.523219

function getRoute(from, to) {
  var from_x = from[0];
  var from_y = from[1];

  var to_x = to[0];
  var to_y = to[1];


  var url = `http://router.project-osrm.org/route/v1/driving/${from_x},${from_y};${to_x},${to_y}`;

console.log(from, to)

console.log(url, "\n")

fetch(url)

.then((response) => {
  // Our handler throws an error if the request did not succeed.
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
})

.then((data) => {
  console.log(data)
})
};

getRoute([13.388860,52.517037],[13.428555,52.523219])

