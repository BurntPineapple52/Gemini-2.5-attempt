/**
 * Command Interface module - handles button-based command input
 */

const commandInterface = {
    /**
     * Enables/disables a command button
     * @param {string} command - Command name (e.g. 'north')
     * @param {boolean} enabled - Whether to enable the command
     */
    setEnabled(command, enabled) {
        const button = document.querySelector(`.command-btn[data-action="${command}"]`);
        if (button) {
            button.disabled = !enabled;
        }
    }
};

/**
 * Initializes the command interface buttons
 * @param {Function} commandHandler - Function to call when a command is triggered
 * @returns {Object} The command interface object
 */
export function initCommandInterface(commandHandler) {
    const buttons = document.querySelectorAll('.command-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            commandHandler(action);
        });
    });

    // Add keyboard shortcuts for movement
    document.addEventListener('keydown', (e) => {
        let action = null;
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': action = 'north'; break;
            case 's': case 'arrowdown': action = 'south'; break;
            case 'a': case 'arrowleft': action = 'west'; break;
            case 'd': case 'arrowright': action = 'east'; break;
            case 'l': action = 'look'; break;
            case 'i': action = 'inventory'; break;
            case 't': action = 'take'; break;
            case 'u': action = 'use'; break;
        }

        if (action) {
            e.preventDefault();
            commandHandler(action);
        }
    });

    return commandInterface;
}