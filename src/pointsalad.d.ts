/**
 * Your game interfaces
 */

interface Card {
    id: number;
    veggie: number; // 1..6
    index: number; // 1..18
    side: 0 | 1;
    location: string;
    locationArg: number;
}

type VeggieCounts = { [veggie: number]: number };

interface PointSaladPlayer extends Player {
    playerNo: number;
    cards: Card[];
    veggieCounts: VeggieCounts;
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
    pileTopCard: { [pile: number]: Card };
    pileCount: { [pile: number]: number };
    market: { [pile: number]: Card[] };

    cardScores?: { [cardId: number]: number };
}

interface PointSaladGame extends Game {
    createOrMoveCard(card: Card, destinationId: string, init?: boolean): void;
    getPlayerId(): number;
    getZoom(): number;
}

interface EnteringTakeCardsArgs {
    canTakeOnlyOneVeggie: boolean;
}

interface EnteringFlipCardArgs {
}

interface NotifPointsArgs {
    points: { [playerId: number]: number };
}

interface NotifFlippedCardArgs {
    playerId: number;
    card: Card;
    veggieCounts: VeggieCounts;
}

interface NotifTakenCardsArgs {
    playerId: number;
    cards: Card[];
    veggieCounts: VeggieCounts;
    pile: number;
    pileTop: Card | null;
    pileCount: number | null;
}

interface NotifMarketRefillArgs {
    card: Card;
    pile: number;
    pileTop: Card | null;
    pileCount: number | null;
}

interface NotifPileRefillArgs {
    pile: number;
    pileTop: Card | null;
    pileCounts: number[];
    fromPile: number;
}

interface NotifCardScoreArgs {
    playerId: number;
    card: Card;
    cardScore: number;
}
