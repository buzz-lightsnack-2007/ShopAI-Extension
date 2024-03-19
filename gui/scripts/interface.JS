/* interface.js
Control the interface!
*/

export default class interface {
    static define(element_type, element_content, element_id = ``, element_class = ``) {
        /* Defines a new element.

        Parameters:
            element_type: the type of the element to be inserted
            element_content: the HTML content of that element
            element_id: the element ID
            element_class: the class of the element to be inserted
        Returns: the created element
        */

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

        return (element_new);
    };

    static add(element_parent, element_type, element_content, element_id = ``, element_class = ``) {
        /* Adds or injects an element.

        Parameters:
            element_parent: The parent element
            element_type: the element type
            element_content: the content of the element
            element_id: the element id
            element_class: the element class name
        Returns: the inserted element
        */

        
    }
}
