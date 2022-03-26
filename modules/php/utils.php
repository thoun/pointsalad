<?php

require_once(__DIR__.'/objects/card.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getCardFromDb(/*array|null*/ $dbCard) {
        if ($dbCard == null) {
            return null;
        }
        if (!$dbCard || !array_key_exists('id', $dbCard)) {
            throw new \Error('card doesn\'t exists '.json_encode($dbCard));
        }
        if (!$dbCard || !array_key_exists('location', $dbCard)) {
            throw new \Error('location doesn\'t exists '.json_encode($dbCard));
        }
        return new Card($dbCard);
    }

    function getCardsFromDb(array $dbCards) {
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbCards));
    }

    function setupCards(int $playerNumber) {
        for ($type = 1; $type <= 6; $type++) {
            $cards = [];
            for ($subType = 1; $subType <= 18; $subType++) {
                $cards[] = [ 'type' => $type * 100 + $subType, 'type_arg' => 0, 'nbr' => 1 ];
            }

            $this->cards->createCards($cards, 'veggie'.$type);
            $this->cards->shuffle('veggie'.$type);
            $this->cards->pickCardsForLocation(3 * $playerNumber, 'veggie'.$type, 'deck');
        }
        $this->cards->shuffle('deck');

        $cardCount = intval($this->cards->countCardInLocation('deck'));
        $pileCount = $cardCount / 3;
        
        for ($pile = 1; $pile <= 3; $pile++) {
            $this->cards->pickCardsForLocation($pileCount, 'deck', 'pile'.$pile);
        }
    }

    function applyFlipCard(int $playerId, Card &$card) {
        $card->side = 1;
        $this->DbQuery("UPDATE `card` SET `card_type_arg` = 1 WHERE `card_id` = $card->id"); 

        if ($playerId > 0) {
            self::notifyAllPlayers('flippedCard', clienttranslate('${player_name} flips a point card to get a veggie card'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'card' => $card,
                'veggieCounts' => $this->getVeggieCountsByPlayer($playerId),
            ]);
        }
    }

    function refillMarket(bool $silent = false) {        
        for ($pile = 1; $pile <= 3; $pile++) {
            // TODO handle empty piles
            $pileSize = intval($this->cards->countCardInLocation('pile'.$pile));
            for ($i = 1; $i <= 2; $i++) {                
                if ($pileSize > 0 && intval($this->cards->countCardInLocation('market'.$pile, $i)) == 0) {
                    $card = $this->getCardFromDb($this->cards->pickCardForLocation('pile'.$pile, 'market'.$pile, $i));
                    $card->location = 'market'.$pile;
                    $card->locationArg = $i;

                    $this->applyFlipCard(0, $card); 

                    if (!$silent) {
                        self::notifyAllPlayers('marketRefill', '', [
                            'pile' => $pile,
                            'card' => $card,
                            'pileTop' => $this->getCardFromDb($this->cards->getCardOnTop('pile'.$pile)),
                            'pileCount' => intval($this->cards->countCardInLocation('pile'.$pile)),
                        ]);
                    }
                }
            }
        }
    }

    function getVeggieCountsByPlayer(int $playerId) {
        $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('player', $playerId));
        return $this->getVeggieCounts($cards);
    }

    function getVeggieCounts(array $cards) {
        $counts = [
            1 => 0,
            2 => 0,
            3 => 0,
            4 => 0,
            5 => 0,
            6 => 0,
        ];

        foreach ($cards as $card) {
            if ($card->side === 1) {
                $counts[$card->veggie] += 1;
            }
        }

        return $counts;
    }

    function getScore(int $playerId, Card $scoreCard, array $veggieCounts) {
        $fn = $this->CARDS_EFFECTS[$scoreCard->veggie][$scoreCard->index];
        $otherPlayersVeggieCounts = [];
        if (($scoreCard->index == 1 && in_array($scoreCard->veggie, [LETTUCE, PEPPER]))
             || $scoreCard->index == 3 
             || $scoreCard->index == 4
        ) {
            $otherPlayersIds = $this->getPlayersIds();
            foreach ($otherPlayersIds as $otherPlayerId) {
                if ($otherPlayerId != $playerId) {
                    $otherPlayersVeggieCounts[$otherPlayerId] = $this->getVeggieCountsByPlayer($otherPlayerId);
                }
            }
        }
        return $fn($veggieCounts, $otherPlayersVeggieCounts);
    }

    function updateScore(int $playerId) {
        $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('player', $playerId));

        $pointCards = [];
        $veggieCards = [];
        foreach ($cards as $card) {
            if ($card->side === 1) {
                $veggieCards[] = $card;
            } else {
                $pointCards[] = $card;
            }
        }

        $veggieCounts = $this->getVeggieCounts($veggieCards);
        $score = 0;
        foreach ($pointCards as $pointCard) {
            $score += $this->getScore($playerId, $pointCard, $veggieCounts);
        }

        $this->DbQuery("UPDATE `player` SET `player_score` = $score WHERE `player_id` = $playerId"); 
        
        $this->notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'points' => $score,
        ]);
    }

    function getRemainingCardCountOnTable() {
        return intval(self::getUniqueValueFromDB("SELECT count(*) FROM `card` WHERE `card_location` LIKE 'pile%' OR `card_location` LIKE 'market%'"));
    }
}
