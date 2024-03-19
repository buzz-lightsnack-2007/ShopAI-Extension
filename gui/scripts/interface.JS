/* interface.js
Control the interface!
*/

export default class interface {
    function define(element_type, element_content, element_id = ``, element_class = ``) {
        /* Defines a new element. */

        let element_new = document.createElement(element_type);
        element_new.innerHTML = element_content;

        // Add an ID attribute.
        if (element_id) {
            element_new.id = element_id;
        };

        if (Array.isArray(element_class)) {
            // for of loop
            for (const element_class_one of element_class) {
                element_new.classList.add(element_class_one);
            }
        } else if ((typeof element_class).includes(`str`)) {
            element_new.classList.add(element_class);
        }
    };
}
