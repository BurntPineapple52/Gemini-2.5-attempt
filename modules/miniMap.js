/**
 * MiniMap module - handles rendering and updating the game's mini-map
 */

/**
 * Renders the mini-map showing discovered rooms
 * @param {Object} rooms - All room data from the game
 * @param {string} currentRoomId - ID of the player's current room
 */
export function renderMiniMap(rooms, currentRoomId) {
    const miniMapContainer = document.getElementById('mini-map-container');
    miniMapContainer.innerHTML = '';

    // Create mini-map grid
    const miniMap = document.createElement('div');
    miniMap.className = 'mini-map';

    // Find all connected rooms and render them
    Object.values(rooms).forEach(room => {
        if (room.discovered) {
            const roomElement = document.createElement('div');
            roomElement.className = `mini-map-room ${room.id === currentRoomId ? 'current-room' : ''}`;
            roomElement.textContent = room.id;
            miniMap.appendChild(roomElement);
        }
    });

    miniMapContainer.appendChild(miniMap);
}

/**
 * Updates the discovered rooms list and re-renders the mini-map
 * @param {string} roomId - ID of the newly discovered room
 */
export function updateDiscoveredRooms(roomId, rooms, currentRoomId) {
    if (rooms[roomId]) {
        rooms[roomId].discovered = true;
        renderMiniMap(rooms, currentRoomId);
    }
}