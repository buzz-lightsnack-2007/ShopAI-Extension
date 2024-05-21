// common.js provides the advanced data structures. 

export class Queue {
     #elements;

     constructor() {
          this.#elements = [];
     }

     enqueue(element) {
          this.#elements.push(element);
     }

     dequeue() {
          return this.#elements.shift();
     }

     isEmpty() {
          return this.#elements.length <= 0;
     }
}

export class Stack {
     #elements;

     constructor() {
          this.#elements = [];
     }

     push(element) {
          this.#elements.push(element);
     }

     pop() {
          return this.#elements.pop();
     }

     isEmpty() {
          return this.#elements.length <= 0;
     }
}