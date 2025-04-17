/**
 * Returns a random element from an array
 * @param {Array} arr - The array to select from
 * @returns {*} A random element from the array
 */
export function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Finds an interactable key in a room object
 * @param {Object} room - The room object to search
 * @returns {string|null} The key if found, null otherwise
 */
export function findInteractableKeyInRoom(room) {
    for (const key in room) {
        if (typeof room[key] === 'object' && room[key].interactable) {
            return key;
        }
    }
    return null;
}

/**
 * Finds an item key in a room object
 * @param {Object} room - The room object to search
 * @returns {string|null} The key if found, null otherwise
 */
export function findItemKeyInRoom(room) {
    for (const key in room) {
        if (typeof room[key] === 'object' && room[key].isItem) {
            return key;
        }
    }
    return null;
}

/**
 * Finds an item key in inventory
 * @param {Object} inventory - The inventory object to search
 * @param {string} itemName - The item name to find
 * @returns {string|null} The key if found, null otherwise
 */
export function findItemKeyInInventory(inventory, itemName) {
    for (const key in inventory) {
        if (inventory[key].name === itemName) {
            return key;
        }
    }
    return null;
}

/**
 * Finds an NPC key in a room object
 * @param {Object} room - The room object to search
 * @returns {string|null} The key if found, null otherwise
 */
export function findNpcKeyInRoom(room) {
    for (const key in room) {
        if (typeof room[key] === 'object' && room[key].isNpc) {
            return key;
        }
    }
    return null;
}

/**
 * Renders a template string with provided data
 * @param {string} template - The template string
 * @param {Object} data - The data to interpolate
 * @returns {string} The rendered string
 */
export function renderTemplate(template, data) {
    if (!data) {
        throw new Error('renderTemplate requires data parameter');
    }
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
}