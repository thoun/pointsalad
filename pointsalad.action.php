<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PointSalad implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * pointsalad.action.php
 *
 * PointSalad main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/pointsalad/pointsalad/myAction.html", ...)
 *
 */
  
  
  class action_pointsalad extends APP_GameAction { 
    // Constructor: please do not modify
   	public function __default() {
      if(self::isArg( 'notifwindow')) {
        $this->view = "common_notifwindow";
        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
      } else {
        $this->view = "pointsalad_pointsalad";
        self::trace( "Complete reinitialization of board game" );
      }
  	}
  	
    public function takeCards() {
      self::setAjaxMode();

      $idsStr = self::getArg("ids", AT_numberlist, false);
      $ids = explode(',', $idsStr);

      $this->game->takeCards(array_map(fn($id) => intval($id), $ids));

      self::ajaxResponse();
    }

    public function flipCard() {
      self::setAjaxMode();

      $id = self::getArg("id", AT_posint, true);

      $this->game->flipCard($id);

      self::ajaxResponse();
    }

    public function skipFlipCard() {
      self::setAjaxMode();

      $this->game->skipFlipCard();

      self::ajaxResponse();
    }
  	
    public function setAskFlipPhase() {
        self::setAjaxMode();

        $askFlipPhase = self::getArg("askFlipPhase", AT_bool, true);

        $this->game->setAskFlipPhase($askFlipPhase);

        self::ajaxResponse();
    }

  }
  

