/* net.js
  This script provides network utilities.
*/

export async function download(URL, type) {
  let connect = await fetch(URL),
    data;

  if (connect.ok) {
    if (type ? type.includes(`json`) || type.includes(`dictionary`) : false) {
      data = connect.json();
    } else {
      data = connect.text();
    }
  }

  // Return the filter.
  return data;
}
