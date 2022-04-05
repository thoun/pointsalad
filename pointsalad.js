function slideToObjectAndAttach(game, object, destinationId, changeSide) {
    if (changeSide === void 0) { changeSide = false; }
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return;
    }
    var originBR = object.getBoundingClientRect();
    destination.appendChild(object);
    if (document.visibilityState !== 'hidden' && !game.instantaneousMode) {
        var destinationBR = object.getBoundingClientRect();
        var deltaX = destinationBR.left - originBR.left;
        var deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px)");
        setTimeout(function () {
            object.style.transition = "transform 0.5s linear";
            object.style.transform = null;
        });
        setTimeout(function () {
            object.style.zIndex = null;
            object.style.transition = null;
        }, 600);
    }
}
function slideFromObject(game, object, fromId) {
    var from = document.getElementById(fromId);
    var originBR = from.getBoundingClientRect();
    if (document.visibilityState !== 'hidden' && !game.instantaneousMode) {
        var destinationBR = object.getBoundingClientRect();
        var deltaX = destinationBR.left - originBR.left;
        var deltaY = destinationBR.top - originBR.top;
        object.style.zIndex = '10';
        object.style.transform = "translate(".concat(-deltaX, "px, ").concat(-deltaY, "px)");
        setTimeout(function () {
            object.style.transition = "transform 0.5s linear";
            object.style.transform = null;
        });
        setTimeout(function () {
            object.style.zIndex = null;
            object.style.transition = null;
        }, 600);
    }
}
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[veggie(\d)\]/ig, function (_, veggie) { return "<div class=\"icon\" data-veggie=\"".concat(veggie, "\"></div>"); })
        .replace(/\[(\-?\d+)\]/ig, function (_, points) { return "<div class=\"icon points\">".concat(points, "</div>"); });
}
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        var html = "\n        <div id=\"player-table-".concat(player.id, "\" class=\"player-table whiteblock\">\n            <div id=\"player-name-").concat(player.id, "\" class=\"player-name\" style=\"color: #").concat(player.color, "\">").concat(player.name, "</div> \n            <div id=\"player-points-").concat(player.id, "\" class=\"player-points\"></div>\n            <div id=\"player-veggies-").concat(player.id, "\" class=\"player-veggies\">\n        ");
        for (var veggie = 1; veggie <= 6; veggie++) {
            html += "<div id=\"player-veggies-".concat(player.id, "-").concat(veggie, "\" class=\"player-veggie\"></div>");
        }
        html += "</div></div>";
        dojo.place(html, this.playerId === this.game.getPlayerId() ? 'currentplayertable' : 'playerstables');
        player.cards.forEach(function (card) {
            return _this.game.createOrMoveCard(card, card.side === 0 ?
                "player-points-".concat(player.id) :
                "player-veggies-".concat(player.id, "-").concat(card.veggie), _this.game.getPlayerCardTooltip(card));
        });
    }
    return PlayerTable;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.pileCounters = [];
        var _loop_1 = function (pile) {
            var pileTop = gamedatas.pileTopCard[pile];
            if (pileTop) {
                this_1.game.createOrMoveCard(pileTop, "pile".concat(pile), this_1.game.getMarketCardTooltip(pileTop), true);
            }
            gamedatas.market[pile].filter(function (card) { return !!card; }).forEach(function (card) { return _this.game.createOrMoveCard(card, "market-row".concat(card.locationArg, "-card").concat(pile), _this.game.getMarketCardTooltip(card)); });
            var pileCounter = new ebg.counter();
            pileCounter.create("pile".concat(pile, "-counter"));
            pileCounter.setValue(gamedatas.pileCount[pile]);
            this_1.pileCounters[pile] = pileCounter;
        };
        var this_1 = this;
        for (var pile = 1; pile <= 3; pile++) {
            _loop_1(pile);
        }
    }
    TableCenter.prototype.setPileCounts = function (pileCounts) {
        for (var pile = 1; pile <= 3; pile++) {
            this.pileCounters[pile].setValue(pileCounts[pile]);
        }
    };
    return TableCenter;
}());
var CABBAGE = 1;
var CARROT = 2;
var LETTUCE = 3;
var ONION = 4;
var PEPPER = 5;
var TOMATO = 6;
function evenOdd(veggie) {
    return formatTextIcons("\n        <div class=\"margin\">\n            <div class=\"flex\">[veggie".concat(veggie, "]</div>\n            <div class=\"flex\">\n                <span class=\"flex wrap\">").concat(_('Even total'), "</span>\n                <span>=</span>\n                <span>[7]</span>\n            </div>\n            <div class=\"flex\">\n                <span class=\"flex wrap\">").concat(_('Odd total'), "</span>\n                <span>=</span>\n                <span>[3]</span>\n            </div>\n        </div>\n    "));
}
function mostLeast(word, veggie) {
    return formatTextIcons("\n        <div class=\"flex\">\n            <span class=\"flex wrap\">".concat(word, " [veggie").concat(veggie, "]</span>\n            <span>=</span>\n            <span>[10]</span>\n        </div>\n    "));
}
function most(veggie) {
    return mostLeast(_('Most'), veggie);
}
function least(veggie) {
    return mostLeast(_('Least'), veggie);
}
function sets(sets) {
    return formatTextIcons(sets.map(function (set) { return "<div>[".concat(set[0], "]/[veggie").concat(set[1], "]</div>"); }).join(''));
}
function pairSet(veggies) {
    return formatTextIcons("\n    <div class=\"multiple-set\">\n        ".concat(veggies.map(function (veggie, index) { return "<span data-index=\"".concat(index, "\">[veggie").concat(veggie, "]</span>"); }).join('<span class="plus">+</span>'), "\n        =[5]</div>\n    "));
}
function tripletSet(veggies) {
    return formatTextIcons("\n    <div class=\"multiple-set\">\n        ".concat(veggies.map(function (veggie, index) { return "<span data-index=\"".concat(index, "\">[veggie").concat(veggie, "]</span>"); }).join('<span class="plus">+</span>'), "\n    </div>\n    <div class=\"flex\">=[8]</div>\n    "));
}
var CARDS_EFFECTS = [];
CARDS_EFFECTS[CABBAGE] = [
    null,
    // special
    function () { return formatTextIcons("\n        <div class=\"flex\">\n            <span>[5]</span>\n            <span>/</span>\n            <span>".concat(_('Missing veggie type'), "</span>\n        </div>\n    ")); },
    // odd/even
    function () { return evenOdd(CARROT); },
    // most
    function () { return most(CARROT); },
    // least
    function () { return least(CARROT); },
    // 2/V
    function () { return sets([[2, CARROT]]); },
    // 1/V 1/V (x1)
    function () { return sets([[1, CARROT], [1, PEPPER]]); },
    function () { return sets([[1, CARROT], [1, LETTUCE]]); },
    // 3/V -2/V
    function () { return sets([[3, CARROT], [-2, ONION]]); },
    // 2/V 1/V -2/V
    function () { return sets([[2, CARROT], [1, PEPPER], [-2, ONION]]); },
    // 2/V 2/V -4/V
    function () { return sets([[2, CARROT], [2, ONION], [-4, PEPPER]]); },
    // 3/V -1/V -1/V
    function () { return sets([[3, CARROT], [-1, PEPPER], [-1, CABBAGE]]); },
    // 4/V -2/V -2/V
    function () { return sets([[4, CARROT], [-2, LETTUCE], [-2, TOMATO]]); },
    // V+V = 5 (x3)
    function () { return pairSet([CARROT, CARROT]); },
    function () { return pairSet([LETTUCE, ONION]); },
    function () { return pairSet([TOMATO, PEPPER]); },
    // V+V+V = 8 (x3)
    function () { return tripletSet([CARROT, CARROT, CARROT]); },
    function () { return tripletSet([CABBAGE, CARROT, TOMATO]); },
    function () { return tripletSet([LETTUCE, CARROT, ONION]); },
];
CARDS_EFFECTS[CARROT] = [
    null,
    // special
    function () { return formatTextIcons("<div class=\"flex\">[5]<span>/</span><span>".concat(_('Veggie type with at least 3'), "</span></div>")); },
    // odd/even
    function () { return evenOdd(CABBAGE); },
    // most
    function () { return most(CABBAGE); },
    // least
    function () { return least(CABBAGE); },
    // 2/V
    function () { return sets([[2, CABBAGE]]); },
    // 1/V 1/V (x2)
    function () { return sets([[1, CABBAGE], [1, LETTUCE]]); },
    function () { return sets([[1, CABBAGE], [1, PEPPER]]); },
    // 3/V -2/V
    function () { return sets([[3, CABBAGE], [-2, TOMATO]]); },
    // 2/V 1/V -2/V
    function () { return sets([[2, CABBAGE], [1, LETTUCE], [-2, CARROT]]); },
    // 2/V 2/V -4/V
    function () { return sets([[2, CABBAGE], [2, TOMATO], [-4, LETTUCE]]); },
    // 3/V -1/V -1/V
    function () { return sets([[3, CABBAGE], [-1, LETTUCE], [-1, CARROT]]); },
    // 4/V -2/V -2/V
    function () { return sets([[4, CABBAGE], [-2, PEPPER], [-2, ONION]]); },
    // V+V = 5 (x3)
    function () { return pairSet([CABBAGE, CABBAGE]); },
    function () { return pairSet([TOMATO, LETTUCE]); },
    function () { return pairSet([ONION, PEPPER]); },
    // V+V+V = 8 (x3)
    function () { return tripletSet([CABBAGE, CABBAGE, CABBAGE]); },
    function () { return tripletSet([PEPPER, CABBAGE, TOMATO]); },
    function () { return tripletSet([CARROT, CABBAGE, ONION]); },
];
CARDS_EFFECTS[LETTUCE] = [
    null,
    // special
    function () { return formatTextIcons("<div class=\"flex\"><span>".concat(_('Lowest veggie total'), "</span> = [7]</div>")); },
    // odd/even
    function () { return evenOdd(PEPPER); },
    // most
    function () { return most(PEPPER); },
    // least
    function () { return least(PEPPER); },
    // 2/V
    function () { return sets([[2, PEPPER]]); },
    // 1/V 1/V (x2)
    function () { return sets([[1, PEPPER], [1, ONION]]); },
    function () { return sets([[1, PEPPER], [1, TOMATO]]); },
    // 3/V -2/V
    function () { return sets([[3, PEPPER], [-2, CABBAGE]]); },
    // 2/V 1/V -2/V
    function () { return sets([[2, PEPPER], [1, TOMATO], [-2, LETTUCE]]); },
    // 2/V 2/V -4/V
    function () { return sets([[2, PEPPER], [2, CABBAGE], [-4, TOMATO]]); },
    // 3/V -1/V -1/V
    function () { return sets([[3, PEPPER], [-1, TOMATO], [-1, LETTUCE]]); },
    // 4/V -2/V -2/V
    function () { return sets([[4, PEPPER], [-2, ONION], [-2, CARROT]]); },
    // V+V = 5 (x3)
    function () { return pairSet([PEPPER, PEPPER]); },
    function () { return pairSet([CARROT, TOMATO]); },
    function () { return pairSet([CABBAGE, ONION]); },
    // V+V+V = 8 (x3)
    function () { return tripletSet([PEPPER, PEPPER, PEPPER]); },
    function () { return tripletSet([LETTUCE, PEPPER, CARROT]); },
    function () { return tripletSet([ONION, PEPPER, CABBAGE]); },
];
CARDS_EFFECTS[ONION] = [
    null,
    // special
    function () { return formatTextIcons("<div class=\"flex\">[5]<span>/</span><span>".concat(_('Veggie type with at least 2'), "</span></div>")); },
    // odd/even
    function () { return evenOdd(TOMATO); },
    // most
    function () { return most(TOMATO); },
    // least
    function () { return least(TOMATO); },
    // 2/V
    function () { return sets([[2, TOMATO]]); },
    // 1/V 1/V (x2)
    function () { return sets([[1, TOMATO], [1, CARROT]]); },
    function () { return sets([[1, TOMATO], [1, CABBAGE]]); },
    // 3/V -2/V
    function () { return sets([[3, TOMATO], [-2, LETTUCE]]); },
    // 2/V 1/V -2/V
    function () { return sets([[2, TOMATO], [1, CARROT], [-2, ONION]]); },
    // 2/V 2/V -4/V
    function () { return sets([[2, TOMATO], [2, LETTUCE], [-4, CARROT]]); },
    // 3/V -1/V -1/V
    function () { return sets([[3, TOMATO], [-1, CARROT], [-1, ONION]]); },
    // 4/V -2/V -2/V
    function () { return sets([[4, TOMATO], [-2, CABBAGE], [-2, PEPPER]]); },
    // V+V = 5 (x3)
    function () { return pairSet([TOMATO, TOMATO]); },
    function () { return pairSet([CARROT, PEPPER]); },
    function () { return pairSet([CABBAGE, LETTUCE]); },
    // V+V+V = 8 (x3)
    function () { return tripletSet([TOMATO, TOMATO, TOMATO]); },
    function () { return tripletSet([CABBAGE, TOMATO, LETTUCE]); },
    function () { return tripletSet([ONION, TOMATO, PEPPER]); },
];
CARDS_EFFECTS[PEPPER] = [
    null,
    // special
    function () { return formatTextIcons("<div class=\"flex\"><span>".concat(_('Highest veggie total'), "</span>=[7]</div>")); },
    // odd/even
    function () { return evenOdd(LETTUCE); },
    // most
    function () { return most(LETTUCE); },
    // least
    function () { return least(LETTUCE); },
    // 2/V
    function () { return sets([[2, LETTUCE]]); },
    // 1/V 1/V (x2)
    function () { return sets([[1, LETTUCE], [1, TOMATO]]); },
    function () { return sets([[1, LETTUCE], [1, ONION]]); },
    // 3/V -2/V
    function () { return sets([[3, LETTUCE], [-2, CARROT]]); },
    // 2/V 1/V -2/V
    function () { return sets([[2, LETTUCE], [1, ONION], [-2, PEPPER]]); },
    // 2/V 2/V -4/V
    function () { return sets([[2, LETTUCE], [2, CARROT], [-4, ONION]]); },
    // 3/V -1/V -1/V
    function () { return sets([[3, LETTUCE], [-1, ONION], [-1, PEPPER]]); },
    // 4/V -2/V -2/V
    function () { return sets([[4, LETTUCE], [-2, TOMATO], [-2, CABBAGE]]); },
    // V+V = 5 (x3)
    function () { return pairSet([LETTUCE, LETTUCE]); },
    function () { return pairSet([CARROT, ONION]); },
    function () { return pairSet([CABBAGE, TOMATO]); },
    // V+V+V = 8 (x3)
    function () { return tripletSet([LETTUCE, LETTUCE, LETTUCE]); },
    function () { return tripletSet([PEPPER, LETTUCE, CABBAGE]); },
    function () { return tripletSet([TOMATO, LETTUCE, CARROT]); },
];
CARDS_EFFECTS[TOMATO] = [
    null,
    // special
    function () { return formatTextIcons("\n    <div class=\"flex complete-set top\">[veggie6][veggie3][veggie2]</div>\n    <div class=\"flex\"><span>[12]</span><span>/</span><span>".concat(_('Complete set'), "</span></div>\n    <div class=\"flex complete-set bottom\">[veggie1][veggie5][veggie4]</div>\n    ")); },
    // odd/even
    function () { return evenOdd(ONION); },
    // most
    function () { return most(ONION); },
    // least
    function () { return least(ONION); },
    // 2/V
    function () { return sets([[2, ONION]]); },
    // 1/V 1/V (x2)
    function () { return sets([[1, ONION], [1, CARROT]]); },
    function () { return sets([[1, ONION], [1, CABBAGE]]); },
    // 3/V -2/V
    function () { return sets([[3, ONION], [-2, PEPPER]]); },
    // 2/V 1/V -2/V
    function () { return sets([[2, ONION], [1, CABBAGE], [-2, TOMATO]]); },
    // 2/V 2/V -4/V
    function () { return sets([[2, ONION], [2, PEPPER], [-4, CABBAGE]]); },
    // 3/V -1/V -1/V
    function () { return sets([[3, ONION], [-1, CABBAGE], [-1, TOMATO]]); },
    // 4/V -2/V -2/V
    function () { return sets([[4, ONION], [-2, CARROT], [-2, LETTUCE]]); },
    // V+V = 5 (x3)
    function () { return pairSet([ONION, ONION]); },
    function () { return pairSet([CABBAGE, PEPPER]); },
    function () { return pairSet([CARROT, LETTUCE]); },
    // V+V+V = 8 (x3)
    function () { return tripletSet([ONION, ONION, ONION]); },
    function () { return tripletSet([CARROT, ONION, PEPPER]); },
    function () { return tripletSet([TOMATO, ONION, LETTUCE]); },
];
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ANIMATION_MS = 500;
var PointSalad = /** @class */ (function () {
    function PointSalad() {
        this.playersTables = [];
        this.selectedCards = [];
        this.veggieCounters = [];
        this.canTakeOnlyOneVeggie = false;
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    PointSalad.prototype.setup = function (gamedatas) {
        var _this = this;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        if (gamedatas.cardScores) {
            Object.keys(gamedatas.cardScores).forEach(function (key) { return _this.setCardScore(Number(key), gamedatas.cardScores[key]); });
        }
        this.setupNotifications();
        log("Ending game setup");
        // TODO TEMP
        //this.debugSeeAllPointCards();
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    PointSalad.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'takeCards':
                this.onEnteringTakeCards(args.args);
                break;
            case 'flipCard':
                this.onEnteringFlipCard(args.args);
                break;
        }
    };
    PointSalad.prototype.onEnteringTakeCards = function (args) {
        if (this.isCurrentPlayerActive()) {
            document.getElementById('table').dataset.selectableCards = 'true';
            this.canTakeOnlyOneVeggie = args.canTakeOnlyOneVeggie;
        }
    };
    PointSalad.prototype.onEnteringFlipCard = function (args) {
        if (this.isCurrentPlayerActive()) {
            document.getElementById("player-points-".concat(this.getPlayerId())).dataset.selectableCards = 'true';
        }
    };
    PointSalad.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'takeCards':
                this.onLeavingTakeCards();
                break;
            case 'flipCard':
                this.onLeavingFlipCard();
                break;
        }
    };
    PointSalad.prototype.onLeavingTakeCards = function () {
        this.selectedCards = [];
        Array.from(document.getElementsByClassName('card selected')).forEach(function (card) { return card.classList.remove('selected'); });
        document.getElementById('table').dataset.selectableCards = 'false';
    };
    PointSalad.prototype.onLeavingFlipCard = function () {
        this.selectedCards = [];
        Array.from(document.getElementsByClassName('card selected')).forEach(function (card) { return card.classList.remove('selected'); });
        var playerPoints = document.getElementById("player-points-".concat(this.getPlayerId()));
        if (playerPoints) {
            playerPoints.dataset.selectableCards = 'false';
        }
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    PointSalad.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'takeCards':
                    this.addActionButton('takeCards_button', _("Take selected card(s)"), function () { return _this.takeCards(_this.selectedCards.map(function (card) { return card.id; })); });
                    this.checkSelection();
                    break;
                case 'flipCard':
                    this.addActionButton('flipCard_button', _("Flip selected card"), function () { return _this.flipCard(_this.selectedCards[0].id); });
                    this.addActionButton('skipFlipCard_button', _("Skip"), function () { return _this.skipFlipCard(); });
                    this.checkSelection();
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    // gameui.debugSeeAllPointCards()
    PointSalad.prototype.debugSeeAllPointCards = function () {
        var html = "<div id=\"all-point-cards\">";
        for (var veggie = 1; veggie <= 6; veggie++) {
            html += "<div id=\"all-point-cards-".concat(veggie, "\" style=\"display: flex; flex-wrap: nowrap;\"></div>");
        }
        html += "</div>";
        dojo.place(html, 'full-table', 'before');
        for (var veggie = 1; veggie <= 6; veggie++) {
            for (var i = 1; i <= 12; i++) {
                this.createOrMoveCard({
                    id: 1000 * veggie + i,
                    side: 0,
                    index: i,
                    veggie: veggie,
                }, "all-point-cards-".concat(veggie), 'for test only');
            }
        }
    };
    PointSalad.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    PointSalad.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    PointSalad.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            _this.veggieCounters[playerId] = [];
            var html = "<div id=\"veggie-counters-".concat(playerId, "\">");
            for (var veggie = 1; veggie <= 6; veggie++) {
                if (veggie === 1 || veggie === 4) {
                    html += "<div class=\"counters\">";
                }
                html += "\n                    <div id=\"veggie".concat(veggie, "-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                        <div class=\"icon\" data-veggie=\"").concat(veggie, "\"></div> \n                        <span id=\"veggie").concat(veggie, "-counter-").concat(player.id, "\"></span>\n                    </div>");
                if (veggie === 3 || veggie === 6) {
                    html += "</div>";
                }
            }
            html += "</div>";
            dojo.place(html, "player_board_".concat(player.id));
            for (var veggie = 1; veggie <= 6; veggie++) {
                var veggieCounter = new ebg.counter();
                veggieCounter.create("veggie".concat(veggie, "-counter-").concat(player.id));
                veggieCounter.setValue(player.veggieCounts[veggie]);
                _this.veggieCounters[playerId][veggie] = veggieCounter;
            }
            _this.setTooltip("veggie-counters-".concat(playerId), _("Veggie counters"));
        });
    };
    PointSalad.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        orderedPlayers.forEach(function (player) { return _this.createPlayerTable(gamedatas, Number(player.id)); });
    };
    PointSalad.prototype.createPlayerTable = function (gamedatas, playerId) {
        var playerTable = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(playerTable);
    };
    PointSalad.prototype.getZoom = function () {
        return 1;
    };
    PointSalad.prototype.getVeggieName = function (veggie) {
        switch (veggie) {
            case CABBAGE: return _('Cabbage');
            case CARROT: return _('Carrot');
            case LETTUCE: return _('Lettuce');
            case ONION: return _('Onion');
            case PEPPER: return _('Pepper');
            case TOMATO: return _('Tomato');
        }
    };
    PointSalad.prototype.createOrMoveCard = function (card, destinationId, tooltip, init, from) {
        var _this = this;
        var _a, _b;
        if (init === void 0) { init = false; }
        if (from === void 0) { from = null; }
        var existingDiv = document.getElementById("card-".concat(card.id));
        if (existingDiv) {
            this.removeTooltip("card-".concat(card.id));
            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            }
            else {
                slideToObjectAndAttach(this, existingDiv, destinationId);
            }
            existingDiv.dataset.side = '' + card.side;
            this.setTooltip(existingDiv.id, tooltip);
        }
        else {
            var name_1 = this.getVeggieName(card.veggie);
            var div = document.createElement('div');
            div.id = "card-".concat(card.id);
            div.classList.add('card');
            div.dataset.side = '' + card.side;
            div.dataset.veggie = '' + card.veggie;
            div.dataset.index = '' + card.index;
            div.innerHTML = "\n                <div class=\"card-sides\">\n                    <div class=\"card-side front\">\n                        <div>".concat(((_b = (_a = CARDS_EFFECTS[card.veggie]) === null || _a === void 0 ? void 0 : _a[card.index]) === null || _b === void 0 ? void 0 : _b.call(_a)) || '', "</div>\n                    </div>\n                    <div class=\"card-side back\">\n                        <div class=\"name\">").concat(name_1, "</div>\n                        <div class=\"name rotated\">").concat(name_1, "</div>\n                    </div>\n                </div>\n            ");
            document.getElementById(destinationId).appendChild(div);
            div.addEventListener('click', function () { return _this.onCardClick(card); });
            if (from) {
                var fromCardId = document.getElementById(from).children[0].id;
                slideFromObject(this, div, fromCardId);
            }
            this.setTooltip(div.id, tooltip);
        }
    };
    PointSalad.prototype.getPointSideTooltip = function (card) {
        return "";
    };
    PointSalad.prototype.getPlayerCardTooltip = function (card) {
        if (card.side === 0) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Point card"), "</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(_("At the end of the game, score Victory Points if you match the card conditions with your veggie cards. You may score a point card multiple times."), "</div>\n                    <div>").concat(this.getPointSideTooltip(card), "</div>\n                </div>\n            </div>");
        }
        else if (card.side === 1) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Veggie card"), "</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(this.getVeggieName(card.veggie), "</div>\n                </div>\n            </div>");
        }
    };
    PointSalad.prototype.getMarketCardTooltip = function (card) {
        if (card.side === 0) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Draw pile"), " (").concat(_("Point card"), ")</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(_("At your turn, you can take one Point card from the draw pile."), "</div>\n                    <div>").concat(this.getPointSideTooltip(card), "</div>\n                </div>\n            </div>");
        }
        else if (card.side === 1) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Veggie market"), " (").concat(_("Veggie card"), ")</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(_("At your turn, you can take two Veggie cards from the market."), "</div>\n                    <div>").concat(this.getVeggieName(card.veggie), "</div>\n                </div>\n            </div>");
        }
    };
    PointSalad.prototype.updateVeggieCount = function (playerId, veggieCounts) {
        for (var veggie = 1; veggie <= 6; veggie++) {
            this.veggieCounters[playerId][veggie].toValue(veggieCounts[veggie]);
        }
    };
    PointSalad.prototype.getSide = function (cardId) {
        var div = document.getElementById("card-".concat(cardId));
        return Number(div.dataset.side);
    };
    PointSalad.prototype.setCardScore = function (cardId, cardScore) {
        dojo.place(formatTextIcons("<div class=\"final-score\">[".concat(cardScore, "]</div>")), "card-".concat(cardId));
    };
    PointSalad.prototype.checkSelection = function () {
        var _this = this;
        var _a, _b;
        var canTakeCards = (this.selectedCards.length === 1 && this.getSide(this.selectedCards[0].id) === 0) ||
            (this.selectedCards.length === (this.canTakeOnlyOneVeggie ? 1 : 2) && this.selectedCards.every(function (card) { return _this.getSide(card.id) === 1; }));
        (_a = document.getElementById('takeCards_button')) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', !canTakeCards);
        (_b = document.getElementById('flipCard_button')) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', this.selectedCards.length !== 1);
    };
    PointSalad.prototype.onCardClick = function (card) {
        var div = document.getElementById("card-".concat(card.id));
        if (!this.isCurrentPlayerActive() || !div.closest('[data-selectable-cards="true"]')) {
            return;
        }
        var index = this.selectedCards.indexOf(card);
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        else {
            this.selectedCards.push(card);
        }
        div.classList.toggle('selected');
        this.checkSelection();
    };
    PointSalad.prototype.takeCards = function (ids) {
        if (!this.checkAction('takeCards')) {
            return;
        }
        this.takeAction('takeCards', {
            ids: ids.join(','),
        });
    };
    PointSalad.prototype.flipCard = function (id) {
        if (!this.checkAction('flipCard')) {
            return;
        }
        this.takeAction('flipCard', {
            id: id
        });
    };
    PointSalad.prototype.skipFlipCard = function () {
        if (!this.checkAction('skipFlipCard')) {
            return;
        }
        this.takeAction('skipFlipCard');
    };
    PointSalad.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/pointsalad/pointsalad/".concat(action, ".html"), data, this, function () { });
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    PointSalad.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['points', 1],
            ['takenCards', ANIMATION_MS],
            ['flippedCard', ANIMATION_MS],
            ['marketRefill', ANIMATION_MS],
            ['pileRefill', ANIMATION_MS],
            ['cardScore', 1000],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    PointSalad.prototype.notif_points = function (notif) {
        var _this = this;
        Object.keys(notif.args.points).forEach(function (playerId) { var _a; return (_a = _this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(notif.args.points[playerId]); });
    };
    PointSalad.prototype.notif_takenCards = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        notif.args.cards.forEach(function (card) {
            return _this.createOrMoveCard(card, card.side === 0 ? "player-points-".concat(playerId) : "player-veggies-".concat(playerId, "-").concat(card.veggie), _this.getPlayerCardTooltip(card));
        });
        this.updateVeggieCount(playerId, notif.args.veggieCounts);
        var pile = notif.args.pile;
        var pileTop = notif.args.pileTop;
        var pileCount = notif.args.pileCount;
        if (pileTop) {
            this.createOrMoveCard(pileTop, "pile".concat(pile), this.getMarketCardTooltip(pileTop));
        }
        if (pileCount !== null) {
            this.tableCenter.pileCounters[pile].setValue(pileCount);
        }
    };
    PointSalad.prototype.notif_flippedCard = function (notif) {
        var playerId = notif.args.playerId;
        var card = notif.args.card;
        this.createOrMoveCard(card, "player-veggies-".concat(playerId, "-").concat(card.veggie), this.getPlayerCardTooltip(card));
        this.updateVeggieCount(playerId, notif.args.veggieCounts);
    };
    PointSalad.prototype.notif_marketRefill = function (notif) {
        var pile = notif.args.pile;
        var card = notif.args.card;
        this.createOrMoveCard(card, "market-row".concat(card.locationArg, "-card").concat(pile), this.getMarketCardTooltip(card));
        var pileTop = notif.args.pileTop;
        if (pileTop) {
            this.createOrMoveCard(pileTop, "pile".concat(pile), this.getMarketCardTooltip(pileTop));
        }
        this.tableCenter.pileCounters[pile].setValue(notif.args.pileCount);
    };
    PointSalad.prototype.notif_pileRefill = function (notif) {
        var pile = notif.args.pile;
        var pileTop = notif.args.pileTop;
        if (pileTop) {
            this.createOrMoveCard(pileTop, "pile".concat(pile), this.getMarketCardTooltip(pileTop), false, "pile".concat(notif.args.fromPile));
        }
        this.tableCenter.setPileCounts(notif.args.pileCounts);
    };
    PointSalad.prototype.notif_cardScore = function (notif) {
        this.setCardScore(notif.args.card.id, notif.args.cardScore);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    PointSalad.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (args.veggies && typeof args.veggies == 'object') {
                    args.veggies = args.veggies.map(function (veggie) { return "<div class=\"icon\" data-veggie=\"".concat(veggie, "\"></div>"); }).join('');
                }
                /*['card_name', 'card_name2'].forEach(cardArg => {
                    if (args[cardArg]) {
                        let types: number[] = null;
                        if (typeof args[cardArg] == 'number') {
                            types = [args[cardArg]];
                        } else if (typeof args[cardArg] == 'string' && args[cardArg][0] >= '0' && args[cardArg][0] <= '9') {
                            types = args[cardArg].split(',').map((cardType: string) => Number(cardType));
                        }
                        if (types !== null) {
                            const tags: string[] = types.map((cardType: number) => {
                                const cardLogId = this.cardLogId++;

                                setTimeout(() => (this as any).addTooltipHtml(`card-log-${cardLogId}`, this.getLogCardTooltip(cardType)), 500);

                                return `<strong id="card-log-${cardLogId}" data-log-type="${cardType}">${this.getLogCardName(cardType)}</strong>`;
                            });
                            args[cardArg] = tags.join(', ');
                        }
                    }
                });

                for (const property in args) {
                    if (args[property]?.indexOf?.(']') > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }

                log = formatTextIcons(_(log));*/
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return PointSalad;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.pointsalad", ebg.core.gamegui, new PointSalad());
});
