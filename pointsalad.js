function slideToObjectAndAttach(game, object, destinationId) {
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
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[Star\]/ig, '<span class="icon points"></span>')
        .replace(/\[Heart\]/ig, '<span class="icon health"></span>')
        .replace(/\[Energy\]/ig, '<span class="icon energy"></span>')
        .replace(/\[dice1\]/ig, '<span class="dice-icon dice1"></span>')
        .replace(/\[dice2\]/ig, '<span class="dice-icon dice2"></span>')
        .replace(/\[dice3\]/ig, '<span class="dice-icon dice3"></span>')
        .replace(/\[diceHeart\]/ig, '<span class="dice-icon dice4"></span>')
        .replace(/\[diceEnergy\]/ig, '<span class="dice-icon dice5"></span>')
        .replace(/\[diceSmash\]/ig, '<span class="dice-icon dice6"></span>')
        .replace(/\[dieFateEye\]/ig, '<span class="dice-icon die-of-fate eye"></span>')
        .replace(/\[dieFateRiver\]/ig, '<span class="dice-icon die-of-fate river"></span>')
        .replace(/\[dieFateSnake\]/ig, '<span class="dice-icon die-of-fate snake"></span>')
        .replace(/\[dieFateAnkh\]/ig, '<span class="dice-icon die-of-fate ankh"></span>')
        .replace(/\[berserkDieEnergy\]/ig, '<span class="dice-icon berserk dice1"></span>')
        .replace(/\[berserkDieDoubleEnergy\]/ig, '<span class="dice-icon berserk dice2"></span>')
        .replace(/\[berserkDieSmash\]/ig, '<span class="dice-icon berserk dice3"></span>')
        .replace(/\[berserkDieDoubleSmash\]/ig, '<span class="dice-icon berserk dice5"></span>')
        .replace(/\[berserkDieSkull\]/ig, '<span class="dice-icon berserk dice6"></span>')
        .replace(/\[keep\]/ig, "<span class=\"card-keep-text\"><span class=\"outline\">".concat(_('Keep'), "</span><span class=\"text\">").concat(_('Keep'), "</span></span>"));
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
                "player-veggies-".concat(player.id, "-").concat(card.veggie));
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
            if (gamedatas.pileTopCard[pile]) {
                this_1.game.createOrMoveCard(gamedatas.pileTopCard[pile], "pile".concat(pile), true);
            }
            gamedatas.market[pile].filter(function (card) { return !!card; }).forEach(function (card) { return _this.game.createOrMoveCard(card, "market-row".concat(card.locationArg, "-card").concat(pile)); });
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
    return TableCenter;
}());
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
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
        log("Ending game setup");
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
    PointSalad.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    PointSalad.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            _this.veggieCounters[playerId] = [];
            var html = "";
            for (var veggie = 1; veggie <= 6; veggie++) {
                if (veggie === 1 || veggie === 4) {
                    html += "<div class=\"counters\">";
                }
                html += "\n                    <div id=\"veggie".concat(veggie, "-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                        <div class=\"icon\" data-veggie=\"").concat(veggie, "\"></div> \n                        <span id=\"veggie").concat(veggie, "-counter-").concat(player.id, "\"></span>\n                    </div>");
                if (veggie === 3 || veggie === 6) {
                    html += "</div>";
                }
            }
            dojo.place(html, "player_board_".concat(player.id));
            for (var veggie = 1; veggie <= 6; veggie++) {
                var veggieCounter = new ebg.counter();
                veggieCounter.create("veggie".concat(veggie, "-counter-").concat(player.id));
                veggieCounter.setValue(player.veggieCounts[veggie]);
                _this.veggieCounters[playerId][veggie] = veggieCounter;
            }
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
    PointSalad.prototype.createOrMoveCard = function (card, destinationId, init) {
        var _this = this;
        if (init === void 0) { init = false; }
        var existingDiv = document.getElementById("card-".concat(card.id));
        if (existingDiv) {
            existingDiv.dataset.side = '' + card.side;
            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            }
            else {
                slideToObjectAndAttach(this, existingDiv, destinationId);
            }
        }
        else {
            var div = document.createElement('div');
            div.id = "card-".concat(card.id);
            div.classList.add('card');
            div.dataset.side = '' + card.side;
            div.dataset.veggie = '' + card.veggie;
            div.dataset.index = '' + card.index;
            document.getElementById(destinationId).appendChild(div);
            div.addEventListener('click', function () { return _this.onCardClick(card); });
        }
    };
    PointSalad.prototype.updateVeggieCount = function (playerId, veggieCounts) {
        for (var veggie = 1; veggie <= 6; veggie++) {
            this.veggieCounters[playerId][veggie].toValue(veggieCounts[veggie]);
        }
    };
    PointSalad.prototype.checkSelection = function () {
        var _a, _b;
        var canTakeCards = (this.selectedCards.length === 1 && this.selectedCards[0].side === 0) ||
            (this.selectedCards.length === 2 && this.selectedCards[0].side === 1); // TODO handle only 1 remaining market card
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
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    PointSalad.prototype.notif_points = function (notif) {
        var _a;
        (_a = this.scoreCtrl[notif.args.playerId]) === null || _a === void 0 ? void 0 : _a.toValue(notif.args.points);
    };
    PointSalad.prototype.notif_takenCards = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        notif.args.cards.forEach(function (card) {
            return _this.createOrMoveCard(card, card.side === 0 ? "player-points-".concat(playerId) : "player-veggies-".concat(playerId, "-").concat(card.veggie));
        });
        this.updateVeggieCount(playerId, notif.args.veggieCounts);
        var pile = notif.args.pile;
        var pileTop = notif.args.pileTop;
        var pileCount = notif.args.pileCount;
        if (pileTop) {
            this.createOrMoveCard(pileTop, "pile".concat(pile));
        }
        if (pileCount !== null) {
            this.tableCenter.pileCounters[pile].setValue(pileCount);
        }
    };
    PointSalad.prototype.notif_flippedCard = function (notif) {
        var playerId = notif.args.playerId;
        var card = notif.args.card;
        this.createOrMoveCard(card, "player-veggies-".concat(playerId, "-").concat(card.veggie));
        this.updateVeggieCount(playerId, notif.args.veggieCounts);
    };
    PointSalad.prototype.notif_marketRefill = function (notif) {
        var pile = notif.args.pile;
        var card = notif.args.card;
        this.createOrMoveCard(card, "market-row".concat(card.locationArg, "-card").concat(pile));
        var pileTop = notif.args.pileTop;
        this.createOrMoveCard(pileTop, "pile".concat(pile));
        this.tableCenter.pileCounters[pile].setValue(notif.args.pileCount);
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
