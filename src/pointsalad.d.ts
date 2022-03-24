/**
 * Your game interfaces
 */

interface Card {
    id: number;
    type: number;
    subType: number;
    side: 0 | 1;
    location: string;
    location_arg: number;
}

interface PointSaladPlayer extends Player {
    playerNo: number;
    cards: Card[];
}

interface PointSaladGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: PointSaladPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    // TODO
}

interface PointSaladGame extends Game {
    
    cards: Cards;
    getPlayerId: () => number;
    getZoom(): number;
}

/*interface EnteringPickMonsterArgs {
    availableMonsters: number[];
}

interface NotifPickMonsterArgs {
    playerId: number;
    monster: number;
}*/