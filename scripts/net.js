/* net.js
  This script provides network utilities.
*/

/* 
Download a file from the network or locally.

@param {string} URL the URL to download
@param {string} type the expected type of file
@param {boolean} verify_only whether to verify the file only, not return its content
@returns {Promise} the downloaded file
*/
export async function download(URL, type, verify_only = false) {
  let connect = await fetch(URL),
    data;

  if (connect.ok && !verify_only) {
    if (type ? type.includes(`json`) || type.includes(`dictionary`) : false) {
      data = connect.json();
    } else {
      data = connect.text();
    }
  }

  // Return the filter.
  return (verify_only) ? connect.ok : data;
}
