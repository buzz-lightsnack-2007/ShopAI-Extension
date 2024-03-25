import {windowman} from './windowman.JS';

function redirect() {
  new windowman(`gui/popup.htm`);

  window.close();
}


function main() {
  redirect();
}

main();
