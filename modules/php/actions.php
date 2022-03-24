<?php

// waiting for PHP8
function str_starts_with ( $haystack, $needle ) {
    return strpos( $haystack , $needle ) === 0;
}

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function takeCards(array $ids) {
        self::checkAction('takeCards'); 
        
        $playerId = self::getActivePlayerId();

        $cards = $this->getCardsFromDb($this->card->getCards($ids));

        if (count($cards) === 2) {
            if ($this->array_some($cards, fn($card) => !str_starts_with('market', $card->location))) {
                throw new BgaUserException("If you take two cards, it must be from the market");
            }
        } else if (count($cards) === 1) {
            if (!str_starts_with('pile', $cards[0]->location)) {
                throw new BgaUserException("If you take one card, it must be from a pile");
            }
        } else {
            throw new BgaUserException("You must take one or two card(s)");
        }

        $this->cards->moveCards($ids, 'player', $playerId);
        /* TODO notif
        self::notifyAllPlayers('placedDeparturePawn', clienttranslate('${player_name} places departure pawn'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'position' => $position,
        ]);

        //self::incStat(1, 'placedRoutes');
        //self::incStat(1, 'placedRoutes', $playerId);*/

        $this->updateScore($playerId);

        $hasPointCard = intval(self::getUniqueValueFromDB("SELECT count(*) FROM `card` WHERE card_location_id = $playerId AND `card_type_arg` = 1")) > 0;

        $this->gamestate->nextState($hasPointCard ? 'flipCard' : 'nextPlayer');
    }
        
  	
    public function flipCard(int $id) {
        self::checkAction('flipCard'); 
        
        $playerId = intval(self::getActivePlayerId());

        $card = $this->getCardFromDb($this->card->getCard($id));

        if ($card->location !== 'player' || $card->locationArg !== $playerId) {
            throw new BgaUserException("You can't flip this card");
        }

        $this->applyFlipCard($card);

        $this->updateScore($playerId);

        //self::incStat(1, 'placedRoutes');
        //self::incStat(1, 'placedRoutes', $playerId);*/

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function skipFlipCard() {
        self::checkAction('skipFlipCard'); 

        $this->gamestate->nextState('nextPlayer');
    }
}
