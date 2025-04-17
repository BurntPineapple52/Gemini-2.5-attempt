// Main game logic
import { outputDiv, titleEl, createElement } from '../domElements.js';
import { renderMiniMap, updateDiscoveredRooms } from '../miniMap.js';
import { initCommandInterface } from '../commandInterface.js';
import { gameState, generateMadLibs, addDiscoveredRoom } from '../gameState.js';
import { madLibs, badRepairAdjectives } from '../data/wordLists.js';
import { rooms } from '../data/rooms.js';
import { items } from '../data/items.js';
import { npcs } from '../data/npcs.js';
import {
    getRandomElement,
    renderTemplate,
    findItemKeyInRoom,
    findItemKeyInInventory,
    findNpcKeyInRoom,
    findInteractableKeyInRoom
} from '../utils/helpers.js';

let commandInterface;

export function startGame() {
    generateMadLibs();
    
    // Initialize UI components
    commandInterface = initCommandInterface(handleCommand);
    addDiscoveredRoom(gameState.currentLocation);
    renderMiniMap(rooms, gameState.currentLocation);
    
    showLocation();
}

// Display current location
export function showLocation() {
    const currentRoom = rooms[gameState.currentLocation];
    if (!currentRoom) {
        console.error(`Invalid room: ${gameState.currentLocation}`);
        return updateDisplay("You find yourself in a glitchy void...");
    }
    
    // Track discovered rooms
    addDiscoveredRoom(gameState.currentLocation);
    updateDiscoveredRooms(gameState.currentLocation, rooms, gameState.currentLocation);
    
    // Update available commands based on exits
    if (commandInterface) {
        commandInterface.setEnabled('north', !!currentRoom.exits.north);
        commandInterface.setEnabled('south', !!currentRoom.exits.south);
        commandInterface.setEnabled('east', !!currentRoom.exits.east);
        commandInterface.setEnabled('west', !!currentRoom.exits.west);
    }
    
    let description = renderTemplate(currentRoom.description || "A mysterious undefined space", gameState.generatedWords);
    
    // Add items in room
    if (currentRoom.items && currentRoom.items.length > 0) {
        const itemsContainer = document.getElementById('room-items');
        itemsContainer.innerHTML = '';
        
        currentRoom.items.forEach(itemKey => {
            const item = items[itemKey];
            if (item?.generatedName) {
                const itemBtn = createButton({
                    id: `item-${itemKey}`,
                    text: item.generatedName,
                    onClick: () => {
                        const target = prompt(`What do you want to use ${item.generatedName} on?`);
                        if (target) {
                            const result = item.use?.(target) || `You can't use ${item.generatedName} on ${target}`;
                            updateDisplay(result);
                        }
                    }
                });
                itemBtn.classList.add('item-button');
                itemsContainer.appendChild(itemBtn);
            }
        });
    }
    
    updateDisplay(description);
}

// Process player command from buttons
function handleCommand(action) {
    switch(action) {
        case 'north':
        case 'south':
        case 'east':
        case 'west':
            displayPlayerCommand(`go ${action}`);
            const result = movePlayer(action);
            if (result) updateDisplay(result);
            break;
        case 'look':
            displayPlayerCommand('look');
            updateDisplay(examine(''));
            break;
        case 'inventory':
            displayPlayerCommand('inventory');
            updateDisplay(showInventory());
            break;
        case 'take':
            // TODO: Implement item selection for take
            updateDisplay("Click on an item to take it");
            break;
        case 'use':
            // TODO: Implement item selection for use
            updateDisplay("Click on an item to use it");
            break;
        default:
            updateDisplay(`Action ${action} not implemented yet`);
    }
}

// Movement logic
function movePlayer(direction) {
    const currentRoom = rooms[gameState.currentLocation];
    
    // Validate current room exists
    if (!currentRoom) {
        console.error(`Invalid current room: ${gameState.currentLocation}`);
        return "You find yourself in a glitchy void...";
    }
    
    // Check if direction is valid
    if (!currentRoom.exits?.[direction]) {
        // Check blocked exits
        if (currentRoom.blockedExits?.[direction]) {
            const blockedExit = currentRoom.blockedExits[direction];
            if (blockedExit.condition && !eval(blockedExit.condition)) {
                return renderTemplate(blockedExit.message);
            }
        }
        return `You can't go ${direction} from here.`;
    }

    // Check if exit is blocked
    if (currentRoom.blockedExits?.[direction]) {
        const blockedExit = currentRoom.blockedExits[direction];
        if (blockedExit.condition && !eval(blockedExit.condition)) {
            return renderTemplate(blockedExit.message);
        }
    }

    // Move to new location
    gameState.currentLocation = currentRoom.exits[direction];
    showLocation();
    
    // Check for end game condition
    const newRoom = rooms[gameState.currentLocation];
    if (!newRoom) {
        console.error(`Invalid room: ${gameState.currentLocation}`);
        return "You find yourself in a glitchy void...";
    }
    if (newRoom.isEnd && gameState.flags.obtained_final_item) {
        endGame(true);
        return "";
    }
    
    return "";
}

// Item pickup logic
function takeItem(itemName) {
    const currentRoom = rooms[gameState.currentLocation];
    const itemKey = findItemKeyInRoom(itemName);
    
    if (!itemKey) {
        return `There is no ${itemName} here to take.`;
    }
    
    const item = items[itemKey];
    if (!item.canTake) {
        return `You can't take the ${item.generatedName}.`;
    }
    
    gameState.inventory.push(itemKey);
    currentRoom.items = currentRoom.items.filter(key => key !== itemKey);
    return renderTemplate(item.onTake);
}

// Helper to find item key in inventory by name
// Item usage logic
function useItem(target) {
    const parts = target.split(' on ');
    const itemName = parts[0];
    const targetName = parts[1];
    
    const itemKey = findItemKeyInInventory(itemName);
    if (!itemKey) {
        return `You don't have a "${itemName}" in your inventory.`;
    }
    
    const item = items[itemKey];
    
    // Handle case where item is a string (item name)
    if (typeof item === 'string') {
        const itemKey = findItemKeyInInventory(item);
        if (!itemKey) {
            return `You don't have "${item}" in your inventory.`;
        }
        item = items[itemKey];
    }

    // Check if using on an NPC
    if (targetName) {
        const npcKey = findNpcKeyInRoom(targetName);
        if (npcKey && npcs[npcKey].use) {
            return npcs[npcKey].use(item.name || item);
        }
        
        const interactableKey = findInteractableKeyInRoom(targetName);
        if (interactableKey) {
            const currentRoom = rooms[gameState.currentLocation];
            const interactable = currentRoom.interactables[interactableKey];
            if (interactable.use) {
                return interactable.use(item.name || item);
            }
        }
    }
    
    // Default item use
    if (!item) {
        return "You don't have that item.";
    }
    if (item.use) {
        return item.use(targetName || '');
    }
    
    return `You can't use the ${item.generatedName} like that.`;
}

// Examination logic
function examine(target) {
    if (!target) {
        showLocation();
        return "";
    }
    
    // Check items in room
    const itemKey = findItemKeyInRoom(target);
    if (itemKey) {
        return renderTemplate(items[itemKey].description);
    }
    
    // Check items in inventory
    const invItemKey = gameState.inventory.find(key =>
        items[key] && items[key].name.toLowerCase().includes(target.toLowerCase())
    );
    if (invItemKey && items[invItemKey]) {
        return renderTemplate(items[invItemKey].description);
    }
    
    // Check NPCs
    const npcKey = findNpcKeyInRoom(target);
    if (npcKey) {
        return npcs[npcKey].description;
    }
    
    return `You don't see a ${target} to examine.`;
}

// NPC interaction logic
function talkTo(target) {
    const npcKey = findNpcKeyInRoom(target);
    if (!npcKey) {
        return `There's no ${target} here to talk to.`;
    }
    
    const npc = npcs[npcKey];
    if (typeof npc.talk === 'function') {
        return npc.talk();
    }
    return renderTemplate(npc.talk);
}

// Inventory display
function showInventory() {
    if (gameState.inventory.length === 0) {
        return "Your inventory is empty.";
    }
    return "You are carrying: " + gameState.inventory.map(itemKey => {
        return items[itemKey].generatedName;
    }).join(", ");
}

// End game logic
function endGame(isVictory) {
    if (isVictory) {
        updateDisplay("Congratulations! You've completed your disgusting quest!");
        updateDisplay("The world is safe from the {adj_final_boss} {noun_final_boss}... for now.");
    } else {
        updateDisplay("Game over! Your journey ends here.");
    }
    
    submitButton.disabled = true;
    inputEl.disabled = true;
}

// Display helpers
function updateDisplay(text) {
    if (text) {
        outputDiv.innerHTML += `<p>${text}</p>`;
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
}

function displayPlayerCommand(command) {
    outputDiv.innerHTML += `<p class="player-command">> ${command}</p>`;
}