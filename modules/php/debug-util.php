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
        //$this->cards->moveAllCardsInLocation('pile1', 'discard');
        $this->cards->pickCardsForLocation(1, 'pile1', 'discard');
        $this->cards->pickCardsForLocation(8, 'pile2', 'discard');
        //$this->cards->moveAllCardsInLocation('pile3', 'discard');

        //$this->cards->pickCardsForLocation(7, 'veggie6', 'player', 2343492);

        //$cards = $this->getCardsFromDb($this->cards->pickCardsForLocation(9, 'pile1', 'player', 2343492));

       /*for ($i=0; $i<9; $i++) {
            $this->applyFlipCard(0, $cards[$i]);
        }*/
        //$this->insertSomeRoutes(2343492);
        
        $this->gamestate->changeActivePlayer(2343492);
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
