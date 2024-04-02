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
  const alert = await import(chrome.runtime.getURL(`gui/scripts/alerts.js`))
    .default;
  const texts = (await import(chrome.runtime.getURL(`gui/scripts/read.js`)))
    .default;

  let connect = await fetch(URL),
    data;

  if (connect.ok && !verify_only) {
    data = await connect.text();

    try {
    } catch (err) {
      if (
        type
          ? type.toLowerCase().includes(`json`) ||
            type.toLowerCase().includes(`dictionary`)
          : false
      ) {
        data = JSON.parse(data);
      }
      alert.error(texts.localized(`error_msg_notJSON`, false));
    }
  }

  // Return the filter.
  return verify_only ? connect.ok : data;
}
