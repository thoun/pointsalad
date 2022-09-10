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
function missingType() {
    return formatTextIcons("\n        <div class=\"flex\">\n            <span>[5]</span>\n            <span>/</span>\n            <span>".concat(_('Missing veggie type'), "</span>\n        </div>\n    "));
}
function typeWithLeast(param) {
    return formatTextIcons("<div class=\"flex\">[".concat(param[1], "]<span>/</span><span>").concat(_('Veggie type with at least ${least}').replace('${least}', param[0]), "</span></div>"));
}
function highestTotal() {
    return formatTextIcons("<div class=\"flex\"><span>".concat(_('Most total veggie'), "</span> = [10]</div>"));
}
function lowestTotal() {
    return formatTextIcons("<div class=\"flex\"><span>".concat(_('Lowest veggie total'), "</span> = [7]</div>"));
}
function completeSet() {
    return formatTextIcons("\n        <div class=\"flex complete-set top\">[veggie6][veggie3][veggie2]</div>\n        <div class=\"flex\"><span>[12]</span><span>/</span><span>".concat(_('Complete set'), "</span></div>\n        <div class=\"flex complete-set bottom\">[veggie1][veggie5][veggie4]</div>\n    "));
}
function evenOdd(veggie) {
    return formatTextIcons("\n        <div class=\"margin\">\n            <div class=\"flex\">[veggie".concat(veggie, "]</div>\n            <div class=\"flex\">\n                <span class=\"flex wrap\">").concat(_('Even total'), "</span>\n                <span>=</span>\n                <span>[7]</span>\n            </div>\n            <div class=\"flex\">\n                <span class=\"flex wrap\">").concat(_('Odd total'), "</span>\n                <span>=</span>\n                <span>[3]</span>\n            </div>\n        </div>\n    "));
}
function mostLeast(word, points, veggie) {
    return formatTextIcons("\n        <div class=\"flex\">\n            <span class=\"flex wrap\">".concat(word, " [veggie").concat(veggie, "]</span>\n            <span>=</span>\n            <span>[").concat(points, "]</span>\n        </div>\n    "));
}
function most(veggie) {
    return mostLeast(_('Most'), 10, veggie);
}
function least(veggie) {
    return mostLeast(_('Fewest'), 7, veggie);
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
    ['missingType'],
    // odd/even
    ['evenOdd', CARROT],
    // most
    ['most', CARROT],
    // least
    ['least', CARROT],
    // 2/V
    ['sets', [[2, CARROT]]],
    // 1/V 1/V (x1)
    ['sets', [[1, CARROT], [1, PEPPER]]],
    ['sets', [[1, CARROT], [1, LETTUCE]]],
    // 3/V -2/V
    ['sets', [[3, CARROT], [-2, ONION]]],
    // 2/V 1/V -2/V
    ['sets', [[2, CARROT], [1, PEPPER], [-2, CABBAGE]]],
    // 2/V 2/V -4/V
    ['sets', [[2, CARROT], [2, ONION], [-4, PEPPER]]],
    // 3/V -1/V -1/V
    ['sets', [[3, CARROT], [-1, PEPPER], [-1, CABBAGE]]],
    // 4/V -2/V -2/V
    ['sets', [[4, CARROT], [-2, LETTUCE], [-2, TOMATO]]],
    // V+V = 5 (x3)
    ['pairSet', [CARROT, CARROT]],
    ['pairSet', [LETTUCE, ONION]],
    ['pairSet', [TOMATO, PEPPER]],
    // V+V+V = 8 (x3)
    ['tripletSet', [CARROT, CARROT, CARROT]],
    ['tripletSet', [CABBAGE, CARROT, TOMATO]],
    ['tripletSet', [LETTUCE, CARROT, ONION]],
];
CARDS_EFFECTS[CARROT] = [
    null,
    // special
    ['typeWithLeast', [3, 5]],
    // odd/even
    ['evenOdd', CABBAGE],
    // most
    ['most', CABBAGE],
    // least
    ['least', CABBAGE],
    // 2/V
    ['sets', [[2, CABBAGE]]],
    // 1/V 1/V (x2)
    ['sets', [[1, CABBAGE], [1, LETTUCE]]],
    ['sets', [[1, CABBAGE], [1, PEPPER]]],
    // 3/V -2/V
    ['sets', [[3, CABBAGE], [-2, TOMATO]]],
    // 2/V 1/V -2/V
    ['sets', [[2, CABBAGE], [1, LETTUCE], [-2, CARROT]]],
    // 2/V 2/V -4/V
    ['sets', [[2, CABBAGE], [2, TOMATO], [-4, LETTUCE]]],
    // 3/V -1/V -1/V
    ['sets', [[3, CABBAGE], [-1, LETTUCE], [-1, CARROT]]],
    // 4/V -2/V -2/V
    ['sets', [[4, CABBAGE], [-2, PEPPER], [-2, ONION]]],
    // V+V = 5 (x3)
    ['pairSet', [CABBAGE, CABBAGE]],
    ['pairSet', [TOMATO, LETTUCE]],
    ['pairSet', [ONION, PEPPER]],
    // V+V+V = 8 (x3)
    ['tripletSet', [CABBAGE, CABBAGE, CABBAGE]],
    ['tripletSet', [PEPPER, CABBAGE, TOMATO]],
    ['tripletSet', [CARROT, CABBAGE, ONION]],
];
CARDS_EFFECTS[LETTUCE] = [
    null,
    // special
    ['lowestTotal'],
    // odd/even
    ['evenOdd', PEPPER],
    // most
    ['most', PEPPER],
    // least
    ['least', PEPPER],
    // 2/V
    ['sets', [[2, PEPPER]]],
    // 1/V 1/V (x2)
    ['sets', [[1, PEPPER], [1, ONION]]],
    ['sets', [[1, PEPPER], [1, TOMATO]]],
    // 3/V -2/V
    ['sets', [[3, PEPPER], [-2, CABBAGE]]],
    // 2/V 1/V -2/V
    ['sets', [[2, PEPPER], [1, TOMATO], [-2, LETTUCE]]],
    // 2/V 2/V -4/V
    ['sets', [[2, PEPPER], [2, CABBAGE], [-4, TOMATO]]],
    // 3/V -1/V -1/V
    ['sets', [[3, PEPPER], [-1, TOMATO], [-1, LETTUCE]]],
    // 4/V -2/V -2/V
    ['sets', [[4, PEPPER], [-2, ONION], [-2, CARROT]]],
    // V+V = 5 (x3)
    ['pairSet', [PEPPER, PEPPER]],
    ['pairSet', [CARROT, TOMATO]],
    ['pairSet', [CABBAGE, ONION]],
    // V+V+V = 8 (x3)
    ['tripletSet', [PEPPER, PEPPER, PEPPER]],
    ['tripletSet', [LETTUCE, PEPPER, CARROT]],
    ['tripletSet', [ONION, PEPPER, CABBAGE]],
];
CARDS_EFFECTS[ONION] = [
    null,
    // special
    ['typeWithLeast', [2, 3]],
    // odd/even
    ['evenOdd', TOMATO],
    // most
    ['most', TOMATO],
    // least
    ['least', TOMATO],
    // 2/V
    ['sets', [[2, TOMATO]]],
    // 1/V 1/V (x2)
    ['sets', [[1, TOMATO], [1, CARROT]]],
    ['sets', [[1, TOMATO], [1, CABBAGE]]],
    // 3/V -2/V
    ['sets', [[3, TOMATO], [-2, LETTUCE]]],
    // 2/V 1/V -2/V
    ['sets', [[2, TOMATO], [1, CARROT], [-2, ONION]]],
    // 2/V 2/V -4/V
    ['sets', [[2, TOMATO], [2, LETTUCE], [-4, CARROT]]],
    // 3/V -1/V -1/V
    ['sets', [[3, TOMATO], [-1, CARROT], [-1, ONION]]],
    // 4/V -2/V -2/V
    ['sets', [[4, TOMATO], [-2, CABBAGE], [-2, PEPPER]]],
    // V+V = 5 (x3)
    ['pairSet', [TOMATO, TOMATO]],
    ['pairSet', [CARROT, PEPPER]],
    ['pairSet', [CABBAGE, LETTUCE]],
    // V+V+V = 8 (x3)
    ['tripletSet', [TOMATO, TOMATO, TOMATO]],
    ['tripletSet', [CABBAGE, TOMATO, LETTUCE]],
    ['tripletSet', [ONION, TOMATO, PEPPER]],
];
CARDS_EFFECTS[PEPPER] = [
    null,
    // special
    ['highestTotal'],
    // odd/even
    ['evenOdd', LETTUCE],
    // most
    ['most', LETTUCE],
    // least
    ['least', LETTUCE],
    // 2/V
    ['sets', [[2, LETTUCE]]],
    // 1/V 1/V (x2)
    ['sets', [[1, LETTUCE], [1, TOMATO]]],
    ['sets', [[1, LETTUCE], [1, ONION]]],
    // 3/V -2/V
    ['sets', [[3, LETTUCE], [-2, CARROT]]],
    // 2/V 1/V -2/V
    ['sets', [[2, LETTUCE], [1, ONION], [-2, PEPPER]]],
    // 2/V 2/V -4/V
    ['sets', [[2, LETTUCE], [2, CARROT], [-4, ONION]]],
    // 3/V -1/V -1/V
    ['sets', [[3, LETTUCE], [-1, ONION], [-1, PEPPER]]],
    // 4/V -2/V -2/V
    ['sets', [[4, LETTUCE], [-2, TOMATO], [-2, CABBAGE]]],
    // V+V = 5 (x3)
    ['pairSet', [LETTUCE, LETTUCE]],
    ['pairSet', [CARROT, ONION]],
    ['pairSet', [CABBAGE, TOMATO]],
    // V+V+V = 8 (x3)
    ['tripletSet', [LETTUCE, LETTUCE, LETTUCE]],
    ['tripletSet', [PEPPER, LETTUCE, CABBAGE]],
    ['tripletSet', [TOMATO, LETTUCE, CARROT]],
];
CARDS_EFFECTS[TOMATO] = [
    null,
    // special
    ['completeSet'],
    // odd/even
    ['evenOdd', ONION],
    // most
    ['most', ONION],
    // least
    ['least', ONION],
    // 2/V
    ['sets', [[2, ONION]]],
    // 1/V 1/V (x2)
    ['sets', [[1, ONION], [1, CARROT]]],
    ['sets', [[1, ONION], [1, CABBAGE]]],
    // 3/V -2/V
    ['sets', [[3, ONION], [-2, PEPPER]]],
    // 2/V 1/V -2/V
    ['sets', [[2, ONION], [1, CABBAGE], [-2, TOMATO]]],
    // 2/V 2/V -4/V
    ['sets', [[2, ONION], [2, PEPPER], [-4, CABBAGE]]],
    // 3/V -1/V -1/V
    ['sets', [[3, ONION], [-1, CABBAGE], [-1, TOMATO]]],
    // 4/V -2/V -2/V
    ['sets', [[4, ONION], [-2, CARROT], [-2, LETTUCE]]],
    // V+V = 5 (x3)
    ['pairSet', [ONION, ONION]],
    ['pairSet', [CABBAGE, PEPPER]],
    ['pairSet', [CARROT, LETTUCE]],
    // V+V+V = 8 (x3)
    ['tripletSet', [ONION, ONION, ONION]],
    ['tripletSet', [CARROT, ONION, PEPPER]],
    ['tripletSet', [TOMATO, ONION, LETTUCE]],
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
        this.createPlayerJumps(gamedatas);
        this.scoreIsVisible = !this.gamedatas.hiddenScore;
        if (gamedatas.cardScores) {
            this.scoreIsVisible = true;
            Object.keys(gamedatas.cardScores).forEach(function (key) { return _this.setCardScore(Number(key), gamedatas.cardScores[key]); });
        }
        this.setupNotifications();
        this.setupPreferences();
        if (gamedatas.showAskFlipPhase) {
            this.addAskFlipPhaseToggle(gamedatas.askFlipPhase);
        }
        this.onScreenWidthChange = function () { return _this.placeMarket(); };
        log("Ending game setup");
        try {
            this.dummyCalls();
        }
        catch (e) { }
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
            case 'endScore':
                this.onEnteringShowScore();
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
    PointSalad.prototype.onEnteringShowScore = function () {
        var _this = this;
        this.scoreIsVisible = false;
        if (!this.isVisibleScoring()) {
            Object.keys(this.gamedatas.players).forEach(function (playerId) { var _a; return (_a = _this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.setValue(0); });
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
                    if (this.startActionTimer('skipFlipCard_button', 6)) {
                        this.addActionButton('stopActionTimer_button', _("Let me think!"), function () { return _this.stopActionTimer('skipFlipCard_button'); });
                    }
                    this.checkSelection();
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    PointSalad.prototype.isVisibleScoring = function () {
        return !this.gamedatas.hiddenScore;
    };
    // gameui.debugSeeAllPointCards()
    PointSalad.prototype.debugSeeAllPointCards = function () {
        var html = "<div id=\"all-point-cards\" style=\"min-width: fit-content;\">";
        for (var veggie = 1; veggie <= 6; veggie++) {
            html += "<div id=\"all-point-cards-".concat(veggie, "\" style=\"display: flex; flex-wrap: nowrap;\"></div>");
        }
        html += "</div>";
        dojo.place(html, 'full-table', 'before');
        for (var veggie = 1; veggie <= 6; veggie++) {
            for (var i = 1; i <= 18; i++) {
                var card = {
                    id: 1000 * veggie + i,
                    side: 0,
                    index: i,
                    veggie: veggie,
                };
                this.createOrMoveCard(card, "all-point-cards-".concat(veggie), this.getPlayerCardTooltip(card));
            }
        }
    };
    PointSalad.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    PointSalad.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    PointSalad.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
    };
    PointSalad.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            _this.veggieCounters[playerId] = [];
            var html = "";
            if (playerId === _this.getPlayerId()) {
                html += "<div id=\"rapid-actions\"></div>";
            }
            html += "<div id=\"veggie-counters-".concat(playerId, "\">");
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
            _this.setNewScore(playerId, Number(player.score));
        });
    };
    PointSalad.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    PointSalad.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) { return _this.createPlayerTable(gamedatas, Number(player.id)); });
    };
    PointSalad.prototype.createPlayerTable = function (gamedatas, playerId) {
        var playerTable = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(playerTable);
    };
    PointSalad.prototype.createPlayerJumps = function (gamedatas) {
        var _this = this;
        dojo.place("\n        <div id=\"jump-toggle\" class=\"jump-link toggle\">\n            \u21D4\n        </div>\n        <div id=\"jump-0\" class=\"jump-link\">\n            <div class=\"eye\"></div> ".concat(_('Market'), "\n        </div>"), "jump-controls");
        document.getElementById("jump-toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        document.getElementById("jump-0").addEventListener('click', function () { return _this.jumpToPlayer(0); });
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            dojo.place("<div id=\"jump-".concat(player.id, "\" class=\"jump-link\" style=\"color: #").concat(player.color, "; border-color: #").concat(player.color, ";\"><div class=\"eye\" style=\"background: #").concat(player.color, ";\"></div> ").concat(player.name, "</div>"), "jump-controls");
            document.getElementById("jump-".concat(player.id)).addEventListener('click', function () { return _this.jumpToPlayer(Number(player.id)); });
        });
        var jumpDiv = document.getElementById("jump-controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    PointSalad.prototype.jumpToggle = function () {
        document.getElementById("jump-controls").classList.toggle('folded');
    };
    PointSalad.prototype.jumpToPlayer = function (playerId) {
        var elementId = playerId === 0 ? "market" : "player-table-".concat(playerId);
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    PointSalad.prototype.placeMarket = function () {
        var market = document.getElementById('table');
        var largeScreen = document.getElementById("full-table").clientWidth >= 1020;
        document.getElementById(largeScreen ? "table-right" : "table-inner").appendChild(market);
    };
    PointSalad.prototype.startActionTimer = function (buttonId, time) {
        var _this = this;
        var _a;
        if (Number((_a = this.prefs[201]) === null || _a === void 0 ? void 0 : _a.value) == 2) {
            return false;
        }
        var button = document.getElementById(buttonId);
        this.actionTimerId = null;
        button.dataset.label = button.innerHTML;
        var _actionTimerSeconds = time;
        var actionTimerFunction = function () {
            var button = document.getElementById(buttonId);
            if (button == null) {
                window.clearInterval(_this.actionTimerId);
            }
            else if (_actionTimerSeconds-- > 1) {
                button.innerHTML = button.dataset.label + ' (' + _actionTimerSeconds + ')';
            }
            else {
                if (_this.actionTimerId !== null) {
                    window.clearInterval(_this.actionTimerId);
                    button.click();
                }
            }
        };
        actionTimerFunction();
        this.actionTimerId = window.setInterval(function () { return actionTimerFunction(); }, 1000);
        return true;
    };
    PointSalad.prototype.stopActionTimer = function (buttonId) {
        var button = document.getElementById(buttonId);
        button.innerHTML = button.dataset.label;
        window.clearInterval(this.actionTimerId);
        //this.actionTimerId = null;
        dojo.destroy('stopActionTimer_button');
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
    PointSalad.prototype.setNewScore = function (playerId, score) {
        var _this = this;
        var _a, _b;
        if (!this.scoreIsVisible) {
            setTimeout(function () {
                if (!_this.scoreIsVisible) {
                    Object.keys(_this.gamedatas.players).forEach(function (pId) { return document.getElementById("player_score_".concat(pId)).innerHTML = '-'; });
                }
            }, 100);
        }
        else {
            if (!isNaN(score)) {
                (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(score);
                console.log('setNewScore', playerId, score, (_b = this.scoreCtrl[playerId]) === null || _b === void 0 ? void 0 : _b.getValue());
            }
        }
    };
    PointSalad.prototype.createOrMoveCard = function (card, destinationId, tooltip, init, from) {
        var _this = this;
        var _a, _b, _c;
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
            var cardEffect = (_a = CARDS_EFFECTS[card.veggie]) === null || _a === void 0 ? void 0 : _a[card.index];
            var label = (_c = (_b = window)[cardEffect[0]]) === null || _c === void 0 ? void 0 : _c.call(_b, cardEffect[1]);
            div.innerHTML = "\n                <div class=\"card-sides\">\n                    <div class=\"card-side front\">\n                        <div>".concat(label, "</div>\n                    </div>\n                    <div class=\"card-side back\">\n                        <div class=\"name\">").concat(name_1, "</div>\n                        <div class=\"name rotated\">").concat(name_1, "</div>\n                    </div>\n                </div>\n            ");
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
        var _this = this;
        var _a;
        var cardEffect = (_a = CARDS_EFFECTS[card.veggie]) === null || _a === void 0 ? void 0 : _a[card.index];
        var tooltip = "<br>";
        switch (cardEffect[0]) {
            case 'missingType':
                tooltip += _("Score ${points} points for each veggie type you don't have").replace('${points}', "<strong>5</strong>");
                return tooltip;
            case 'typeWithLeast':
                tooltip += _('Score ${points} points for each veggie type where you have at least ${least} cards').replace('${least}', "<strong>".concat(cardEffect[1][0], "</strong>")).replace('${points}', "<strong>".concat(cardEffect[1][1], "</strong>"));
                return tooltip;
            case 'highestTotal':
                tooltip += _('Score ${points} points if you have the highest veggie count').replace('${points}', "<strong>10</strong>");
                return tooltip;
            case 'lowestTotal':
                tooltip += _('Score ${points} points if you have the lowest veggie count').replace('${points}', "<strong>7</strong>");
                return tooltip;
            case 'completeSet':
                tooltip += _('Score ${points} points for each complete set of veggies').replace('${points}', "<strong>12</strong>");
                return tooltip;
            case 'evenOdd':
                tooltip += _('Score ${pointsEven} points if you got an even number of ${veggieName}, or ${pointsOdd} points if you got an odd number of ${veggieName}. You need at least one ${veggieName} to score.').replace('${pointsEven}', "<strong>7</strong>").replace('${pointsOdd}', "<strong>3</strong>").replace(/\$\{veggieName\}/g, "<strong>".concat(this.getVeggieName(cardEffect[1]), "</strong>"));
                return tooltip;
            case 'most':
                tooltip += _('Score ${points} points if you are the player with the most ${veggieName} (you will score if you tie for the most).').replace('${points}', "<strong>10</strong>").replace('${veggieName}', "<strong>".concat(this.getVeggieName(cardEffect[1]), "</strong>"));
                return tooltip;
            case 'least':
                tooltip += _('Score ${points} points if you are the player with the fewest ${veggieName} (you will score if you tie for the fewest).').replace('${points}', "<strong>7</strong>").replace('${veggieName}', "<strong>".concat(this.getVeggieName(cardEffect[1]), "</strong>"));
                return tooltip;
            case 'sets':
                tooltip += cardEffect[1].map(function (set) { return _('Score ${points} points for each ${veggieName} card in your possession.').replace('${points}', "<strong>".concat(set[0], "</strong>")).replace('${veggieName}', "<strong>".concat(_this.getVeggieName(set[1]), "</strong>")); }).join("<br>".concat(_('AND'), "<br>"));
                return tooltip;
            case 'pairSet':
                var pairSet_1 = cardEffect[1];
                tooltip += pairSet_1[0] === pairSet_1[1] ?
                    _('Score ${points} points for each pair of ${veggieName} card in your possession.').replace('${points}', "<strong>5</strong>").replace('${veggieName}', "<strong>".concat(this.getVeggieName(pairSet_1[0]), "</strong>")) :
                    _('Score ${points} points for each set of ${veggieName1} and ${veggieName2} card in your possession.').replace('${points}', "<strong>5</strong>").replace('${veggieName1}', "<strong>".concat(this.getVeggieName(pairSet_1[0]), "</strong>")).replace('${veggieName2}', "<strong>".concat(this.getVeggieName(pairSet_1[1]), "</strong>"));
                return tooltip;
            case 'tripletSet':
                var tripletSet_1 = cardEffect[1];
                tooltip += tripletSet_1[0] === tripletSet_1[1] ?
                    _('Score ${points} points for each triplet of ${veggieName} card in your possession.').replace('${points}', "<strong>8</strong>").replace('${veggieName}', "<strong>".concat(this.getVeggieName(tripletSet_1[0]), "</strong>")) :
                    _('Score ${points} points for each set of ${veggieName1}, ${veggieName2} and ${veggieName3} card in your possession.').replace('${points}', "<strong>8</strong>").replace('${veggieName1}', "<strong>".concat(this.getVeggieName(tripletSet_1[0]), "</strong>")).replace('${veggieName2}', "<strong>".concat(this.getVeggieName(tripletSet_1[1]), "</strong>")).replace('${veggieName3}', "<strong>".concat(this.getVeggieName(tripletSet_1[2]), "</strong>"));
                return tooltip;
        }
        return "";
    };
    PointSalad.prototype.getPlayerCardTooltip = function (card) {
        if (card.side === 0) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Point card"), "</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(_("At the end of the game, score Victory Points if you match the card conditions with your veggie cards. You may score a point card multiple times."), "</div>\n                    <div>").concat(this.getPointSideTooltip(card), "</div>\n                </div>\n            </div>");
        }
        else if (card.side === 1) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Veggie card"), "</div>\n                <div class=\"card-tooltip-description\">\n                    <div><br><strong>").concat(this.getVeggieName(card.veggie), "</strong></div>\n                </div>\n            </div>");
        }
    };
    PointSalad.prototype.getMarketCardTooltip = function (card) {
        if (card.side === 0) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Draw pile"), " (").concat(_("Point card"), ")</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(_("At your turn, you can take one Point card from the draw pile."), "</div>\n                    <div>").concat(this.getPointSideTooltip(card), "</div>\n                </div>\n            </div>");
        }
        else if (card.side === 1) {
            return "<div class=\"card-tooltip\">\n                <div class=\"card-tooltip-name\">".concat(_("Veggie market"), " (").concat(_("Veggie card"), ")</div>\n                <div class=\"card-tooltip-description\">\n                    <div>").concat(_("At your turn, you can take two Veggie cards from the market."), "</div>\n                    <div><br><strong>").concat(this.getVeggieName(card.veggie), "</strong></div>\n                </div>\n            </div>");
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
    PointSalad.prototype.addAskFlipPhaseToggle = function (active) {
        var _this = this;
        if (!document.getElementById('askFlipPhaseWrapper')) {
            dojo.place("<div id=\"askFlipPhaseWrapper\">\n                <label class=\"switch\">\n                    <input id=\"askFlipPhaseCheckbox\" type=\"checkbox\" ".concat(active ? 'checked' : '', ">\n                    <span class=\"slider round\"></span>\n                </label>\n                <label for=\"askFlipPhaseCheckbox\" class=\"text-label\">").concat(_("Ask to flip cards"), "</label>\n            </div>"), 'rapid-actions');
            document.getElementById('askFlipPhaseCheckbox').addEventListener('change', function (e) { return _this.setAskFlipPhase(e.target.checked); });
            this.setTooltip('askFlipPhaseWrapper', _("Disable this is you don't want to be asked to flip a Point card."));
        }
    };
    PointSalad.prototype.removeAskFlipPhaseToggle = function () {
        var _a;
        var wrapper = document.getElementById('askFlipPhaseWrapper');
        (_a = wrapper === null || wrapper === void 0 ? void 0 : wrapper.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(wrapper);
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
    PointSalad.prototype.setAskFlipPhase = function (askFlipPhase) {
        this.takeNoLockAction('setAskFlipPhase', {
            askFlipPhase: askFlipPhase
        });
    };
    PointSalad.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/pointsalad/pointsalad/".concat(action, ".html"), data, this, function () { });
    };
    PointSalad.prototype.takeNoLockAction = function (action, data) {
        data = data || {};
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
        var _this = this;
        var _a;
        //log( 'notifications subscriptions setup' );
        var fastEndScoring = Number((_a = this.prefs[202]) === null || _a === void 0 ? void 0 : _a.value) == 1;
        var notifs = [
            ['points', 1],
            ['takenCards', ANIMATION_MS],
            ['flippedCard', ANIMATION_MS],
            ['marketRefill', ANIMATION_MS],
            ['pileRefill', ANIMATION_MS],
            ['cardScore', fastEndScoring ? 1 : 1000],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    PointSalad.prototype.notif_points = function (notif) {
        var _this = this;
        Object.keys(notif.args.points).forEach(function (playerId) {
            return _this.setNewScore(Number(playerId), notif.args.points[playerId]);
        });
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
        if (notif.args.showAskFlipCard && playerId == this.getPlayerId()) {
            this.addAskFlipPhaseToggle(true);
        }
    };
    PointSalad.prototype.notif_flippedCard = function (notif) {
        var playerId = notif.args.playerId;
        var card = notif.args.card;
        this.createOrMoveCard(card, "player-veggies-".concat(playerId, "-").concat(card.veggie), this.getPlayerCardTooltip(card));
        this.updateVeggieCount(playerId, notif.args.veggieCounts);
        if (notif.args.hideAskFlipCard && playerId == this.getPlayerId()) {
            this.removeAskFlipPhaseToggle();
        }
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
        var fromPile = notif.args.fromPile;
        var pileTop = notif.args.pileTop;
        var fromPileTop = notif.args.fromPileTop;
        if (pileTop) {
            this.createOrMoveCard(pileTop, "pile".concat(pile), this.getMarketCardTooltip(pileTop), false, "pile".concat(fromPile));
        }
        if (fromPileTop) {
            this.createOrMoveCard(fromPileTop, "pile".concat(fromPile), this.getMarketCardTooltip(fromPileTop), true);
        }
        this.tableCenter.setPileCounts(notif.args.pileCounts);
    };
    PointSalad.prototype.notif_cardScore = function (notif) {
        var _a;
        this.setCardScore(notif.args.card.id, notif.args.cardScore);
        if (!this.isVisibleScoring()) {
            (_a = this.scoreCtrl[notif.args.playerId]) === null || _a === void 0 ? void 0 : _a.incValue(notif.args.cardScore);
        }
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
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    // dummy calls x2 so functions aren't moved to inline function by optimization script
    PointSalad.prototype.dummyCalls = function () {
        // special
        missingType();
        typeWithLeast([]);
        highestTotal();
        lowestTotal();
        completeSet();
        // odd/even
        evenOdd(0);
        // most
        most(0);
        // least
        least(0);
        // sets
        sets([]);
        pairSet([]);
        tripletSet([]);
        // special
        missingType();
        typeWithLeast([]);
        highestTotal();
        lowestTotal();
        completeSet();
        // odd/even
        evenOdd(0);
        // most
        most(0);
        // least
        least(0);
        // sets
        sets([]);
        pairSet([]);
        tripletSet([]);
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
