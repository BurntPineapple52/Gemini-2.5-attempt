// Items configuration
export const items = {
    'object1_key': {
        name: "{adj1} {object1}",
        description: "A truly {adj2} {object1}. It feels slightly sticky. Might be useful for jamming into a {noun2}-shaped lock.",
        canTake: true,
        onTake: "You awkwardly stuff the {adj1} {object1} into your pocket. It leaves a {liquid1} stain.",
        use: function(target) {
            if (gameState.currentLocation === 'hallway' && target === 'door') {
                if (!gameState.flags.door_unlocked) {
                    gameState.flags.door_unlocked = true;
                    return "You jam the {adj1} {object1} into the lock's {orifice1}. With a {adj3} {sound1}, the door unlocks!";
                } else {
                    return "The door is already unlocked, you {adj4} {creature1}.";
                }
            }
            return `You can't use the {adj1} {object1} on "${target}". It's not {adj5} enough.`;
        }
    },
    'object2_key': {
        name: "Legendary {object2}",
        description: "The goal of your {adj3} quest! It pulses slightly with {emotion1}.",
        canTake: true,
        onTake: "You grab the Legendary {object2}! A wave of nausea and {emotion2} washes over you."
    },
    'object3_key': {
        name: "{adj4} {object3}",
        description: "A container filled with viscous, {adj6} {object3}. It smells strongly of {liquid1}. Looks flammable or otherwise energetic.",
        canTake: true,
        isFuel: true,
        onTake: "You carefully take the container of {object3}. Don't spill this {noun3}."
    },
    'object4_key': {
        name: "Glistening {object4}",
        description: "A pile of weirdly alluring {object4}s. They make a soft {sound2} sound.",
        canTake: true,
        onTake: "You scoop up some glistening {object4}s. They feel {adj7} in your hand.",
        use: function(target) {
            const creatureTargetKey = findNpcKeyInRoom(target);
            const requiredObject = gameState.generatedWords.object4;
            const itemKey = 'object4_key';
            
            if (gameState.currentLocation === 'creature_lair' && creatureTargetKey === 'creature2_key') {
                const item = items[itemKey];
                if (gameState.inventory.includes(itemKey) && item && item.generatedName.toLowerCase().includes(requiredObject.toLowerCase())) {
                    if (!gameState.flags.creature_distracted) {
                        gameState.flags.creature_distracted = true;
                        gameState.inventory = gameState.inventory.filter(key => key !== itemKey);
                        npcs['creature2_key'].description = `The {adj7} {creature2} is now {adverb5} engrossed in the glistening ${requiredObject}s you threw, ignoring the eastern passage.`;
                        npcs['creature2_key'].talk = `It ignores you, completely focused on the ${requiredObject}s with {emotion3}.`;
                        return `You toss the ${item.generatedName} towards the {creature2}. It immediately scrambles towards them, utterly distracted by the ${requiredObject}s!`;
                    } else {
                        return `The {creature2} is already distracted by the ${requiredObject}s.`;
                    }
                } else if (gameState.inventory.includes(itemKey)) {
                    return `You wave the ${item?.generatedName || 'item'} at the {creature2}. It doesn't seem interested in that kind of {object4}. It keeps glancing at the pile of ${requiredObject}s.`;
                } else {
                    return `You don't have any {object4}s to distract the {creature2} with. It seems particularly interested in ${requiredObject}s.`;
                }
            }
            return `You can't use the {object4}s on "${target}" like that. Try using them on the {creature2} in its lair.`;
        }
    },
    'object5_key': {
        name: "Sturdy {object5}",
        description: "A length of surprisingly sturdy-looking {object5}. Smells faintly of {place3}.",
        canTake: true,
        isRepairMaterial: true,
        onTake: "You heft the {object5}. Could be useful for bridging a {noun4} or whacking a {creature1}."
    },
    'note_key': {
        name: "{adj1} Note",
        description: "A crumpled note, stained with {liquid3}. It reads: 'The {creature2} in the cave is obsessed with {object4}s. Generator requires {liquid1}-based fuel ({object3}?). Lever near cave entrance drains the {place1} below. Don't forget the {noun5}! - Dr. {noun1}'",
        canTake: true,
        onTake: "You take the {adj1} note. Might be useful, or just {adj2}."
    },
    'lab_key': {
        name: "{adj1} Lab Key",
        description: "A {adj2} keycard with a faded 'LAB' label. It's covered in {gunk1}.",
        canTake: true,
        onTake: "You pocket the lab key. It leaves a {liquid1} stain on your {body_part1}."
    },
    'final_item_key': {
        name: "Pulsating {noun_final_boss} {body_part_final}",
        description: "The {adj_final_boss} core of the creature. It {verb_final_boss}s {adverb_final} in your hand.",
        canTake: true,
        onTake: "You grab the {body_part_final}! You've defeated the source! Or maybe just angered its {noun1}. Time to leave!",
        use: function(target) { return "You wave the {body_part_final} around. It makes you feel {emotion4}."; }
    }
};