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
    $veggieCount = $veggieCounts[$veggie];
    return $veggieCount === 0 ? 0 : ($veggieCount % 2 === 0 ? 7 : 3);
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

  function set(array $veggieCounts, int $veggie, int $points) {
    return $veggieCounts[$veggie] * $points;
  }

  function pairSet(array $veggieCounts, array $veggies) {
    if ($veggies[0] === $veggies[1]) {
      return floor($veggieCounts[$veggies[0]] / 2) * 5;
    } else {
      return min($veggieCounts[$veggies[0]], $veggieCounts[$veggies[1]]) * 5;
    }
  }

  function tripletSet(array $veggieCounts, array $veggies) {
    if ($veggies[0] === $veggies[1]) {
      return floor($veggieCounts[$veggies[0]] / 3) * 8;
    } else {
      return min($veggieCounts[$veggies[0]], $veggieCounts[$veggies[1]], $veggieCounts[$veggies[2]]) * 8;
    }
  }

  function completeSet(array $veggieCounts) {
    return min($veggieCounts) * 12;
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

  function anyTripletSet(array $veggieCounts) {
    $total = 0;
    foreach ($veggieCounts as $veggieCount) {
      if ($veggieCount >= 3) {
        $total++;
      }
    }
    return $total * 5;
  }

  function anyPairSet(array $veggieCounts) {
    $total = 0;
    foreach ($veggieCounts as $veggieCount) {
      if ($veggieCount >= 2) {
        $total++;
      }
    }
    return $total * 3;
  }

  function totalVeggies(array $veggieCounts) {
    $total = 0;
    foreach ($veggieCounts as $veggieCount) {
      $total += $veggieCount;
    }
    return $total;
  }

  function lowestTotal(array $veggieCounts, array $otherPlayersVeggieCounts) {
    $total = totalVeggies($veggieCounts);
    foreach ($otherPlayersVeggieCounts as $otherPlayerVeggieCounts) {
      if ($total > totalVeggies($otherPlayerVeggieCounts)) {
        return 0;
      }
    }
    return 7;
  }

  function highestTotal(array $veggieCounts, array $otherPlayersVeggieCounts) {
    $total = totalVeggies($veggieCounts);
    foreach ($otherPlayersVeggieCounts as $otherPlayerVeggieCounts) {
      if ($total < totalVeggies($otherPlayerVeggieCounts)) {
        return 0;
      }
    }
    return 10;
  }

}

$this->CARDS_EFFECTS = [
  
  CABBAGE => [
    // special
    1 => fn($veggieCounts) => missing($veggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, CARROT),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, CARROT, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, CARROT, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, CARROT, 2),
    // 1/V 1/V (x3)
    6 => fn($veggieCounts) => set($veggieCounts, CARROT, 1) + set($veggieCounts, PEPPER, 1),
    7 => fn($veggieCounts) => set($veggieCounts, CARROT, 1) + set($veggieCounts, LETTUCE, 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, CARROT, 3) + set($veggieCounts, ONION, -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, CARROT, 2) + set($veggieCounts, PEPPER, 1) + set($veggieCounts, CABBAGE, -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, CARROT, 2) + set($veggieCounts, ONION, 2) + set($veggieCounts, PEPPER, -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, CARROT, 3) + set($veggieCounts, PEPPER, -1) + set($veggieCounts, CABBAGE, -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, CARROT, 4) + set($veggieCounts, LETTUCE, -2) + set($veggieCounts, TOMATO, -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => pairSet($veggieCounts, [CARROT, CARROT]),
    14 => fn($veggieCounts) => pairSet($veggieCounts, [LETTUCE, ONION]),
    15 => fn($veggieCounts) => pairSet($veggieCounts, [TOMATO, PEPPER]),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => tripletSet($veggieCounts, [CARROT, CARROT, CARROT]),
    17 => fn($veggieCounts) => tripletSet($veggieCounts, [CABBAGE, CARROT, TOMATO]),
    18 => fn($veggieCounts) => tripletSet($veggieCounts, [LETTUCE, CARROT, ONION]),
  ],

  CARROT => [
    // special
    1 => fn($veggieCounts) => anyTripletSet($veggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, CABBAGE),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, CABBAGE, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, CABBAGE, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 2),
    // 1/V 1/V (x2)
    6 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 1) + set($veggieCounts, LETTUCE, 1),
    7 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 1) + set($veggieCounts, PEPPER, 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 3) + set($veggieCounts, TOMATO, -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 2) + set($veggieCounts, LETTUCE, 1) + set($veggieCounts, CARROT, -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 2) + set($veggieCounts, TOMATO, 2) + set($veggieCounts, LETTUCE, -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 3) + set($veggieCounts, LETTUCE, -1) + set($veggieCounts, CARROT, -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, CABBAGE, 4) + set($veggieCounts, PEPPER, -2) + set($veggieCounts, ONION, -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => pairSet($veggieCounts, [CABBAGE, CABBAGE]),
    14 => fn($veggieCounts) => pairSet($veggieCounts, [TOMATO, LETTUCE]),
    15 => fn($veggieCounts) => pairSet($veggieCounts, [ONION, PEPPER]),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => tripletSet($veggieCounts, [CABBAGE, CABBAGE, CABBAGE]),
    17 => fn($veggieCounts) => tripletSet($veggieCounts, [PEPPER, CABBAGE, TOMATO]),
    18 => fn($veggieCounts) => tripletSet($veggieCounts, [CARROT, CABBAGE, ONION]),
  ],

  LETTUCE => [
    // special
    1 => fn($veggieCounts, $otherPlayersVeggieCounts) => lowestTotal($veggieCounts, $otherPlayersVeggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, PEPPER),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, PEPPER, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, PEPPER, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, PEPPER, 2),
    // 1/V 1/V (x2)
    6 => fn($veggieCounts) => set($veggieCounts, PEPPER, 1) + set($veggieCounts, ONION, 1),
    7 => fn($veggieCounts) => set($veggieCounts, PEPPER, 1) + set($veggieCounts, TOMATO, 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, PEPPER, 3) + set($veggieCounts, CABBAGE, -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, PEPPER, 2) + set($veggieCounts, TOMATO, 1) + set($veggieCounts, LETTUCE, -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, PEPPER, 2) + set($veggieCounts, CABBAGE, 2) + set($veggieCounts, TOMATO, -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, PEPPER, 3) + set($veggieCounts, TOMATO, -1) + set($veggieCounts, LETTUCE, -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, PEPPER, 4) + set($veggieCounts, ONION, -2) + set($veggieCounts, CARROT, -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => pairSet($veggieCounts, [PEPPER, PEPPER]),
    14 => fn($veggieCounts) => pairSet($veggieCounts, [CARROT, TOMATO]),
    15 => fn($veggieCounts) => pairSet($veggieCounts, [CABBAGE, ONION]),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => tripletSet($veggieCounts, [PEPPER, PEPPER, PEPPER]),
    17 => fn($veggieCounts) => tripletSet($veggieCounts, [LETTUCE, PEPPER, CARROT]),
    18 => fn($veggieCounts) => tripletSet($veggieCounts, [ONION, PEPPER, CABBAGE]),
  ],
  
  ONION => [
    // special
    1 => fn($veggieCounts) => anyPairSet($veggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, TOMATO),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, TOMATO, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, TOMATO, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, TOMATO, 2),
    // 1/V 1/V (x2)
    6 => fn($veggieCounts) => set($veggieCounts, TOMATO, 1) + set($veggieCounts, CARROT, 1),
    7 => fn($veggieCounts) => set($veggieCounts, TOMATO, 1) + set($veggieCounts, CABBAGE, 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, TOMATO, 3) + set($veggieCounts, LETTUCE, -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, TOMATO, 2) + set($veggieCounts, CARROT, 1) + set($veggieCounts, ONION, -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, TOMATO, 2) + set($veggieCounts, LETTUCE, 2) + set($veggieCounts, CARROT, -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, TOMATO, 3) + set($veggieCounts, CARROT, -1) + set($veggieCounts, ONION, -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, TOMATO, 4) + set($veggieCounts, CABBAGE, -2) + set($veggieCounts, PEPPER, -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => pairSet($veggieCounts, [TOMATO, TOMATO]),
    14 => fn($veggieCounts) => pairSet($veggieCounts, [CARROT, PEPPER]),
    15 => fn($veggieCounts) => pairSet($veggieCounts, [CABBAGE, LETTUCE]),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => tripletSet($veggieCounts, [TOMATO, TOMATO, TOMATO]),
    17 => fn($veggieCounts) => tripletSet($veggieCounts, [CABBAGE, TOMATO, LETTUCE]),
    18 => fn($veggieCounts) => tripletSet($veggieCounts, [ONION, TOMATO, PEPPER]),
  ],
  
  PEPPER => [
    // special
    1 => fn($veggieCounts, $otherPlayersVeggieCounts) => highestTotal($veggieCounts, $otherPlayersVeggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, LETTUCE),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, LETTUCE, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, LETTUCE, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 2),
    // 1/V 1/V (x2)
    6 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 1) + set($veggieCounts, TOMATO, 1),
    7 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 1) + set($veggieCounts, ONION, 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 3) + set($veggieCounts, CARROT, -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 2) + set($veggieCounts, ONION, 1) + set($veggieCounts, PEPPER, -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 2) + set($veggieCounts, CARROT, 2) + set($veggieCounts, ONION, -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 3) + set($veggieCounts, ONION, -1) + set($veggieCounts, PEPPER, -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, LETTUCE, 4) + set($veggieCounts, TOMATO, -2) + set($veggieCounts, CABBAGE, -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => pairSet($veggieCounts, [LETTUCE, LETTUCE]),
    14 => fn($veggieCounts) => pairSet($veggieCounts, [CARROT, ONION]),
    15 => fn($veggieCounts) => pairSet($veggieCounts, [CABBAGE, TOMATO]),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => tripletSet($veggieCounts, [LETTUCE, LETTUCE, LETTUCE]),
    17 => fn($veggieCounts) => tripletSet($veggieCounts, [PEPPER, LETTUCE, CABBAGE]),
    18 => fn($veggieCounts) => tripletSet($veggieCounts, [TOMATO, LETTUCE, CARROT]),
  ],
  
  TOMATO => [
    // special
    1 => fn($veggieCounts) => completeSet($veggieCounts),
    // odd/even
    2 => fn($veggieCounts) => evenOdd($veggieCounts, ONION),
    // most
    3 => fn($veggieCounts, $otherPlayersVeggieCounts) => most($veggieCounts, ONION, $otherPlayersVeggieCounts),
    // least
    4 => fn($veggieCounts, $otherPlayersVeggieCounts) => least($veggieCounts, ONION, $otherPlayersVeggieCounts),
    // 2/V
    5 => fn($veggieCounts) => set($veggieCounts, ONION, 2),
    // 1/V 1/V (x2)
    6 => fn($veggieCounts) => set($veggieCounts, ONION, 1) + set($veggieCounts, CARROT, 1),
    7 => fn($veggieCounts) => set($veggieCounts, ONION, 1) + set($veggieCounts, CABBAGE, 1),
    // 3/V -2/V
    8 => fn($veggieCounts) => set($veggieCounts, ONION, 3) + set($veggieCounts, PEPPER, -2),
    // 2/V 1/V -2/V
    9 => fn($veggieCounts) => set($veggieCounts, ONION, 2) + set($veggieCounts, CABBAGE, 1) + set($veggieCounts, TOMATO, -2),
    // 2/V 2/V -4/V
    10 => fn($veggieCounts) => set($veggieCounts, ONION, 2) + set($veggieCounts, PEPPER, 2) + set($veggieCounts, CABBAGE, -4),
    // 3/V -1/V -1/V
    11 => fn($veggieCounts) => set($veggieCounts, ONION, 3) + set($veggieCounts, CABBAGE, -1) + set($veggieCounts, TOMATO, -1),
    // 4/V -2/V -2/V
    12 => fn($veggieCounts) => set($veggieCounts, ONION, 4) + set($veggieCounts, CARROT, -2) + set($veggieCounts, LETTUCE, -2),
    // V+V = 5 (x3)
    13 => fn($veggieCounts) => pairSet($veggieCounts, [ONION, ONION]),
    14 => fn($veggieCounts) => pairSet($veggieCounts, [CABBAGE, PEPPER]),
    15 => fn($veggieCounts) => pairSet($veggieCounts, [CARROT, LETTUCE]),
    // V+V+V = 8 (x3)
    16 => fn($veggieCounts) => tripletSet($veggieCounts, [ONION, ONION, ONION]),
    17 => fn($veggieCounts) => tripletSet($veggieCounts, [CARROT, ONION, PEPPER]),
    18 => fn($veggieCounts) => tripletSet($veggieCounts, [TOMATO, ONION, LETTUCE]),
  ],
];
