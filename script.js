// --- DOM Elements ---
const outputDiv = document.getElementById('game-output');
const inputEl = document.getElementById('player-input');
const submitButton = document.getElementById('submit-button');
const titleEl = document.querySelector('h1'); // Get the h1 element

// --- Procedural Generation Word Lists (EXPANDED!) ---
const madLibs = {
    nouns: ["buttock", "fart", "nipple", "sphincter", "scrotum", "discharge", "phlegm", "gunk", "sludge", "orifice", "polyp", "growth", "smegma", "pus", "bile", "chode", "gooch"],
    adjectives: ["moist", "crusty", "throbbing", "leaky", "pungent", "flaccid", "glistening", "putrid", "swollen", "hairy", "viscous", "engorged", "soggy", "fetid", "rancid", "weeping", "bulbous"],
    verbs_present: ["licks", "probes", "fondles", "oozes", "squishes", "defecates", "penetrates", "festers", "vibrates", "expels", "suppurates", "undulates", "secretes", "quivers", "farts"],
    verbs_past: ["licked", "probed", "fondled", "oozed", "squished", "defecated", "penetrated", "festered", "vibrated", "expelled", "suppurated", "undulated", "secreted", "quivered", "farted"],
    places: ["cesspit", "armpit", "latrine", "abattoir", "groin", "sewer", "bog", "dumpster", "underbelly", "crevice", "colon", "bladder", "wound", "abscess", "boil"],
    objects: ["suppository", "enema kit", "used condom", "clump of hair", "jar of spit", "severed toe", "fossilized turd", "rusty spork", "damp rag", "mysterious stain", "petrified vomit", "prolapse", "kidney stone", "infected piercing", "scab"],
    creatures: ["goblin", "maggot", "slug", "mutant", "thing", "horror", "abomination", "parasite", "leech", "gremlin", "cockroach", "tapeworm", "hemorrhoid", "tumor", "cyst"],
    body_parts: ["elbow", "nostril", "earlobe", "belly button", "knuckle", "toe", "eyelid", "tongue", "uvula", "appendix", "tonsil", "gallbladder", "spleen", "taint", "areola"],
    liquids: ["urine", "semen", "vomit", "diarrhea", "blood", "mucus", "sweat", "lymph fluid", "ichor", "slurry", "brine", "discharge"],
    sounds: ["squelch", "gurgle", "fart", "belch", "splatter", "hiss", "moan", "drip", "plop", "screech", "wheeze", "throb"],
    adverbs: ["painfully", "lovingly", "sloppily", "aggressively", "tenderly", "reluctantly", "vigorously", "limply", "moistly", "noisily"],
    emotions: ["rage", "lust", "ennui", "despair", "confusion", "glee", "terror", "indifference", "arousal", "disgust"]
};

// Adjectives that might make bridge repair fail
const badRepairAdjectives = ["soggy", "limp", "flaccid", "leaky", "moist", "viscous", "weeping", "putrid", "rancid"];

// --- Game State ---
let gameState = {
    currentLocation: 'start',
    inventory: [],
    generatedWords: {}, // To store the randomly chosen words for this run
    flags: { // More flags for complex state
        'door_unlocked': false,
        'lever_pulled': false,
        'creature_distracted': false,
        'bridge_repaired': false,
        'generator_on': false,
        'obtained_final_item': false,
        'creature1_pacified': false // Added flag for hallway creature state
    }
};

// --- Game Data (Rooms, Items, NPCs - EXPANDED) ---
const rooms = {
    'start': {
        description: "You awaken in a {adj1} {place1}. The air smells {adverb1} of {noun1} and {emotion1}. A path leads north into darkness. West, you see a flickering light. On the ground lies a {object1}.",
        exits: { 'north': 'hallway', 'west': 'lab_entrance' },
        items: ['object1_key']
    },
    'hallway': {
        description: "A narrow hallway stretches north. It feels {adj2} and unnerving. A sturdy door blocks the way east. To the south is the {place1} you started in. A strange {creature1} {verb1_present} {adverb2} in the corner near the east door.",
        exits: { 'south': 'start', 'east': 'treasure_room', 'north': 'cave_entrance' },
        blockedExits: {
            'east': { condition: '!door_unlocked', message: "The door is locked. It looks like it needs some kind of {noun2} shoved into its {orifice1}." }
        },
        npcs: ['creature1_key']
    },
    'treasure_room': {
        description: "This small room contains a pedestal. Upon it rests the legendary {object2}! It {verb2_present} with a {adj3} energy. You feel a strange urge to rub it on your {body_part1}. A faint {sound1} echoes from the west.",
        exits: { 'west': 'hallway' },
        items: ['object2_key']
        // Note: Getting object2 might not be the *only* goal anymore
    },
    'cave_entrance': {
        description: "The hallway ends at the mouth of a dripping cave. The air is thick with the smell of {liquid1} and {adj4} {noun3}. The path descends north into the gloom. South leads back the way you came. A rusty lever is set into the wall here.",
        exits: { 'south': 'hallway', 'north': 'cave_passage' },
        interactables: { // Things you can 'use'/'pull'/etc. that aren't items
            'lever': {
                description: "A rusty metal lever, covered in {gunk1}.",
                use: function() {
                    if (!gameState.flags.lever_pulled) {
                        gameState.flags.lever_pulled = true;
                        // Potentially affect another room
                        if (rooms['cave_passage']) { // Check if room exists before modifying
                             rooms['cave_passage'].description += " You hear a distant {sound2} like a {noun4} being {verb1_past}.";
                        }
                         if (rooms['flooded_cavern']) {
                            rooms['flooded_cavern'].description = rooms['flooded_cavern'].description_drained; // Change description
                            rooms['flooded_cavern'].exits['down'] = 'deep_cavern'; // Add new exit
                        }
                        return "You pull the lever with a {adj5} {sound1}. It grinds {adverb3}.";
                    } else {
                        return "The lever is already pulled. Yanking it more just makes your {body_part2} feel {adj1}.";
                    }
                }
            }
        }
    },
    'cave_passage': {
        description: "A winding passage through {adj5} rock. Water drips constantly, forming puddles of {liquid2}. It continues north deeper into the earth, and slopes down to the east. West seems to be a dead end, filled with {noun4} bones.",
        exits: { 'south': 'cave_entrance', 'north': 'creature_lair', 'east': 'flooded_cavern' }
    },
     'flooded_cavern': {
        description: "This cavern is partially flooded with murky, {adj6} {liquid3}. It's hard to see the bottom. The passage leads back west. If only the water level was lower...",
        description_drained: "The cavern is now drained, revealing a slimy ladder leading down! The passage leads back west. The floor is coated in a film of {noun5}.", // Revealed after lever pull
        exits: { 'west': 'cave_passage' },
        // 'down' exit added dynamically by lever pull
    },
    'deep_cavern': {
        description: "You climb down the {adj1} ladder into a deeper section of the cave. It smells strongly of {place2} here. There's a strange, humming generator in the corner, currently silent. A path leads south.",
        exits: { 'up': 'flooded_cavern', 'south': 'final_chamber_approach' },
        items: ['object3_key'], // Fuel maybe?
        interactables: {
            'generator': {
                description: "A bulky, greasy generator. It looks like it needs some kind of {liquid1} fuel.",
                use: function(itemName) { // Expects 'use [item] on generator'
                    let itemKey = findItemKeyInInventory(itemName);
                    // --- MODIFICATION START ---
                    // Check if the item is the correct key AND its generated name contains the required liquid
                    const requiredLiquid = gameState.generatedWords.liquid1;
                    const item = items[itemKey];
                    if (itemKey === 'object3_key' && item && item.generatedName.toLowerCase().includes(requiredLiquid.toLowerCase())) {
                    // --- MODIFICATION END ---
                         if (!gameState.flags.generator_on) {
                            gameState.flags.generator_on = true;
                            gameState.inventory = gameState.inventory.filter(key => key !== itemKey); // Consume fuel
                            // Affect another room/event
                             if (rooms['final_chamber_approach']) {
                                rooms['final_chamber_approach'].description += " A light flickers on to the south, revealing the path more clearly.";
                            }
                             if (rooms['final_chamber']) {
                                rooms['final_chamber'].description = rooms['final_chamber'].description_lit;
                                rooms['final_chamber'].npcs = ['final_boss_key']; // Boss appears when lit?
                            }
                            return "You pour the {adj4} {object3} into the generator. It sputters with a {sound3} and {adverb4} hums to life!";
                        } else {
                            return "The generator is already running, making a {adj5} noise.";
                        }
                    } else if (itemKey) {
                        // --- MODIFICATION START ---
                        // Updated failure message to be more specific
                        const requiredLiquid = gameState.generatedWords.liquid1;
                        return `You try to use the ${item.generatedName} on the generator. It sputters {adverb3}. It doesn't seem to be the right kind of fuel. The label mentions needing something like '{liquid1}'.`;
                        // --- MODIFICATION END ---
                    } else {
                        return "Use what on the generator? You need some kind of fuel, you {noun1}. Specifically, something containing '{liquid1}'.";
                    }
                }
            }
        }
    },
    'creature_lair': {
        // --- MODIFICATION START ---
        // Hint at the specific object the creature desires
        description: "This wider cave serves as a lair for a massive, {adj7} {creature2}. It seems agitated and blocks the only other exit to the east. It keeps glancing {adverb1} at a pile of glistening {object4}s in the corner. The passage south leads back.",
        // --- MODIFICATION END ---
        exits: { 'south': 'cave_passage', 'east': 'bridge_gap' },
        npcs: ['creature2_key'],
        items: ['object4_key'], // The distracting item
        blockedExits: {
            'east': { condition: '!creature_distracted', message: "The {adj7} {creature2} blocks the way east, {verb3_present} its {body_part3} menacingly." }
        }
    },
    'bridge_gap': {
        description: "A chasm cuts through the cave here, {adverb5} deep. A rickety, broken rope bridge hangs precariously. The other side (east) looks like it leads somewhere important. The {creature2}'s lair is west.",
        exits: { 'west': 'creature_lair', 'east': 'lab_back_entrance' },
        items: ['object5_key'], // Rope/planks?
        blockedExits: {
            'east': { condition: '!bridge_repaired', message: "The bridge is broken. You'd need something like a {object5} to fix this {adj1} mess." }
        },
        interactables: {
            'bridge': {
                description: "A broken rope bridge. Looks {adj2}.",
                use: function(itemName) {
                    let itemKey = findItemKeyInInventory(itemName);
                    const item = items[itemKey]; // Get item details
                    if (itemKey === 'object5_key' && item && item.isRepairMaterial) {
                        if (!gameState.flags.bridge_repaired) {
                            // --- MODIFICATION START ---
                            // Check if the generated adjective implies weakness and add failure chance
                            const repairAdjective = gameState.generatedWords.adj3;
                            const isBadAdjective = badRepairAdjectives.includes(repairAdjective);
                            const repairFails = isBadAdjective && Math.random() < 0.5; // 50% chance of failure if adjective is bad

                            gameState.inventory = gameState.inventory.filter(key => key !== itemKey); // Consume item regardless of success/failure

                            if (repairFails) {
                                return `You try to fix the bridge with the ${item.generatedName}, but it feels too {adj3}. The {object5} snaps {adverb2} and falls into the chasm! The bridge remains broken.`;
                            } else {
                                gameState.flags.bridge_repaired = true;
                                return `Using the ${item.generatedName}, you {adverb1} manage to patch the bridge. It looks {adj3}, but might hold.`;
                            }
                            // --- MODIFICATION END ---
                        } else {
                            return "The bridge is already repaired (sort of).";
                        }
                    } else if (itemKey) {
                        return `You can't fix the bridge with a ${items[itemKey].generatedName}. You need something sturdy, like a {object5}.`;
                    } else {
                        return "Use what on the bridge? Your {emotion1} won't fix it.";
                    }
                }
            }
        }
    },
    'lab_entrance': {
        description: "A flickering neon sign reads 'Dr. {noun1}'s {adj4} Experiments'. The entrance is a rusty metal door, slightly ajar. East leads back to the starting {place1}. North enters the lab proper.",
        exits: { 'east': 'start', 'north': 'main_lab' }
    },
    'main_lab': {
        description: "Wires hang like {noun2}s from the ceiling. Beakers bubble with {adj5} {liquid2}. A strange {creature3} sits strapped to a table, occasionally twitching. Exits lead south (entrance), west (storage), and east (observation).",
        exits: { 'south': 'lab_entrance', 'west': 'lab_storage', 'east': 'lab_observation' },
        npcs: ['creature3_key'] // Maybe talk to it?
    },
    'lab_storage': {
        description: "Shelves line the walls, filled with jars containing preserved {body_part4}s and various bits of {gunk1}. One shelf holds a sturdy-looking {object5}. The only exit is east.",
        exits: { 'east': 'main_lab' },
        items: ['object5_key'] // Item needed for bridge
    },
    'lab_observation': {
        description: "A one-way mirror looks into the main lab (west). Control panels spark {adverb2}. A note is pinned to the wall. A door leads east, towards the back.",
        exits: { 'west': 'main_lab', 'east': 'lab_back_entrance' },
        items: ['note_key']
    },
    'lab_back_entrance': {
        description: "This seems to be a rear exit or supply entrance for the lab. It's damp and smells of {place3}. A sturdy door leads west, back into the lab complex. To the east, a recently repaired bridge crosses a chasm.",
        exits: { 'west': 'lab_observation', 'east': 'bridge_gap' },
         blockedExits: { // Need the bridge repaired from the *other* side
            'east': { condition: '!bridge_repaired', message: "The bridge is out. Someone would have to fix it from the cave side." }
        }
    },
     'final_chamber_approach': {
        description: "A narrow passage leading south. It's eerily quiet, except for the distant hum of the generator (if on). The air tastes like {noun5}.",
        exits: { 'north': 'deep_cavern', 'south': 'final_chamber' },
         blockedExits: {
            'south': { condition: '!generator_on', message: "It's too dark to proceed south. That generator might light the way..." }
        }
    },
    'final_chamber': {
        description: "It's pitch black. You can hear a faint {sound4} nearby.", // Initial state
        description_lit: "The generator lights reveal a large chamber dominated by a pulsating {noun_final_boss}. It {verb_final_boss} menacingly! This must be the source of all the {adj_final_boss} weirdness!", // Lit state
        exits: { 'north': 'final_chamber_approach' },
        // NPC 'final_boss_key' added dynamically when generator is on
        isEnd: true // Reaching here (and maybe defeating boss/taking item) is an end condition
    }
    // Add more rooms as desired
};

const items = {
    'object1_key': {
        name: "{adj1} {object1}",
        description: "A truly {adj2} {object1}. It feels slightly sticky. Might be useful for jamming into a {noun2}-shaped lock.",
        canTake: true,
        onTake: "You awkwardly stuff the {adj1} {object1} into your pocket. It leaves a {liquid1} stain.",
        use: function(target) {
            if (gameState.currentLocation === 'hallway' && target === 'door') {
                if (gameState.inventory.includes('object1_key')) {
                    if (!gameState.flags.door_unlocked) {
                        gameState.flags.door_unlocked = true;
                        // Remove the item after use if desired? Maybe keep the gross key.
                        // gameState.inventory = gameState.inventory.filter(item => item !== 'object1_key');
                        return "You jam the {adj1} {object1} into the lock's {orifice1}. With a {adj3} {sound1}, the door unlocks!";
                    } else {
                        return "The door is already unlocked, you {adj4} {creature1}.";
                    }
                }
            }
            // Allow using it on the creature?
             if (gameState.currentLocation === 'hallway' && target === npcs['creature1_key']?.generatedName.toLowerCase()) {
                 return "You wave the {adj1} {object1} at the {creature1}. It just {verb1_present}s {adverb2}."
             }
            return `You can't use the {adj1} {object1} on "${target}". It's not {adj5} enough.`;
        }
    },
    'object2_key': {
        name: "Legendary {object2}",
        description: "The goal of your {adj3} quest! It pulses slightly with {emotion1}.",
        canTake: true,
        onTake: "You grab the Legendary {object2}! A wave of nausea and {emotion2} washes over you."
        // Maybe taking this triggers something?
    },
    'object3_key': { // Fuel for generator
        name: "{adj4} {object3}",
        description: "A container filled with viscous, {adj6} {object3}. It smells strongly of {liquid1}. Looks flammable or otherwise energetic.",
        canTake: true,
        isFuel: true, // Custom flag for identification
        onTake: "You carefully take the container of {object3}. Don't spill this {noun3}."
    },
    'object4_key': { // Distraction item
        name: "Glistening {object4}",
        description: "A pile of weirdly alluring {object4}s. They make a soft {sound2} sound.",
        canTake: true, // Maybe you take one, not the whole pile? Let's say you take 'some'.
        onTake: "You scoop up some glistening {object4}s. They feel {adj7} in your hand.",
        use: function(target) {
            // Use it on the creature in the lair
            // --- MODIFICATION START ---
            // Check if the target is the correct creature
            const creatureTargetKey = findNpcKeyInRoom(target);
            const requiredObject = gameState.generatedWords.object4; // The specific object the creature wants
            const itemKey = 'object4_key'; // The key for the distraction item type

            if (gameState.currentLocation === 'creature_lair' && creatureTargetKey === 'creature2_key') {
                 // Check if player HAS the item AND if its generated name matches the required object
                 const item = items[itemKey];
                 if (gameState.inventory.includes(itemKey) && item && item.generatedName.toLowerCase().includes(requiredObject.toLowerCase())) {
                     if (!gameState.flags.creature_distracted) {
                        gameState.flags.creature_distracted = true;
                        gameState.inventory = gameState.inventory.filter(key => key !== itemKey); // Consume item
                        // Update creature's state/description, referencing the specific object
                        npcs['creature2_key'].description = `The {adj7} {creature2} is now {adverb5} engrossed in the glistening ${requiredObject}s you threw, ignoring the eastern passage.`;
                        npcs['creature2_key'].talk = `It ignores you, completely focused on the ${requiredObject}s with {emotion3}.`;
                        return `You toss the ${item.generatedName} towards the {creature2}. It immediately scrambles towards them, utterly distracted by the ${requiredObject}s!`;
                     } else {
                         return `The {creature2} is already distracted by the ${requiredObject}s.`;
            // --- MODIFICATION END ---
                     }
                 // --- CORRECTION START ---
                 // Moved the failure cases inside the location/NPC check
                 } else if (gameState.inventory.includes(itemKey)) {
                     // Player has the item, but it's the wrong *type* for this creature this run
                     const item = items[itemKey];
                     return `You wave the ${item?.generatedName || 'item'} at the {creature2}. It doesn't seem interested in that kind of {object4}. It keeps glancing at the pile of ${requiredObject}s.`;
                 } else {
                     // Player doesn't have the item
                     return `You don't have any {object4}s to distract the {creature2} with. It seems particularly interested in ${requiredObject}s.`;
                 }
                 // --- CORRECTION END ---
            }
            // --- CORRECTION START ---
            // Moved the fallback return to be the last statement inside the function
            return `You can't use the {object4}s on "${target}" like that. Try using them on the {creature2} in its lair.`;
            // --- CORRECTION END ---
        }
    },
    'object5_key': { // Bridge repair item
        name: "Sturdy {object5}",
        description: "A length of surprisingly sturdy-looking {object5}. Smells faintly of {place3}.",
        canTake: true,
        isRepairMaterial: true, // Custom flag
        onTake: "You heft the {object5}. Could be useful for bridging a {noun4} or whacking a {creature1}."
        // Use handled by the 'bridge' interactable
    },
    'note_key': {
        name: "{adj1} Note",
        description: "A crumpled note, stained with {liquid3}. It reads: 'The {creature2} in the cave is obsessed with {object4}s. Generator requires {liquid1}-based fuel ({object3}?). Lever near cave entrance drains the {place1} below. Don't forget the {noun5}! - Dr. {noun1}'",
        canTake: true,
        onTake: "You take the {adj1} note. Might be useful, or just {adj2}."
    },
     'final_item_key': { // Example: Item dropped by boss or found in final room
        name: "Pulsating {noun_final_boss} {body_part_final}",
        description: "The {adj_final_boss} core of the creature. It {verb_final_boss}s {adverb_final} in your hand.",
        canTake: true,
        onTake: "You grab the {body_part_final}! You've defeated the source! Or maybe just angered its {noun1}. Time to leave!",
        use: function(target) { return "You wave the {body_part_final} around. It makes you feel {emotion4}."; }
    }
    // Add more items
};

const npcs = {
    'creature1_key': {
        name: "{adj2} {creature1}",
        description: "A {adj2} {creature1} eyes you warily near the east door. It seems to be guarding it with its {body_part1}.",
        talk: function() { // Changed from string to function
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
                    break; // Found one, no need to check further
                }
            }

            if (foundPacifyingItem) {
                gameState.flags.creature1_pacified = true;
                gameState.flags.door_unlocked = true; // Pacifying it also unlocks the door

                // Update the NPC state permanently for this run
                this.description = `The {adj2} {creature1} looks at the ${pacifyingItemName} with {emotion1} and seems completely calm. It no longer guards the door.`;
                // 'this' refers to the creature1_key object itself here

                return `You talk to the {creature1}. As it notices the ${pacifyingItemName} you're carrying (which reminds it of a {noun1}), its demeanor changes {adverb3}. It becomes calm and steps away from the east door, which clicks open!`;
            } else {
                // Original behavior if no pacifying item is found
                return "The {creature1} just {verb1_present}s {adverb2}. It seems agitated. It keeps glancing towards the east door. Maybe something like a {noun1} would calm it?";
            }
        }
    },
    'creature2_key': { // The one guarding the bridge gap
        name: "{adj7} {creature2}",
        description: "A truly massive {creature2}, blocking the way east. It seems agitated, its {body_part3} twitching with {emotion3}.",
        talk: "It lets out a threatening {sound3} that smells like {place2}. It clearly doesn't want you going east."
        // State changes when distracted via item use
    },
    'creature3_key': { // Lab experiment
        name: "{adj5} {creature3}",
        description: "Strapped to a metal table, this {creature3} looks like a failed experiment. Tubes run into its {orifice1}, pumping {liquid3}.",
        talk: "It just makes a wet {sound4} sound and twitches its {body_part4}. You feel a surge of {emotion5}."
    },
    'final_boss_key': { // Added dynamically
        name: "Pulsating {noun_final_boss}",
        description: "The source of the {adj_final_boss} energy in this place! It fills the chamber, {verb_final_boss}ing {adverb_final}.",
        talk: "Talking to it seems... unwise. It radiates pure {emotion_boss}.",
        // Add combat logic here later if desired. For now, maybe 'using' something on it?
        use: function(itemName) { // Allow 'use [item] on [boss]'
            let itemKey = findItemKeyInInventory(itemName);
             if (itemKey === 'object2_key') { // Using the legendary item on it?
                // Defeat the boss!
                updateDisplay("You hold aloft the Legendary {object2}! It reacts {adverb_final} with the {noun_final_boss}, causing it to {verb_boss_death} violently!");
                updateDisplay("With a final {sound_boss_death}, the creature collapses into a pile of {gunk_boss_death}!");
                // Remove boss NPC
                rooms[gameState.currentLocation].npcs = rooms[gameState.currentLocation].npcs.filter(key => key !== 'final_boss_key');
                // Drop the final item
                rooms[gameState.currentLocation].items.push('final_item_key');
                updateDisplay("Amidst the remains, you spot its Pulsating {noun_final_boss} {body_part_final}!");
                // Update room description maybe?
                rooms[gameState.currentLocation].description += " The chamber is now still, coated in {gunk_boss_death}.";

                return "Victory!"; // Return message handled above
            } else if (itemKey) {
                return `You try using the ${items[itemKey].generatedName} on the {noun_final_boss}. It seems {adverb4} ineffective!`;
            } else {
                return "Use WHAT on the {noun_final_boss}? Your {body_part1}?";
            }
        }
    }
    // Add more npcs
};


// --- Helper Functions ---

// Get a random element from an array
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return "[MISSING WORD]";
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate the Mad Libs words for this game run (EXPANDED)
function generateMadLibs() {
    gameState.generatedWords = {
        noun1: getRandomElement(madLibs.nouns),
        noun2: getRandomElement(madLibs.nouns),
        noun3: getRandomElement(madLibs.nouns),
        noun4: getRandomElement(madLibs.nouns),
        noun5: getRandomElement(madLibs.nouns),
        adj1: getRandomElement(madLibs.adjectives),
        adj2: getRandomElement(madLibs.adjectives),
        adj3: getRandomElement(madLibs.adjectives),
        adj4: getRandomElement(madLibs.adjectives),
        adj5: getRandomElement(madLibs.adjectives),
        adj6: getRandomElement(madLibs.adjectives),
        adj7: getRandomElement(madLibs.adjectives),
        verb1_present: getRandomElement(madLibs.verbs_present),
        verb2_present: getRandomElement(madLibs.verbs_present),
        verb3_present: getRandomElement(madLibs.verbs_present),
        verb1_past: getRandomElement(madLibs.verbs_past),
        place1: getRandomElement(madLibs.places),
        place2: getRandomElement(madLibs.places),
        place3: getRandomElement(madLibs.places),
        object1: getRandomElement(madLibs.objects),
        object2: getRandomElement(madLibs.objects),
        object3: getRandomElement(madLibs.objects),
        object4: getRandomElement(madLibs.objects),
        object5: getRandomElement(madLibs.objects),
        creature1: getRandomElement(madLibs.creatures),
        creature2: getRandomElement(madLibs.creatures),
        creature3: getRandomElement(madLibs.creatures),
        body_part1: getRandomElement(madLibs.body_parts),
        body_part2: getRandomElement(madLibs.body_parts),
        body_part3: getRandomElement(madLibs.body_parts),
        body_part4: getRandomElement(madLibs.body_parts),
        liquid1: getRandomElement(madLibs.liquids),
        liquid2: getRandomElement(madLibs.liquids),
        liquid3: getRandomElement(madLibs.liquids),
        sound1: getRandomElement(madLibs.sounds),
        sound2: getRandomElement(madLibs.sounds),
        sound3: getRandomElement(madLibs.sounds),
        sound4: getRandomElement(madLibs.sounds),
        adverb1: getRandomElement(madLibs.adverbs),
        adverb2: getRandomElement(madLibs.adverbs),
        adverb3: getRandomElement(madLibs.adverbs),
        adverb4: getRandomElement(madLibs.adverbs),
        adverb5: getRandomElement(madLibs.adverbs),
        emotion1: getRandomElement(madLibs.emotions),
        emotion2: getRandomElement(madLibs.emotions),
        emotion3: getRandomElement(madLibs.emotions),
        emotion4: getRandomElement(madLibs.emotions),
        emotion5: getRandomElement(madLibs.emotions),
        gunk1: getRandomElement(madLibs.nouns), // Re-use lists for variety
        orifice1: getRandomElement(madLibs.body_parts), // Or specific orifice list

        // Words for the final boss/area
        noun_final_boss: getRandomElement(madLibs.creatures),
        adj_final_boss: getRandomElement(madLibs.adjectives),
        verb_final_boss: getRandomElement(madLibs.verbs_present),
        adverb_final: getRandomElement(madLibs.adverbs),
        emotion_boss: getRandomElement(madLibs.emotions),
        body_part_final: getRandomElement(madLibs.body_parts), // What you get from it
        verb_boss_death: getRandomElement(madLibs.verbs_past),
        sound_boss_death: getRandomElement(madLibs.sounds),
        gunk_boss_death: getRandomElement(madLibs.liquids), // What's left behind
    };

    // Generate a title too
    gameState.generatedWords.title = `${gameState.generatedWords.adj1} ${gameState.generatedWords.noun1}`;
    titleEl.textContent = `The ${gameState.generatedWords.adverb1} Offensive Adventure of the ${gameState.generatedWords.title}`;

    // Pre-process item names based on generated words
    for (const key in items) {
        items[key].generatedName = renderTemplate(items[key].name);
    }
     // Pre-process NPC names
     for (const key in npcs) {
        // Ensure NPC exists before trying to access name
        if (npcs[key] && npcs[key].name) {
            npcs[key].generatedName = renderTemplate(npcs[key].name);
        } else if (key !== 'final_boss_key') { // Don't warn for dynamically added boss yet
             console.warn(`NPC key '${key}' found in room data but not defined in npcs object or missing name.`);
        }
    }
     // Pre-process interactable names (if they have dynamic names)
     // Example: If an interactable name was "{adj1} Lever"
     // for (const roomKey in rooms) {
     //    if (rooms[roomKey].interactables) {
     //        for (const interactKey in rooms[roomKey].interactables) {
     //             if(rooms[roomKey].interactables[interactKey].nameTemplate) { // Assuming a nameTemplate property
     //                  rooms[roomKey].interactables[interactKey].generatedName = renderTemplate(rooms[roomKey].interactables[interactKey].nameTemplate);
     //             }
     //        }
     //    }
     // }
}

// Replace placeholders in a string with generated words
function renderTemplate(templateString) {
    if (!templateString) return "";
    let rendered = templateString;
    // Add a fallback for missing keys to make debugging easier
    rendered = rendered.replace(/\{(\w+)\}/g, (match, key) => {
        return gameState.generatedWords.hasOwnProperty(key) ? gameState.generatedWords[key] : `[MISSING: ${key}]`;
    });
    return rendered;
}


// Add text to the output display
function updateDisplay(text) {
    const p = document.createElement('p');
    p.innerHTML = renderTemplate(text); // Use innerHTML to allow basic formatting if needed later
    outputDiv.appendChild(p);
    // Scroll to the bottom
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Add player command echo to the display
function displayPlayerCommand(command) {
    const p = document.createElement('p');
    p.classList.add('player-command');
    p.textContent = `> ${command}`;
    outputDiv.appendChild(p);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Show the description of the current location
function showLocation() {
    const room = rooms[gameState.currentLocation];
    if (!room) {
        updateDisplay("ERROR: You've fallen into the {place1}. Room not found: " + gameState.currentLocation);
        return;
    }

    // Use the current description (might have been changed by events)
    updateDisplay(room.description);

    // Show items in the room
    if (room.items && room.items.length > 0) {
        room.items.forEach(itemKey => {
            if (items[itemKey] && !gameState.inventory.includes(itemKey)) {
                 updateDisplay(`You see a ${items[itemKey].generatedName} here.`);
            }
        });
    }

     // Show NPCs in the room
     if (room.npcs && room.npcs.length > 0) {
        room.npcs.forEach(npcKey => {
            // Check if NPC exists and has a generated name
            if (npcs[npcKey] && npcs[npcKey].generatedName) {
                 updateDisplay(`A ${npcs[npcKey].generatedName} is here.`);
            } else if (npcs[npcKey]) {
                 // Fallback or warning if name wasn't generated (e.g., dynamic NPC added before generateMadLibs ran for it)
                 console.warn(`NPC '${npcKey}' is present but has no generated name.`);
                 updateDisplay(`A ${renderTemplate(npcs[npcKey].name || npcKey)} is here.`); // Try rendering template again or use key
            }
        });
    }

    // Show interactables in the room
    if (room.interactables) {
        Object.keys(room.interactables).forEach(key => {
            // You might want to add conditions for showing interactables
            updateDisplay(`There is a ${renderTemplate(room.interactables[key].description || key)} here.`);
        });
    }


    // Show available exits
    let availableExits = [];
    if (room.exits) {
        availableExits = Object.keys(room.exits).filter(dir => {
            // Check if the exit is blocked
            if (room.blockedExits && room.blockedExits[dir]) {
                const block = room.blockedExits[dir];
                let conditionMet = false;
                try {
                    // Simple flag checker (add more complex logic if needed)
                    if (block.condition.startsWith('!')) {
                        conditionMet = !gameState.flags[block.condition.substring(1)];
                    } else {
                        conditionMet = gameState.flags[block.condition];
                    }
                } catch (e) {
                    console.error("Error evaluating block condition:", block.condition, e);
                }
                // If conditionMet is true, it *is* blocked, so don't show it.
                return !conditionMet;
            }
            return true; // Not blocked
        });
    }


    if (availableExits.length > 0) {
        updateDisplay(`Exits: ${availableExits.join(', ')}`);
    } else {
        updateDisplay("There are no obvious exits. You feel {emotion1}.");
    }
}

// --- Input Processing ---
function processInput(input) {
    const command = input.toLowerCase().trim();
    displayPlayerCommand(input); // Show what the player typed

    if (command === "") return;

    const parts = command.split(" ");
    const verb = parts[0];
    const nounPhrase = parts.slice(1).join(" "); // Handle multi-word nouns/targets

    const room = rooms[gameState.currentLocation];

    // --- Movement ---
    if (["go", "move", "walk", "head", "n", "s", "e", "w", "u", "d", "north", "south", "east", "west", "up", "down"].includes(verb)) {
        let direction = nounPhrase;
        // Allow single letter directions
        if (["n", "s", "e", "w", "u", "d"].includes(verb)) {
             const directionMap = { n: 'north', s: 'south', e: 'east', w: 'west', u: 'up', d: 'down' };
             direction = directionMap[verb];
        } else if (!direction) {
             updateDisplay("Go where, you {noun1}?");
             return;
        }


        let targetRoomId = room.exits ? room.exits[direction] : null;

        if (targetRoomId) {
             // Check for blocked exits AGAIN before moving (important!)
             if (room.blockedExits && room.blockedExits[direction]) {
                const block = room.blockedExits[direction];
                let conditionMet = false;
                 try {
                    if (block.condition.startsWith('!')) {
                        conditionMet = !gameState.flags[block.condition.substring(1)];
                    } else {
                        conditionMet = gameState.flags[block.condition];
                    }
                } catch (e) { console.error("Error evaluating block condition:", block.condition, e); }

                if (conditionMet) {
                    updateDisplay(block.message || "You can't go that way right now.");
                    return; // Stop movement
                }
            }
            // Move to the new room
            gameState.currentLocation = targetRoomId;
            showLocation();
            // Check for game end condition (e.g., entering final room after getting item)
            if (rooms[targetRoomId].isEnd && gameState.flags.obtained_final_item) {
                 endGame(true); // Win state
            }
        } else {
            updateDisplay(`You can't go ${direction} from here, you {adj1} {creature1}.`);
        }
        return; // Movement handled
    }

    // --- Interaction ---
    if (["look", "examine", "inspect", "l"].includes(verb)) {
        let targetName = nounPhrase;
        if (targetName === "" || targetName === "around" || targetName === "room") {
            showLocation(); // Re-describe the room
        } else {
            // Look at item in room?
            let itemKey = findItemKeyInRoom(targetName);
            if (itemKey && items[itemKey]) {
                updateDisplay(renderTemplate(items[itemKey].description));
                return;
            }
            // Look at item in inventory?
            itemKey = findItemKeyInInventory(targetName);
             if (itemKey && items[itemKey]) {
                updateDisplay(renderTemplate(items[itemKey].description));
                return;
            }
             // Look at NPC in room?
             let npcKey = findNpcKeyInRoom(targetName);
             if (npcKey && npcs[npcKey]) {
                 updateDisplay(renderTemplate(npcs[npcKey].description));
                 return;
             }
             // Look at interactable in room?
             let interactableKey = findInteractableKeyInRoom(targetName);
              if (interactableKey && room.interactables[interactableKey]) {
                 updateDisplay(renderTemplate(room.interactables[interactableKey].description));
                 return;
             }
            updateDisplay(`You look closely at the concept of "${targetName}", but learn nothing useful except that it smells faintly of {liquid1}.`);
        }
        return;
    }

    if (["take", "get", "grab", "t"].includes(verb)) {
        let targetName = nounPhrase;
        if (!targetName) {
            updateDisplay("Take what, you {noun2}?");
            return;
        }
        let itemKey = findItemKeyInRoom(targetName);
        if (itemKey && items[itemKey]) {
            if (items[itemKey].canTake) {
                gameState.inventory.push(itemKey);
                // Remove item from room's list
                room.items = room.items.filter(key => key !== itemKey);
                updateDisplay(renderTemplate(items[itemKey].onTake || `You take the ${items[itemKey].generatedName}.`));
                 // Check if taking this item wins the game
                 if (itemKey === 'final_item_key') {
                     gameState.flags.obtained_final_item = true;
                     // Optional: End immediately, or let player walk out
                     updateDisplay("You've got the final prize! Now get out of this {place2}!");
                     // endGame(true); // Or let them walk out
                 }
            } else {
                updateDisplay(`You can't take the ${items[itemKey].generatedName}. It's probably bolted down with {noun3}s or covered in {liquid2}.`);
            }
        } else {
            updateDisplay(`There is no "${targetName}" here to take, you {adj2} {creature2}.`);
        }
        return;
    }

     if (["inv", "inventory", "i"].includes(verb)) {
        if (gameState.inventory.length === 0) {
            updateDisplay("You aren't carrying anything except the crushing weight of your own {body_part2} and maybe some {gunk1}.");
        } else {
            updateDisplay("You are carrying:");
            gameState.inventory.forEach(itemKey => {
                if (items[itemKey]) {
                    updateDisplay(`- ${items[itemKey].generatedName}`);
                }
            });
        }
        return;
    }

    // Updated 'use' command to handle items on interactables, NPCs, or just items themselves
    if (["use", "apply", "give", "put", "shove", "insert"].includes(verb)) {
        // Examples: "use key on door", "use rope on bridge", "give bone to dog", "use potion"
        const useParts = nounPhrase.split(/ on | to | in | with /); // Split by common prepositions
        const itemToUseName = useParts[0].trim();
        const targetName = useParts.length > 1 ? useParts.slice(1).join(" ").trim() : null; // The rest is the target

        if (!itemToUseName) {
            updateDisplay("Use what? Your {adj3} {noun4}?");
            return;
        }

        let itemKey = findItemKeyInInventory(itemToUseName);

        if (!itemKey) {
            updateDisplay(`You don't have a "${itemToUseName}" to use.`);
            return;
        }

        // 1. Check if using item on an INTERACTABLE in the room
        let interactableKey = targetName ? findInteractableKeyInRoom(targetName) : null;
        if (interactableKey && room.interactables[interactableKey]?.use) {
            // Pass the *item name* the player typed to the interactable's use function
            const resultMessage = room.interactables[interactableKey].use(itemToUseName);
            updateDisplay(resultMessage);
            // After using, re-evaluate location in case something changed
            showLocation();
            return;
        }

        // 2. Check if using item on an NPC in the room
        let npcKey = targetName ? findNpcKeyInRoom(targetName) : null;
        if (npcKey && npcs[npcKey]?.use) { // Check if NPC has a 'use' method for items
             // Pass the *item name* the player typed
            const resultMessage = npcs[npcKey].use(itemToUseName);
            updateDisplay(resultMessage);
            showLocation(); // Re-show location in case NPC state changed
            return;
        }
         // Special case for giving item (distraction) even if NPC doesn't have general 'use'
         if (verb === 'give' && npcKey && items[itemKey]?.use) {
             // Try calling the ITEM's use function, passing the NPC's name as target
             const resultMessage = items[itemKey].use(npcs[npcKey].generatedName.toLowerCase());
             if (!resultMessage.toLowerCase().includes("can't use")) { // Check if use was successful
                 updateDisplay(resultMessage);
                 showLocation();
                 return;
             }
         }


        // 3. Check if the ITEM itself has a use function (and potentially a target)
        if (items[itemKey].use) {
            // Pass the target name (e.g., "door", "creature", null) to the item's use function
            const resultMessage = items[itemKey].use(targetName);
            updateDisplay(resultMessage);
            // After using, re-evaluate location in case something changed
            showLocation();
            return;
        }

        // 4. Default fallback
        if (targetName) {
            updateDisplay(`You can't seem to use the ${items[itemKey].generatedName} on the ${targetName}. Maybe try ${verb === 'shove' ? 'shoving' : 'using'} it {adverb3}?`);
        } else {
            updateDisplay(`You fiddle with the ${items[itemKey].generatedName}, but nothing interesting happens. It just feels {adj4}.`);
        }
        return;
    }

     if (["talk", "speak", "ask"].includes(verb)) {
        const talkParts = nounPhrase.split(/ to | with /);
        const targetName = talkParts[talkParts.length - 1].trim(); // Usually the last part is the target

        if (!targetName) {
            updateDisplay("Talk to whom? Your own {body_part3}?");
            return;
        }

        let npcKey = findNpcKeyInRoom(targetName);
        if (npcKey && npcs[npcKey]) {
            if (npcs[npcKey].talk) {
                updateDisplay(renderTemplate(npcs[npcKey].talk));
            } else {
                updateDisplay(`The ${npcs[npcKey].generatedName} doesn't seem interested in conversation. It just {verb2_present}s {adverb4}.`);
            }
        } else {
            updateDisplay(`There's no "${targetName}" here to talk to. Only the echo of your own {emotion2}.`);
        }
        return;
    }

    // Simple verb for interactables without items
     if (["pull", "push", "press", "activate"].includes(verb)) {
         let targetName = nounPhrase;
         if (!targetName) {
             updateDisplay(`${verb} what? Your {nipple}?`);
             return;
         }
         let interactableKey = findInteractableKeyInRoom(targetName);
         if (interactableKey && room.interactables[interactableKey]?.use) {
             // Call the use function without an item argument
             const resultMessage = room.interactables[interactableKey].use(null);
             updateDisplay(resultMessage);
             showLocation(); // Update display
             return;
         } else {
             updateDisplay(`You can't ${verb} the ${targetName}. It doesn't seem to have a {orifice1} for that.`);
         }
         return;
     }


    // --- Default / Unknown Command ---
    updateDisplay(`I don't understand how to "${command}". Try simple commands like 'go north', 'look {object1}', 'take {object2}', 'use {object1} on door', 'inventory', 'talk to {creature1}', 'pull lever'.`);
}

// --- Utility functions for finding things by name ---
function findItemKeyInRoom(name) {
    const room = rooms[gameState.currentLocation];
    if (!room || !room.items || !name) return null;
    // Find exact match first, then partial
    let key = room.items.find(k => items[k] && items[k].generatedName.toLowerCase() === name.toLowerCase());
    if (key) return key;
    return room.items.find(k => items[k] && items[k].generatedName.toLowerCase().includes(name.toLowerCase()));
}

function findItemKeyInInventory(name) {
    if (!name) return null;
     // Find exact match first, then partial
    let key = gameState.inventory.find(k => items[k] && items[k].generatedName.toLowerCase() === name.toLowerCase());
    if (key) return key;
    return gameState.inventory.find(k => items[k] && items[k].generatedName.toLowerCase().includes(name.toLowerCase()));
}

function findNpcKeyInRoom(name) {
    const room = rooms[gameState.currentLocation];
    if (!room || !room.npcs || !name) return null;
     // Find exact match first, then partial
    let key = room.npcs.find(k => npcs[k] && npcs[k].generatedName.toLowerCase() === name.toLowerCase());
    if (key) return key;
    return room.npcs.find(k => npcs[k] && npcs[k].generatedName.toLowerCase().includes(name.toLowerCase()));
}

function findInteractableKeyInRoom(name) {
    const room = rooms[gameState.currentLocation];
    if (!room || !room.interactables || !name) return null;
    // Match against the key name (e.g., 'lever', 'bridge', 'generator')
    return Object.keys(room.interactables).find(k => k.toLowerCase() === name.toLowerCase());
     // Could also add matching against generated names if interactables had them
     // return Object.keys(room.interactables).find(k => k.toLowerCase() === name.toLowerCase() || (room.interactables[k].generatedName && room.interactables[k].generatedName.toLowerCase().includes(name.toLowerCase())));
}


// --- Game End ---
function endGame(isVictory) {
    updateDisplay("--------------------------------");
    if (isVictory && gameState.flags.obtained_final_item) {
        updateDisplay("VICTORY... OF A SORT!");
        updateDisplay("You've escaped the {adj_final_boss} {place3} with the Pulsating {noun_final_boss} {body_part_final}!");
        updateDisplay("Your {emotion_boss} knows no bounds! You feel... {adj1}.");
    } else {
         updateDisplay("GAME OVER...?"); // Or specific failure message
         updateDisplay("You remain trapped in the {place1}, forever smelling {noun1}.");
    }
    updateDisplay("Refresh the page to generate another uniquely {adj2} adventure!");
    inputEl.disabled = true; // Disable further input
    submitButton.disabled = true;
}


// --- Initialization ---
function startGame() {
    outputDiv.innerHTML = ''; // Clear loading message
    generateMadLibs(); // Generate the words for this run!
    updateDisplay("Welcome back to your personalized, procedurally generated {emotion1}.");
    showLocation();
}

// --- Event Listeners ---
submitButton.addEventListener('click', () => {
    processInput(inputEl.value);
    inputEl.value = ''; // Clear input field
    inputEl.focus(); // Keep focus on input
});

inputEl.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        processInput(inputEl.value);
        inputEl.value = ''; // Clear input field
    }
});

// --- Start the game ---
startGame();