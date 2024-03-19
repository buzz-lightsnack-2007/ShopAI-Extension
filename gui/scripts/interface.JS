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

        element_new.language.className += "class_name_to_add";
    };
}
