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
        $cardsCount = count($cards);

        $tookVeggie = false;
        if ($cardsCount === 2) {
            if ($this->array_some($cards, fn($card) => strpos($card->location, 'market') !== 0)) { // str_starts_with is PHP8+, using strpos( $haystack , $needle ) === 0 instead
                throw new BgaUserException("If you take two cards, it must be from the market");
            }
            $tookVeggie = true;
        } else if ($cardsCount === 1) {
            if (strpos($cards[0]->location, 'pile') !== 0) { // str_starts_with is PHP8+, using strpos( $haystack , $needle ) === 0 instead
                if ($this->getRemainingCardCountOnMarket() === 1 && strpos($cards[0]->location, 'market') === 0) { // in case only 1 veggie remains
                    $tookVeggie = true;
                } else {
                    throw new BgaUserException("If you take one card, it must be from a pile");
                }
            }
        } else {
            throw new BgaUserException("You must take one or two card(s)");
        }
        $pointCardFromPile = $tookVeggie ? null : intval(substr($cards[0]->location, 4));

        $pointCardsCountBefore = $this->getPlayerPointCardsCount($playerId);

        $this->cards->moveCards($ids, 'player', $playerId);

        $pointCardsCountAfter = $this->getPlayerPointCardsCount($playerId);

        $message = $tookVeggie ? clienttranslate('${player_name} took veggies ${veggies}')
                               : clienttranslate('${player_name} took a point card');
        
        self::notifyAllPlayers('takenCards', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'cards' => $cards,
            'veggies' => array_map(fn($card) => $card->veggie, $cards),
            'veggieCounts' => $this->getVeggieCountsByPlayer($playerId),
            'pile' => $tookVeggie ? null : $pointCardFromPile,
            'pileTop' => $tookVeggie ? null : $this->getCardFromDb($this->cards->getCardOnTop($cards[0]->location)),
            'pileCount' => $tookVeggie ? null : intval($this->cards->countCardInLocation($cards[0]->location)),
            'showAskFlipCard' => $pointCardsCountBefore === 0 && $pointCardsCountAfter > 0,
        ]);

        if ($tookVeggie) {
            $this->refillMarket();
            
            self::incStat($cardsCount, 'veggieFromMarket');
            self::incStat($cardsCount, 'veggieFromMarket', $playerId);

            foreach($cards as $card) {
                $pile = intval(substr($cards[0]->location, 6));
                if (intval($this->cards->countCardInLocation('pile'.$pile)) == 0) {
                    $this->refillPile($pile);
                }
            }
        } else {
            if (intval($this->cards->countCardInLocation('pile'.$pointCardFromPile)) == 0) {
                $this->refillPile($pointCardFromPile);
            }

            self::incStat($cardsCount, 'pointsFromMarket');
            self::incStat($cardsCount, 'pointsFromMarket', $playerId);
        }

        $this->updateScores();

        $hasPointCard = intval(self::getUniqueValueFromDB("SELECT count(*) FROM `card` WHERE `card_location` = 'player' AND `card_location_arg` = $playerId AND `card_type_arg` = 0")) > 0;
        $goToFlipCard = $hasPointCard && $this->getAskFlipPhase($playerId);

        $this->gamestate->nextState($goToFlipCard ? 'flipCard' : 'nextPlayer');
    }
        
  	
    public function flipCard(int $id) {
        self::checkAction('flipCard'); 
        
        $playerId = intval(self::getActivePlayerId());

        $card = $this->getCardFromDb($this->cards->getCard($id));

        if ($card->location !== 'player' || $card->locationArg !== $playerId) {
            throw new BgaUserException("You can't flip this card");
        }

        $this->applyFlipCard($playerId, $card);

        $this->updateScores();

        self::incStat(1, 'flippedCards');
        self::incStat(1, 'flippedCards', $playerId);

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function skipFlipCard() {
        self::checkAction('skipFlipCard'); 

        $this->gamestate->nextState('nextPlayer');
    }

    function setAskFlipPhase(bool $askFlipPhase) {
        $playerId = $this->getCurrentPlayerId();
        $this->DbQuery("UPDATE `player` SET `player_ask_flip_phase` = ".($askFlipPhase ? 1 : 0)." WHERE `player_id` = $playerId"); 

        // dummy notif so player gets back hand
        $this->notifyPlayer($playerId, "setAskFlipPhase", '', []);

        // if the player set he don't want to be asked when he is at flip state, automatically Skip for the player
        if (!$askFlipPhase && $this->getActivePlayerId() == $playerId && intval($this->gamestate->state_id()) == ST_PLAYER_FLIP_CARD) {
            $this->gamestate->nextState('nextPlayer');
        }
    }
}
