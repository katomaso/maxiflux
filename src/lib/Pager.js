class Pager extends HTMLElement {
    constructor() {
      // Always call super first in constructor
      super();
  
      // Create a shadow root
      const shadow = this.attachShadow({mode: 'open'});
  
      // Create text node and add word count to it
      const text = document.createElement('span');
      shadow.appendChild(text);  
    }
}

customElements.define('page-mover', Pager);