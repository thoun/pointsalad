<?php

require_once(__DIR__.'/objects/player.php');

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
    
    function notifIndividualCardScores(array $players) {
        foreach ($players as $player) {
            $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('player', $player->id));
            $pointCards = array_values(array_filter($cards, fn($card) => $card->side === 0));
            $veggieCards = array_values(array_filter($cards, fn($card) => $card->side === 1));
            $veggieCounts = $this->getVeggieCounts($veggieCards);
            
            foreach ($pointCards as $pointCard) {
                $cardScore = $this->getScore($player->id, $pointCard, $veggieCounts);

                $this->notifyAllPlayers('cardScore', '', [
                    'playerId' => $player->id,
                    'card' => $pointCard,
                    'cardScore' => $cardScore,
                ]);
            }
        }
    }

    function setEndStats(array $players) {
        $tableTotalPointCards = 0;
        $tableTotalVeggieCards = 0;
        $tableTotalScore = 0;

        foreach ($players as $player) {
            $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('player', $player->id));
            $totalPointCards = count(array_filter($cards, fn($card) => $card->side === 0));
            $totalVeggieCards = count(array_filter($cards, fn($card) => $card->side === 1));
            $playerScore = $this->bga->playerScore->get($player->id);

            self::setStat($totalPointCards, 'totalPointCards', $player->id);
            self::setStat($totalVeggieCards, 'totalVeggieCards', $player->id);
            self::setStat($totalVeggieCards == 0 ? 0 : ($playerScore / $totalVeggieCards), 'avgScoreByCard', $player->id);
        
            $tableTotalPointCards += $totalPointCards;
            $tableTotalVeggieCards += $totalVeggieCards;
            $tableTotalScore += $playerScore;
        }

        self::setStat($tableTotalPointCards, 'totalPointCards');
        self::setStat($tableTotalVeggieCards, 'totalVeggieCards');
        self::setStat($tableTotalScore / $tableTotalVeggieCards, 'avgScoreByCard');
    }

    function stEndScore() {
        $dbResults = $this->getCollectionFromDb("SELECT * FROM player ORDER BY player_no");
        $players = array_map(fn($dbResult) => new PointSaladPlayer($dbResult), array_values($dbResults));

        // update player_score_aux
        $this->DbQuery("UPDATE `player` SET `player_score_aux` = `player_no`"); 

        // notif individual card score
        $this->notifIndividualCardScores($players);

        // end stats        
        $this->setEndStats($players);

        $this->gamestate->nextState('endGame');
    }
}
