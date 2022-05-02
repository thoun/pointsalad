<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PointSalad implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * PointSalad game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in pointsalad.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = [    
    100 => [
        'name' => totranslate('Scoring'),
        'values' => [
            1 => [
                'name' => totranslate('Visible'),
            ],
            2 => [
                'name' => totranslate('Hidden'),
                'tmdisplay' => totranslate('Hidden scoring'),
            ],
        ],
        'default' => 1,
    ],
];

$game_preferences = [
    201 => [
        'name' => totranslate('Countdown timer for Skip button'),
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            2 => ['name' => totranslate('Disabled')],
        ],
        'default' => 1
    ],
];


