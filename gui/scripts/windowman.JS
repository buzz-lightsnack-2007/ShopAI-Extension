/* windowman
Window management */

import texts from "./read.js";

class windowman {
  /* Initialize the window frame. */
  static prepare() {
    try {
      let UI = {
        library: [
          chrome.runtime.getURL("gui/styles/interface.external.css"),
          chrome.runtime.getURL("gui/styles/ui.css"),
        ],
        script: chrome.runtime.getURL(
          "gui/scripts/external/interface.external.js",
        ),
      };

      UI.library.forEach((source) => {
        $(`head`).append(
          `<link rel="stylesheet" type="text/css" href="${source}">`,
        );
      });

      $(`head`).append(`<script type="module" src="${UI.script}"></script>`);
    } catch (error) {
      console.error(texts.localized(`error_fileNotFound`, [error]));
    }

    // Prevent scaling, similar to a real window.
    $(`head`).append(
      `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`,
    );
  }

  constructor(URL, height, width) {
    this.window = chrome.windows.create({
      url: chrome.runtime.getURL(URL),
      type: "popup",
      width: width ? parseInt(width) : 400,
      height: height ? parseInt(height) : 600,
    });
  }

  static fill() {
    function text() {
      let text_elements = document.querySelectorAll("[data-text]");

      text_elements.forEach((text_element) => {
        let text_inserted = texts.localized(
          text_element.getAttribute(`data-text`),
          false,
          text_element.hasAttribute(`data-text-parameter`)
            ? text_element.getAttribute(`data-text-parameter`).split(",")
            : null,
        );
        if (!text_inserted) {
          text_inserted = texts.localized(
            `term_`.concat(text_element.getAttribute(`data-text`)),
          );
        }

        text_element.innerText = text_inserted;
      });
    }

    function storage() {
      (async () => {
        // Import the module.
        const secretariat = await import(
          chrome.runtime.getURL("scripts/secretariat.js")
        );

        let input_elements = document.querySelectorAll("[data-store]");

        input_elements.forEach((input_element) => {
          // Gather data about the element.
          // Get the corresponding storage data.
          let data = {};
          data[`source`] = input_element.getAttribute(`data-store`);
          data[`value`] = secretariat.read(data[`source`], -1);

          data[`value`].then((value) => {
            switch (input_element.getAttribute(`type`).toLowerCase()) {
              case `checkbox`:
                input_element.checked = value;
                break;
              case `progress`:
              case `range`:
                // Ensure that it is a positive floating-point number.
                value = !value ? 0 : Math.abs(parseFloat(value));
                if (value > 100) {
                  value = value / 100;
                }

                // Set the attribute of the progress bar.
                input_element.setAttribute(`value`, value);
                input_element.setAttribute(`max`, 1);
                break;
              default:
                input_element.value = value ? value : ``;
                break;
            }
          });
        });
      })();
    }

    text();
    storage();
  }

  /* Add click events. */
  static events() {
    /* Add events related to storage. */
    function storage() {
      (async () => {
        // Import the module.
        const secretariat = await import(
          chrome.runtime.getURL("scripts/secretariat.js")
        );

        let input_elements = document.querySelectorAll("[data-store]");

        input_elements.forEach((input_element) => {
          // Gather data about the element.
          // Get the corresponding storage data.

          let element = {};
          element[`type`] = input_element.getAttribute(`type`).toLowerCase();
          element[`event`] = function () {};

          switch (element[`type`]) {
            case `checkbox`:
              element[`event`] = function () {
                let UI_item = {};
                UI_item[`source`] = this.getAttribute(`data-store`);
                UI_item[`value`] = this.checked;
                secretariat.write(UI_item[`source`], UI_item[`value`]);
              };
              break;
            default:
              element[`event`] = function () {
                let UI_item = {};
                UI_item[`source`] = this.getAttribute(`data-store`);
                UI_item[`value`] = element[`type`].includes(`num`)
                  ? parseFloat(this.value) % 1 != 0
                    ? parseFloat(this.value)
                    : parseInt(this.value)
                  : this.value;
                secretariat.write(UI_item[`source`], UI_item[`value`]);
              };
              break;
          }

          input_element.addEventListener("change", element[`event`]);
        });
      })();
    }

    /* Make it feel more like a native window. */
    function functionality() {
      /* Adjust the interface based on events. */
      function changeUI() {
        function tabs() {
          let menus = document.querySelectorAll("menu[role=tablist]");

          if (menus) {
            menus.forEach((menu) => {
              let buttons = menu.querySelectorAll("button, a");

              if (buttons) {
                buttons.forEach((button) => {
                  let event = function () {
                    // Prevent selection.
                    let MENU = this.parentElement;
                    let BUTTONS = MENU.querySelectorAll("button, a");

                    BUTTONS.forEach((BUTTON) => {
                      BUTTON.setAttribute(
                        `aria-selected`,
                        String(
                          BUTTON.getAttribute(`for`) ==
                            this.getAttribute(`for`),
                        ),
                      );
                    });

                    let CONTAINER = document.getElementById(
                      MENU.getAttribute(`for`),
                    );
                    let SECTIONS = CONTAINER.querySelectorAll(
                      `#${CONTAINER.id} > section`,
                    );

                    SECTIONS.forEach((SECTION) => {
                      // SECTION.setAttribute(`hidden`, true);

                      if (!this.getAttribute(`for`).includes(SECTION.id)) {
                        SECTION.setAttribute(
                          `hidden`,
                          this.getAttribute(`for`).includes(SECTION.id),
                        );
                      } else {
                        SECTION.removeAttribute(`hidden`);
                      }
                    });

                    // Save.
                    (async () => {
                      const secretariat = await import(
                        chrome.runtime.getURL("scripts/secretariat.js")
                      );

                      // Write the data.
                      secretariat.write(
                        [`view`, window.location.href],
                        this.getAttribute(`for`),
                        1,
                      );
                    })();
                  };

                  button.addEventListener("click", event);
                });
              }
            });
          }
        }

        tabs();
      }

      document.addEventListener("contextmenu", (event) =>
        event.preventDefault(),
      );

      changeUI();
    }

    /* Map buttons to their corresponding action buttons. */
    function actions() {
      function links() {
        let buttons = document.querySelectorAll("button[href]");

        if (buttons) {
          buttons.forEach((button) => {
            let event = function () {
              // Get the data from the button.
              let file = {};
              file[`target`] = this.getAttribute(`href`);

              // Check if the file exists to only open it when it is the case.
              function testUrl(URL) {
                // Code from https://stackoverflow.com/questions/3646914/how-do-i-check-if-file-exists-in-jquery-or-pure-javascript
                const HTTP = new XMLHttpRequest();
                try {
                  HTTP.open(`HEAD`, URL, false);
                  HTTP.send();
                  return HTTP.status != 404;
                } catch (error) {
                  return false;
                }
              }

              if (!file[`target`].includes(`://`)) {
                // Get the current path.
                file[`path`] = window.location.pathname.split(`/`);
                file[`path`] =
                  file[`path`].slice(0, file[`path`].length - 1).join(`/`) +
                  `/`;
                file[`location`] = file[`path`].concat(file[`target`]);
              } else {
                file[`location`] = file[`target`];
              }

              let open_combinations = [``, `.htm`, `.html`];
              for (
                let open_combination = 0;
                open_combination < open_combinations.length;
                open_combination++
              ) {
                if (
                  testUrl(
                    file[`location`] + open_combinations[open_combination],
                  )
                ) {
                  new windowman(
                    file[`location`] + open_combinations[open_combination],
                    this.getAttribute(`tab-height`)
                      ? this.getAttribute(`tab-height`)
                      : null,
                    this.getAttribute(`tab-width`)
                      ? this.getAttribute(`tab-width`)
                      : null,
                  );
                  break;
                }
              }
            };
            button.addEventListener("click", event);
          });
        }
      }

      links();
    }

    /*
    Update the interface based on the storage data changes.
    */
    async function updates() {
      // Import the module.
      const secretariat = await import(
        chrome.runtime.getURL("scripts/secretariat.js")
      );

      // Get the storage data.
      let storage_data = await secretariat.read();

      async function update_interface() {
        let input_elements = document.querySelectorAll("[data-enable]");

        if (input_elements) {
          input_elements.forEach((input_element) => {
            if (input_element.getAttribute("data-enable")) {
              (async () => {
                input_element.disabled =
                  (await secretariat.read(
                    input_element.getAttribute("data-enable"),
                  )) == null ||
                  (await secretariat.read(
                    input_element.getAttribute("data-enable"),
                  ));
              })();
            }
          });
        }
      }

      // Update the input elements.
      secretariat.observe((what) => {
        update_interface();
      });

      update_interface();
    }

    storage();
    functionality();
    actions();
    updates();
  }
}

export { windowman };
