// 13.388860,52.517037
// 13.428555,52.523219

function getRoute(from, to) {
    var from_x = from[0];
    var from_y = from[1];

    var to_x = to[0];
    var to_y = to[1];


    var url = `http://router.project-osrm.org/route/v1/driving/${from_x},${from_y};${to_x},${to_y}`;

console.log(from, to)

console.log(url)

fetch(url)
  // fetch() returns a promise. When we have received a response from the server,
  // the promise's `then()` handler is called with the response.
  .then((response) => {
    // Our handler throws an error if the request did not succeed.
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    // Otherwise (if the response succeeded), our handler fetches the response
    // as text by calling response.text(), and immediately returns the promise
    // returned by `response.text()`.
    return response.text();
  })
  // When response.text() has succeeded, the `then()` handler is called with
  // the text, and we copy it into the `poemDisplay` box.
  .then((text) => {
    console.log(text);
  })
};

getRoute([13.388860,52.517037],[13.428555,52.523219])

