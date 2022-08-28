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

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
        // SELECT JSON_ARRAYAGG(`player_id`) FROM `player`
		$ids = [85375560, 85543355, 86615685, 89713143, 91338253, 92206183];

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			$this->DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			$this->DbQuery("UPDATE stats SET stats_player_id=$sid WHERE stats_player_id = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			$this->DbQuery("UPDATE card SET card_location_arg=$sid WHERE card_location_arg = $id" );
			
			++$sid;
		}
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
