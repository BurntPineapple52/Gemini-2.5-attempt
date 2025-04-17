// DOM element utilities
export const outputDiv = document.getElementById('game-output');
export const inputEl = document.getElementById('player-input');
export const submitButton = document.getElementById('submit-button');
export const titleEl = document.querySelector('h1');

/**
 * Creates a DOM element with specified attributes
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - Key-value pairs of element attributes
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, attributes = {}) {
    const el = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent') {
            el.textContent = value;
        } else {
            el.setAttribute(key, value);
        }
    });
    return el;
}

/**
 * Creates a button element with consistent styling
 * @param {Object} options - Button configuration
 * @param {string} options.id - Button ID
 * @param {string} options.text - Button label
 * @param {function} options.onClick - Click handler
 * @returns {HTMLButtonElement} The created button
 */
export function createButton({ id, text, onClick }) {
    const btn = createElement('button', {
        id,
        class: 'game-button',
        textContent: text
    });
    btn.addEventListener('click', onClick);
    return btn;
}