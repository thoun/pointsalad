<?php

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

        $cards = $this->getCardsFromDb($this->cards->getCards($ids));

        $tookVeggie = false;
        if (count($cards) === 2) { // TODO handle one remaining veggie case
            if ($this->array_some($cards, fn($card) => strpos($card->location, 'market') !== 0)) { // str_starts_with is PHP8+, using strpos( $haystack , $needle ) === 0 instead
                throw new BgaUserException("If you take two cards, it must be from the market");
            }
            $tookVeggie = true;
        } else if (count($cards) === 1) {
            if (strpos($cards[0]->location, 'pile') !== 0) { // str_starts_with is PHP8+, using strpos( $haystack , $needle ) === 0 instead
                throw new BgaUserException("If you take one card, it must be from a pile");
            }
        } else {
            throw new BgaUserException("You must take one or two card(s)");
        }

        $this->cards->moveCards($ids, 'player', $playerId);

        $message = $tookVeggie ? clienttranslate('${player_name} took veggies ${veggies}') // TODO add icon
                               : clienttranslate('${player_name} took a point card');
        
        self::notifyAllPlayers('takenCards', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'cards' => $cards,
            'veggies' => array_map(fn($card) => $card->veggie, $cards),
            'veggieCounts' => $this->getVeggieCountsByPlayer($playerId),
            'pile' => $tookVeggie ? null : intval(substr($cards[0]->location, 4)),
            'pileTop' => $tookVeggie ? null : $this->getCardFromDb($this->cards->getCardOnTop($cards[0]->location)),
            'pileCount' => $tookVeggie ? null : intval($this->cards->countCardInLocation($cards[0]->location)),
        ]);

        if ($tookVeggie) {
            $this->refillMarket();
        }

        //self::incStat(1, 'placedRoutes');
        //self::incStat(1, 'placedRoutes', $playerId);*/

        $this->updateScore($playerId);

        $hasPointCard = intval(self::getUniqueValueFromDB("SELECT count(*) FROM `card` WHERE `card_location` = 'player' AND `card_location_arg` = $playerId AND `card_type_arg` = 0")) > 0;

        $this->gamestate->nextState($hasPointCard ? 'flipCard' : 'nextPlayer');
    }
        
  	
    public function flipCard(int $id) {
        self::checkAction('flipCard'); 
        
        $playerId = intval(self::getActivePlayerId());

        $card = $this->getCardFromDb($this->cards->getCard($id));

        if ($card->location !== 'player' || $card->locationArg !== $playerId) {
            throw new BgaUserException("You can't flip this card");
        }

        $this->applyFlipCard($playerId, $card);

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
