// Open the settings in a pop-up window.

import {windowman} from '../../windowman.JS';

function redirect() {
  new windowman(`gui/pages/settings.htm`);

  window.close();
}


function main() {
  redirect();
}

main();
