import { getRandomElement } from './utils/helpers.js';
import { madLibs } from './data/wordLists.js';

// Game state management
export let gameState = {
    currentLocation: 'start',
    inventory: [],
    generatedWords: {},
    discoveredRooms: new Set(['start']), // Always know starting room
    flags: {
        'door_unlocked': false,
        'lever_pulled': false,
        'creature_distracted': false,
        'bridge_repaired': false,
        'generator_on': false,
        'obtained_final_item': false,
        'creature1_pacified': false
    }
};

// Generate the Mad Libs words for this game run
export function generateMadLibs() {
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
        gunk1: getRandomElement(madLibs.nouns),
        orifice1: getRandomElement(madLibs.body_parts),
        noun_final_boss: getRandomElement(madLibs.creatures),
        adj_final_boss: getRandomElement(madLibs.adjectives),
        verb_final_boss: getRandomElement(madLibs.verbs_present),
        adverb_final: getRandomElement(madLibs.adverbs),
        emotion_boss: getRandomElement(madLibs.emotions),
        body_part_final: getRandomElement(madLibs.body_parts),
        verb_boss_death: getRandomElement(madLibs.verbs_past),
        sound_boss_death: getRandomElement(madLibs.sounds),
        gunk_boss_death: getRandomElement(madLibs.liquids)
    };
}

export function addDiscoveredRoom(roomId) {
    gameState.discoveredRooms.add(roomId);
    // TODO: Implement save when persistence is added
}