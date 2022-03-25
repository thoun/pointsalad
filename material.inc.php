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
 * material.inc.php
 *
 * PointSalad game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

if (!function_exists('evenOdd')) {

  function evenOdd(array $veggieCounts, int $veggie) {
    return $veggieCounts[$veggie] % 2 === 0 ? 7 : 3;
  }

  function set(array $veggieCounts, array $veggies, int $points) {
    if (count($veggies) === 1) {
      return $veggieCounts[$veggies[0]] * $points;
    } else if (count($veggies) === 2) {
      if ($veggies[0] === $veggies[1]) {
        return floor($veggieCounts[$veggies[0]] / 2) * $points;
      } else {
        return min($veggieCounts[$veggies[0]], $veggieCounts[$veggies[1]]) * $points;
      }
    } else if (count($veggies) === 3) {
      if ($veggies[0] === $veggies[1]) {
        return floor($veggieCounts[$veggies[0]] / 3) * $points;
      } else {
        return min($veggieCounts[$veggies[0]], $veggieCounts[$veggies[1]], $veggieCounts[$veggies[2]]) * $points;
      }
    } else if (count($veggies) === 6) {
      return min($veggieCounts[$veggies[0]], $veggieCounts[$veggies[1]], $veggieCounts[$veggies[2]], $veggieCounts[$veggies[3]], $veggieCounts[$veggies[4]], $veggieCounts[$veggies[5]]) * $points;
    }
    throw new BgaVisibleSystemException('Invalid veggies count: ' . count($veggies));
  }

  function most(array $veggieCounts, int $veggie, array $otherPlayersVeggieCounts) {
    $playerCount = $veggieCounts[$veggie];

    foreach ($otherPlayersVeggieCounts as $otherPlayerVeggieCounts) {
      if ($otherPlayerVeggieCounts[$veggie] > $playerCount) {
        return 0;
      }
    }

    return 10;
  }

  function least(array $veggieCounts, int $veggie, array $otherPlayersVeggieCounts) {
    $playerCount = $veggieCounts[$veggie];

    foreach ($otherPlayersVeggieCounts as $otherPlayerVeggieCounts) {
      if ($otherPlayerVeggieCounts[$veggie] < $playerCount) {
        return 0;
      }
    }

    return 10;
  }

  function missing(array $veggieCounts) {
    $missing = 0;
    for ($i=1; $i<=6; $i++) {
      if ($veggieCounts[$i] === 0) {
        $missing++;
      }
    }
    return 5 * $missing;
  }

}

$this->CARDS_EFFECTS = [
  
  1 => [
    // special
    1 => fn($veggieCounts) => missing($veggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, CARROT),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, CARROT, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, CARROT, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, [CARROT], 2),
    // 1/V 1/V (x3)
    6 => fn($veggieCounts) => set($veggieCounts, [CARROT], 1) + set($veggieCounts, [PEPPER], 1),
    7 => fn($veggieCounts) => set($veggieCounts, [CARROT], 1) + set($veggieCounts, [LETTUCE], 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, [CARROT], 3) + set($veggieCounts, [ONION], -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, [CARROT], 2) + set($veggieCounts, [PEPPER], 1) + set($veggieCounts, [CABBAGE], -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, [CARROT], 2) + set($veggieCounts, [ONION], 2) + set($veggieCounts, [PEPPER], -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, [CARROT], 3) + set($veggieCounts, [PEPPER], -1) + set($veggieCounts, [CABBAGE], -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, [CARROT], 4) + set($veggieCounts, [LETTUCE], -2) + set($veggieCounts, [TOMATO], -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => set($veggieCounts, [CARROT, CARROT], 5),
    14 => fn($veggieCounts) => set($veggieCounts, [LETTUCE, ONION], 5),
    15 => fn($veggieCounts) => set($veggieCounts, [TOMATO, PEPPER], 5),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => set($veggieCounts, [CARROT, CARROT, CARROT], 8),
    17 => fn($veggieCounts) => set($veggieCounts, [CABBAGE, CARROT, TOMATO], 8),
    18 => fn($veggieCounts) => set($veggieCounts, [LETTUCE, CARROT, ONION], 8),
  ],

  2 => [

  ],
  3 => [

  ],
  4 => [

  ],
  5 => [

  ],
  6 => [

  ],
];
