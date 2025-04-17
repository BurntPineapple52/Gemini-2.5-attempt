// Rooms configuration
export const rooms = {
    'start': {
        description: "You awaken in a {adj1} {place1}. The air smells {adverb1} of {noun1} and {emotion1}. A path leads north into darkness. West, you see a flickering light. On the ground lies a {object1}.",
        exits: { 'north': 'hallway', 'west': 'lab_entrance' },
        items: ['object1_key']
    },
    'hallway': {
        description: "A narrow hallway stretches north. It feels {adj2} and unnerving. A sturdy door blocks the way east. To the south is the {place1} you started in. A strange {creature1} {verb1_present} {adverb2} in the corner near the east door.",
        exits: { 'south': 'start', 'east': 'treasure_room', 'north': 'cave_entrance' },
        blockedExits: {
            'east': { condition: '!gameState.flags.door_unlocked', message: "The door is locked. It looks like it needs some kind of {noun2} shoved into its {orifice1}." }
        },
        npcs: ['creature1_key']
    },
    'treasure_room': {
        description: "This small room contains a pedestal. Upon it rests the legendary {object2}! It {verb2_present} with a {adj3} energy. You feel a strange urge to rub it on your {body_part1}. A faint {sound1} echoes from the west.",
        exits: { 'west': 'hallway' },
        items: ['object2_key']
    },
    'cave_entrance': {
        description: "The hallway ends at the mouth of a dripping cave. The air is thick with the smell of {liquid1} and {adj4} {noun3}. The path descends north into the gloom. South leads back the way you came. A rusty lever is set into the wall here.",
        exits: { 'south': 'hallway', 'north': 'cave_passage' },
        interactables: {
            'lever': {
                description: "A rusty metal lever, covered in {gunk1}.",
                use: function() {
                    if (!gameState.flags.lever_pulled) {
                        gameState.flags.lever_pulled = true;
                        if (rooms['cave_passage']) {
                            rooms['cave_passage'].description += " You hear a distant {sound2} like a {noun4} being {verb1_past}.";
                        }
                        if (rooms['flooded_cavern']) {
                            rooms['flooded_cavern'].description = rooms['flooded_cavern'].description_drained;
                            rooms['flooded_cavern'].exits['down'] = 'deep_cavern';
                        }
                        return "You pull the lever with a {adj5} {sound1}. It grinds {adverb3}.";
                    } else {
                        return "The lever is already pulled. Yanking it more just makes your {body_part2} feel {adj1}.";
                    }
                }
            }
        }
    },
    'lab_entrance': {
        description: "You stand before a {adj1} metal door marked 'LABORATORY'. The {material1} surface is covered in {gunk1}. A faint {sound1} comes from inside. The way back is east.",
        exits: { 'east': 'start' },
        items: ['lab_key']
    },
    'cave_passage': {
        description: "A narrow, winding passage through the rock. The walls glisten with {liquid1} and the air smells {adverb1} of {noun1}. The path continues north and south.",
        exits: { 'south': 'cave_entrance', 'north': 'flooded_cavern' },
        items: ['mineral_sample']
    },
    'flooded_cavern': {
        description: "A large cavern partially flooded with {liquid1}. The water level seems to be {adj1} {verb1_present}. A passage leads south.",
        description_drained: "The cavern is now mostly dry, revealing a passage downward through a crack in the floor.",
        exits: { 'south': 'cave_passage' }
    },
    'final_chamber': {
        description: "It's pitch black. You can hear a faint {sound4} nearby.",
        description_lit: "The generator lights reveal a large chamber dominated by a pulsating {noun_final_boss}. It {verb_final_boss} menacingly! This must be the source of all the {adj_final_boss} weirdness!",
        exits: { 'north': 'final_chamber_approach' },
        isEnd: true
    }
};