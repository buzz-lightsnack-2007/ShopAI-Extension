import {windowman} from '../../windowman.JS';

function redirect() {
  new windowman(`gui/pages/settings.htm`);

  window.close();
}


function main() {
  redirect();
}

main();
