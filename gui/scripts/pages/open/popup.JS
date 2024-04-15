import windowman from "/scripts/GUI/windowman.JS";

function redirect() {
  windowman.new(`/gui/pages/settings.htm`);

  window.close();
}

function main() {
  redirect();
}

main();
