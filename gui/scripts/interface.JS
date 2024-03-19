/* interface.js
Control the interface!
*/

export default class UI {
    static init(element_type, element_content, element_id, element_class) {
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

        if (element_class) {
            if (Array.isArray(element_class)) {
                // for of loop
                for (const element_class_one of element_class) {
                    element_new.classList.add(element_class_one);
                }
            } else if ((typeof element_class).includes(`str`)) {
                element_new.classList.add(element_class);
            }
        };

        return (element_new);
    };

    static add(element_parent, element_new, element_placement = 1) {
        /* Adds or injects an element.

        Parameters:
            element_parent: The parent element; may be ID or the element itself
            element_placement: placement 
            element_new: the new element
        Returns: the inserted element
        */

        /* If it is the ID */
        if ((typeof element_parent).includes(`str`)) {
            element_parent = document.getElementById(element_parent);
        };

        // Add the element
        if (element_placement > 0) {
            element_parent.appendChild(element_new);
        } else if (element_placement < 0) {
            element_parent.insertBefore(element_new);
        };

        // Return the inserted element. 
        return(element_parent);
    }
}
