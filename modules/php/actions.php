<?php

use Bga\GameFramework\UserException;

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
        
        $playerId = (int)$this->getActivePlayerId();

        $cards = $this->getCardsFromDb($this->cards->getCards($ids));
        $cardsCount = count($cards);

        $tookVeggie = false;
        if ($cardsCount === 2) {
            if (array_any($cards, fn($card) => !str_starts_with($card->location, 'market'))) {
                throw new UserException("If you take two cards, it must be from the market");
            }
            $tookVeggie = true;
        } else if ($cardsCount === 1) {
            if (!str_starts_with($cards[0]->location, 'pile')) {
                if ($this->getRemainingCardCountOnMarket() === 1 && str_starts_with($cards[0]->location, 'market')) { // in case only 1 veggie remains
                    $tookVeggie = true;
                } else {
                    throw new UserException("If you take one card, it must be from a pile");
                }
            }
        } else {
            throw new UserException("You must take one or two card(s)");
        }
        $pointCardFromPile = $tookVeggie ? null : intval(substr($cards[0]->location, 4));

        $pointCardsCountBefore = $this->getPlayerPointCardsCount($playerId);

        $this->cards->moveCards($ids, 'player', $playerId);

        $pointCardsCountAfter = $this->getPlayerPointCardsCount($playerId);

        $message = $tookVeggie ? clienttranslate('${player_name} took veggies ${veggies}')
                               : clienttranslate('${player_name} took a point card');
        
        self::notifyAllPlayers('takenCards', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerNameById($playerId),
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
        } else {
            self::incStat($cardsCount, 'pointsFromMarket');
            self::incStat($cardsCount, 'pointsFromMarket', $playerId);
        }

        foreach($cards as $card) {
            $matches = [];
            preg_match('/\\d/', $card->location, $matches);
            $pile = intval($matches[0]);
            if (intval($this->cards->countCardInLocation('pile'.$pile)) == 0) {
                $this->refillPile($pile);
            }
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
            throw new UserException("You can't flip this card");
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
        if (!$askFlipPhase && $this->getActivePlayerId() == $playerId && $this->gamestate->getCurrentMainStateId() == ST_PLAYER_FLIP_CARD) {
            $this->gamestate->nextState('nextPlayer');
        }
    }
}
