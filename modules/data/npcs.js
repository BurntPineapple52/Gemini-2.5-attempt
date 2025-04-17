// NPCs configuration
export const npcs = {
    'creature1_key': {
        name: "{adj2} {creature1}",
        description: "A {adj2} {creature1} eyes you warily near the east door. It seems to be guarding it with its {body_part1}.",
        talk: function() {
            if (gameState.flags.creature1_pacified) {
                return "The {creature1} now seems docile, almost {adverb1}. It ignores the door.";
            }

            const requiredNoun = gameState.generatedWords.noun1;
            let foundPacifyingItem = false;
            let pacifyingItemName = "";

            for (const itemKey of gameState.inventory) {
                const item = items[itemKey];
                if (item && item.generatedName && item.generatedName.toLowerCase().includes(requiredNoun.toLowerCase())) {
                    foundPacifyingItem = true;
                    pacifyingItemName = item.generatedName;
                    break;
                }
            }

            if (foundPacifyingItem) {
                gameState.flags.creature1_pacified = true;
                gameState.flags.door_unlocked = true;
                this.description = `The {adj2} {creature1} looks at the ${pacifyingItemName} with {emotion1} and seems completely calm. It no longer guards the door.`;
                return `You talk to the {creature1}. As it notices the ${pacifyingItemName} you're carrying (which reminds it of a {noun1}), its demeanor changes {adverb3}. It becomes calm and steps away from the east door, which clicks open!`;
            } else {
                return "The {creature1} just {verb1_present}s {adverb2}. It seems agitated. It keeps glancing towards the east door. Maybe something like a {noun1} would calm it?";
            }
        }
    },
    'creature2_key': {
        name: "{adj7} {creature2}",
        description: "A truly massive {creature2}, blocking the way east. It seems agitated, its {body_part3} twitching with {emotion3}.",
        talk: "It lets out a threatening {sound3} that smells like {place2}. It clearly doesn't want you going east."
    },
    'creature3_key': {
        name: "{adj5} {creature3}",
        description: "Strapped to a metal table, this {creature3} looks like a failed experiment. Tubes run into its {orifice1}, pumping {liquid3}.",
        talk: "It just makes a wet {sound4} sound and twitches its {body_part4}. You feel a surge of {emotion5}."
    },
    'final_boss_key': {
        name: "Pulsating {noun_final_boss}",
        description: "The source of the {adj_final_boss} energy in this place! It fills the chamber, {verb_final_boss}ing {adverb_final}.",
        talk: "Talking to it seems... unwise. It radiates pure {emotion_boss}.",
        use: function(itemName) {
            let itemKey = findItemKeyInInventory(itemName);
            if (itemKey === 'object2_key') {
                updateDisplay("You hold aloft the Legendary {object2}! It reacts {adverb_final} with the {noun_final_boss}, causing it to {verb_boss_death} violently!");
                updateDisplay("With a final {sound_boss_death}, the creature collapses into a pile of {gunk_boss_death}!");
                rooms[gameState.currentLocation].npcs = rooms[gameState.currentLocation].npcs.filter(key => key !== 'final_boss_key');
                rooms[gameState.currentLocation].items.push('final_item_key');
                updateDisplay("Amidst the remains, you spot its Pulsating {noun_final_boss} {body_part_final}!");
                rooms[gameState.currentLocation].description += " The chamber is now still, coated in {gunk_boss_death}.";
                return "Victory!";
            } else if (itemKey) {
                return `You try using the ${items[itemKey].generatedName} on the {noun_final_boss}. It seems {adverb4} ineffective!`;
            } else {
                return "Use WHAT on the {noun_final_boss}? Your {body_part1}?";
            }
        }
    }
};