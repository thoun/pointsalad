<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        $this->cards->pickCardsForLocation(3, 'veggie1', 'player', 2343492);

        //$cards = $this->getCardsFromDb($this->cards->pickCardsForLocation(9, 'pile1', 'player', 2343492));

        /*for ($i=0; $i<7; $i++) {
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
