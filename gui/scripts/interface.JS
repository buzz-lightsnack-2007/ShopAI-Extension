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
            // array logic
        } else if (typeof element_class == 'string') {
            element_new.classList.add(element_class);
        }
    };
}
