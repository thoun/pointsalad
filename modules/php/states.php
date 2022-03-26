<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNextPlayer() {
        $playerId = $this->getActivePlayerId();

        $this->giveExtraTime($playerId);

        self::incStat(1, 'turnNumber');
        self::incStat(1, 'turnNumber', $playerId);

        $endScore = $this->getRemainingCardCountOnTable() === 0;

        if (!$endScore) {
            $this->activeNextPlayer();
        }

        $this->gamestate->nextState($endScore ? 'endScore' : 'nextPlayer');
    }

    function stEndScore() {
        $playerId = $this->getActivePlayerId();

        // TODO update player_score_aux

        // TODO notif individualCardScore

        // end stats
        $playersIds = $this->getPlayersIds();
        
        $tableTotalPointCards = 0;
        $tableTotalVeggieCards = 0;
        $tableTotalScore = 0;

        foreach ($playersIds as $playerId) {
            $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('player', $playerId));
            $totalPointCards = count(array_filter($cards, fn($card) => $card->side === 0));
            $totalVeggieCards = count(array_filter($cards, fn($card) => $card->side === 1));
            $playerScore = $this->getPlayerScore($playerId);

            self::setStat($totalPointCards, 'totalPointCards', $playerId);
            self::setStat($totalVeggieCards, 'totalVeggieCards', $playerId);
            self::setStat($playerScore / $totalVeggieCards, 'avgScoreByCard', $playerId);
        
            $tableTotalPointCards += $totalPointCards;
            $tableTotalVeggieCards += $totalVeggieCards;
            $tableTotalScore += $playerScore;
        }

        self::setStat($tableTotalPointCards, 'totalPointCards');
        self::setStat($tableTotalVeggieCards, 'totalVeggieCards');
        self::setStat($tableTotalScore / $tableTotalVeggieCards, 'avgScoreByCard');

        $this->gamestate->nextState('endGame');
    }
}
