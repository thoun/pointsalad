<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        // empty piles
        $this->cards->moveAllCardsInLocation('pile1', 'discard');
        $this->cards->moveAllCardsInLocation('pile2', 'discard');
        $this->cards->moveAllCardsInLocation('pile3', 'discard');
        //$this->cards->pickCardsForLocation(8, 'pile1', 'discard');
        //$this->cards->pickCardsForLocation(9, 'pile2', 'discard');
        //$this->cards->pickCardsForLocation(9, 'pile3', 'discard');

        //$this->cards->pickCardsForLocation(7, 'veggie6', 'player', 2343492);

        //$cards = $this->getCardsFromDb($this->cards->pickCardsForLocation(9, 'pile1', 'player', 2343492));

        for ($i=1; $i<=4; $i++) {
            $card = $this->debugSetCardInHand(CABBAGE * 100 + $i, 2343492);
            $this->applyFlipCard(2343492, $card);
        }

        $this->debugSetCardInHand(CABBAGE * 100 + 5, 2343492);
        $this->debugSetCardInHand(CABBAGE * 100 + 9, 2343492);
        $this->debugSetCardInHand(TOMATO * 100 + 10, 2343492);
        
        $this->gamestate->changeActivePlayer(2343492);
    }

    function debugSetCardInHand($cardType, $playerId) {
        $card = $this->getCardFromDb(array_values($this->cards->getCardsOfType($cardType))[0]);
        $this->cards->moveCard($card->id, 'player', $playerId);
        return $card;
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
