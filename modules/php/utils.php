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

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
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
            
            $this->cards->pickCardForLocation('pile'.$pile, 'market'.$pile, 1);
            $this->cards->pickCardForLocation('pile'.$pile, 'market'.$pile, 2);
        }
    }
}
