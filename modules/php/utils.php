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

    function getCardFromDb(array $dbCard) {
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
                $cards[] = [ 'type' => $type, 'type_arg' => $subType, 'nbr' => 1 ];
            }
            $this->cards->createCards($cards, 'veggie'.$type);
            $this->cards->shuffle('veggie'.$type);
            $this->cards->pickCardsForLocation(3 * $playerNumber, 'veggie'.$type, 'deck');
        }
        $cardCount = intval($this->cards->countCardInLocation('deck'));
        $pileCount = $cardCount / 3;
        
        for ($pile = 1; $pile <= 3; $pile++) {
            $this->cards->pickCardsForLocation($pileCount, 'deck', 'pile'.$pile);
        }

        $this->refillMarket(true);
    }

    function applyFlipCard(Card &$card, bool $silent = false) {
        $card->side = 1;
        $this->DbQuery("UPDATE `card` SET `card_type_arg` = 1 WHERE `card_id` = $card->id"); 

        if (!$silent) {
            // TODO notif
        }
    }

    function refillMarket(bool $silent = false) {
        $revealedCards = [];
        
        for ($pile = 1; $pile <= 3; $pile++) {
            // TODO handle empty piles
            $pileSize = intval($this->cards->countCardInLocation('pile'.$pile));
            $marketSize = intval($this->cards->countCardInLocation('market'.$pile));
            $neededCards = min($pileSize, 2 - $marketSize);
            if ($neededCards > 0) {
                $cards = $this->cards->pickCardsForLocation('pile'.$pile, 'market'.$pile, $marketSize + 1);
                foreach($cards as $card) {
                    $this->applyFlipCard($card, true); 
                }
                $revealedCards = array_merge($revealedCards, $cards);
            }
        }

        if (!$silent) {
            // TODO notif $revealedCards & new top cards
        }
    }

    function getScore(int $playerId, Card $scoreCard, array $veggieCards) {
        return 0; // TODO
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

        $score = 0;
        foreach ($pointCards as $pointCard) {
            $score += $this->getScore($playerId, $pointCard, $veggieCards);
        }

        $this->DbQuery("UPDATE `player` SET `player_score` = $score WHERE `player_id` = $playerId"); 
        
        // TODO notif
    }
}
