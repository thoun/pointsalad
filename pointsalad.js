function slideToObjectAndAttach(game, object, destinationId, posX, posY) {
    var _this = this;
    return new Promise(function (resolve) {
        var destination = document.getElementById(destinationId);
        if (destination.contains(object)) {
            return resolve(false);
        }
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            destination.appendChild(object);
            resolve(true);
        }
        else {
            object.style.zIndex = '10';
            var animation = (posX || posY) ?
                game.slideToObjectPos(object, destinationId, posX, posY) :
                game.slideToObject(object, destinationId);
            dojo.connect(animation, 'onEnd', dojo.hitch(_this, function () {
                object.style.top = 'unset';
                object.style.left = 'unset';
                object.style.position = 'relative';
                object.style.zIndex = 'unset';
                destination.appendChild(object);
                resolve(true);
            }));
            animation.play();
        }
    });
}
function transitionToObjectAndAttach(game, object, destinationId, zoom) {
    return new Promise(function (resolve) {
        var destination = document.getElementById(destinationId);
        if (destination.contains(object)) {
            return resolve(false);
        }
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            destination.appendChild(object);
            resolve(true);
        }
        else {
            var destinationBR = document.getElementById(destinationId).getBoundingClientRect();
            var originBR = object.getBoundingClientRect();
            var deltaX = destinationBR.left - originBR.left;
            var deltaY = destinationBR.top - originBR.top;
            object.style.zIndex = '10';
            object.style.transition = "transform 0.5s linear";
            object.style.transform = "translate(".concat(deltaX / zoom, "px, ").concat(deltaY / zoom, "px)");
            setTimeout(function () {
                object.style.zIndex = null;
                object.style.transition = null;
                object.style.transform = null;
                destination.appendChild(object);
                resolve(true);
            }, 500);
        }
    });
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
var CARD_WIDTH = 132;
var CARD_HEIGHT = 185;
var KEEP_CARDS_LIST = {
    base: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    dark: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
};
var DISCARD_CARDS_LIST = {
    base: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    dark: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19],
};
var COSTUME_CARDS_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var TRANSFORMATION_CARDS_LIST = [1];
var FLIPPABLE_CARDS = [301];
var Cards = /** @class */ (function () {
    function Cards(game) {
        this.game = game;
    }
    Cards.prototype.setupCards = function (stocks) {
        var version = this.game.isDarkEdition() ? 'dark' : 'base';
        var costumes = this.game.isHalloweenExpansion();
        var transformation = this.game.isMutantEvolutionVariant();
        var goldenscarab = this.game.isAnubisExpansion();
        stocks.forEach(function (stock) {
            var keepcardsurl = "".concat(g_gamethemeurl, "img/keep-cards.jpg");
            KEEP_CARDS_LIST[version].forEach(function (id, index) {
                stock.addItemType(id, id, keepcardsurl, index);
            });
            var discardcardsurl = "".concat(g_gamethemeurl, "img/discard-cards.jpg");
            DISCARD_CARDS_LIST[version].forEach(function (id, index) {
                stock.addItemType(100 + id, 100 + id, discardcardsurl, index);
            });
            if (costumes) {
                var costumecardsurl_1 = "".concat(g_gamethemeurl, "img/costume-cards.jpg");
                COSTUME_CARDS_LIST.forEach(function (id, index) {
                    stock.addItemType(200 + id, 200 + id, costumecardsurl_1, index);
                });
            }
            if (transformation) {
                var transformationcardsurl_1 = "".concat(g_gamethemeurl, "img/transformation-cards.jpg");
                COSTUME_CARDS_LIST.forEach(function (id, index) {
                    stock.addItemType(300 + id, 300 + id, transformationcardsurl_1, index);
                });
            }
            if (goldenscarab) {
                var anubiscardsurl = "".concat(g_gamethemeurl, "img/anubis-cards.jpg");
                stock.addItemType(999, 999, anubiscardsurl, 0);
            }
        });
    };
    Cards.prototype.getDistance = function (p1, p2) {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    };
    Cards.prototype.placeMimicOnCard = function (type, stock, card, wickednessTiles) {
        var divId = "".concat(stock.container_div.id, "_item_").concat(card.id);
        var div = document.getElementById(divId);
        if (type === 'tile') {
            var html = "<div id=\"".concat(divId, "-mimic-token-tile\" class=\"card-token mimic-tile stockitem\"></div>");
            dojo.place(html, divId);
            div.classList.add('wickedness-tile-stock');
            wickednessTiles.setDivAsCard(document.getElementById("".concat(divId, "-mimic-token-tile")), 106);
        }
        else {
            var div_1 = document.getElementById(divId);
            var cardPlaced = div_1.dataset.placed ? JSON.parse(div_1.dataset.placed) : { tokens: [] };
            cardPlaced.mimicToken = this.getPlaceOnCard(cardPlaced);
            var html = "<div id=\"".concat(divId, "-mimic-token\" style=\"left: ").concat(cardPlaced.mimicToken.x - 16, "px; top: ").concat(cardPlaced.mimicToken.y - 16, "px;\" class=\"card-token mimic token\"></div>");
            dojo.place(html, divId);
            div_1.dataset.placed = JSON.stringify(cardPlaced);
        }
    };
    Cards.prototype.removeMimicOnCard = function (type, stock, card) {
        var divId = "".concat(stock.container_div.id, "_item_").concat(card.id);
        var div = document.getElementById(divId);
        if (type === 'tile') {
            if (document.getElementById("".concat(divId, "-mimic-token-tile"))) {
                this.game.fadeOutAndDestroy("".concat(divId, "-mimic-token-tile"));
            }
            div.classList.remove('wickedness-tile-stock');
        }
        else {
            var cardPlaced = div.dataset.placed ? JSON.parse(div.dataset.placed) : { tokens: [] };
            cardPlaced.mimicToken = null;
            if (document.getElementById("".concat(divId, "-mimic-token"))) {
                this.game.fadeOutAndDestroy("".concat(divId, "-mimic-token"));
            }
            div.dataset.placed = JSON.stringify(cardPlaced);
        }
    };
    Cards.prototype.getPlaceOnCard = function (cardPlaced) {
        var _this = this;
        var newPlace = {
            x: Math.random() * 100 + 16,
            y: Math.random() * 100 + 16,
        };
        var protection = 0;
        var otherPlaces = cardPlaced.tokens.slice();
        if (cardPlaced.mimicToken) {
            otherPlaces.push(cardPlaced.mimicToken);
        }
        while (protection < 1000 && otherPlaces.some(function (place) { return _this.getDistance(newPlace, place) < 32; })) {
            newPlace.x = Math.random() * 100 + 16;
            newPlace.y = Math.random() * 100 + 16;
            protection++;
        }
        return newPlace;
    };
    Cards.prototype.placeTokensOnCard = function (stock, card, playerId) {
        var divId = "".concat(stock.container_div.id, "_item_").concat(card.id);
        var div = document.getElementById(divId);
        if (!div) {
            return;
        }
        var cardPlaced = div.dataset.placed ? JSON.parse(div.dataset.placed) : { tokens: [] };
        var placed = cardPlaced.tokens;
        var cardType = card.mimicType || card.type;
        // remove tokens
        for (var i = card.tokens; i < placed.length; i++) {
            if (cardType === 28 && playerId) {
                this.game.slideToObjectAndDestroy("".concat(divId, "-token").concat(i), "energy-counter-".concat(playerId));
            }
            else {
                this.game.fadeOutAndDestroy("".concat(divId, "-token").concat(i));
            }
        }
        placed.splice(card.tokens, placed.length - card.tokens);
        // add tokens
        for (var i = placed.length; i < card.tokens; i++) {
            var newPlace = this.getPlaceOnCard(cardPlaced);
            placed.push(newPlace);
            var html = "<div id=\"".concat(divId, "-token").concat(i, "\" style=\"left: ").concat(newPlace.x - 16, "px; top: ").concat(newPlace.y - 16, "px;\" class=\"card-token ");
            if (cardType === 28) {
                html += "energy-cube";
            }
            else if (cardType === 41) {
                html += "smoke-cloud token";
            }
            html += "\"></div>";
            dojo.place(html, divId);
        }
        div.dataset.placed = JSON.stringify(cardPlaced);
    };
    Cards.prototype.addCardsToStock = function (stock, cards, from) {
        var _this = this;
        if (!cards.length) {
            return;
        }
        cards.forEach(function (card) {
            stock.addToStockWithId(card.type, "".concat(card.id), from);
            var cardDiv = document.getElementById("".concat(stock.container_div.id, "_item_").concat(card.id));
            cardDiv.dataset.side = '' + card.side;
            if (card.side !== null) {
                _this.game.cards.updateFlippableCardTooltip(cardDiv);
            }
        });
        cards.filter(function (card) { return card.tokens > 0; }).forEach(function (card) { return _this.placeTokensOnCard(stock, card); });
    };
    Cards.prototype.moveToAnotherStock = function (sourceStock, destinationStock, card) {
        if (sourceStock === destinationStock) {
            return;
        }
        var sourceStockItemId = "".concat(sourceStock.container_div.id, "_item_").concat(card.id);
        if (document.getElementById(sourceStockItemId)) {
            this.addCardsToStock(destinationStock, [card], sourceStockItemId);
            //destinationStock.addToStockWithId(uniqueId, cardId, sourceStockItemId);
            sourceStock.removeFromStockById("".concat(card.id));
        }
        else {
            console.warn("".concat(sourceStockItemId, " not found in "), sourceStock);
            //destinationStock.addToStockWithId(uniqueId, cardId, sourceStock.container_div.id);
            this.addCardsToStock(destinationStock, [card], sourceStock.container_div.id);
        }
    };
    Cards.prototype.exchangeCardFromStocks = function (sourceStock, destinationStock, cardOnSource, cardOnDestination) {
        if (sourceStock === destinationStock) {
            return;
        }
        var sourceStockItemId = "".concat(sourceStock.container_div.id, "_item_").concat(cardOnSource.id);
        var destinationStockItemId = "".concat(destinationStock.container_div.id, "_item_").concat(cardOnDestination.id);
        this.addCardsToStock(destinationStock, [cardOnSource], sourceStockItemId);
        this.addCardsToStock(sourceStock, [cardOnDestination], destinationStockItemId);
        sourceStock.removeFromStockById("".concat(cardOnSource.id));
        destinationStock.removeFromStockById("".concat(cardOnDestination.id));
    };
    Cards.prototype.getCardNamePosition = function (cardTypeId, side) {
        if (side === void 0) { side = null; }
        switch (cardTypeId) {
            // KEEP
            case 3: return [0, 90];
            case 9: return [35, 95];
            case 11: return [0, 85];
            case 17: return [0, 85];
            case 19: return [0, 50];
            case 27: return [35, 65];
            case 38: return [0, 100];
            case 43: return [35, 100];
            case 45: return [0, 85];
            // TODODE
            // DISCARD
            case 102: return [30, 80];
            case 106:
            case 107: return [35, 65];
            case 111: return [35, 95];
            case 112: return [35, 35];
            case 113: return [35, 65];
            case 114: return [35, 95];
            case 115: return [0, 80];
            // COSTUME            
            case 209: return [15, 100];
            // TRANSFORMATION
            case 301: return {
                0: [10, 15],
                1: [10, 15],
            }[side];
        }
        return null;
    };
    Cards.prototype.getCardCost = function (cardTypeId) {
        switch (cardTypeId) {
            // KEEP
            case 1: return 6;
            case 2: return 3;
            case 3: return 5;
            case 4: return 4;
            case 5: return 4;
            case 6: return 5;
            case 7: return 3;
            case 8: return 3;
            case 9: return 3;
            case 10: return 4;
            case 11: return 3;
            case 12: return 4;
            case 13:
            case 14: return 7;
            case 15: return 4;
            case 16: return 5;
            case 17: return 3;
            case 18: return 5;
            case 19: return 4;
            case 20: return 4;
            case 21: return 5;
            case 22: return 3;
            case 23: return 7;
            case 24: return 5;
            case 25: return 2;
            case 26: return 3;
            case 27: return 8;
            case 28: return 3;
            case 29: return 7;
            case 30: return 4;
            case 31: return 3;
            case 32: return 4;
            case 33: return 3;
            case 34: return 3;
            case 35: return 4;
            case 36: return 3;
            case 37: return 3;
            case 38: return 4;
            case 39: return 3;
            case 40: return 6;
            case 41: return 4;
            case 42: return 2;
            case 43: return 5;
            case 44: return 3;
            case 45: return 4;
            case 46: return 4;
            case 47: return 3;
            case 48: return 6;
            case 49: return 4;
            case 50: return 3;
            case 51: return 2;
            case 52: return 6;
            case 53: return 4;
            case 54: return 3;
            case 55: return 4;
            // DISCARD
            case 101: return 5;
            case 102: return 4;
            case 103: return 3;
            case 104: return 5;
            case 105: return 8;
            case 106:
            case 107: return 7;
            case 108: return 3;
            case 109: return 7;
            case 110: return 6;
            case 111: return 3;
            case 112: return 4;
            case 113: return 5;
            case 114: return 3;
            case 115: return 6;
            case 116: return 6;
            case 117: return 4;
            case 118: return 6;
            case 119: return 0;
            // COSTUME
            case 201: return 4;
            case 202: return 4;
            case 203: return 3;
            case 204: return 4;
            case 205: return 3;
            case 206: return 4;
            case 207: return 5;
            case 208: return 4;
            case 209: return 3;
            case 210: return 4;
            case 211: return 4;
            case 212: return 3;
        }
        return null;
    };
    Cards.prototype.getColoredCardName = function (cardTypeId, side) {
        if (side === void 0) { side = null; }
        switch (cardTypeId) {
            // KEEP
            case 1: return _("[724468]Acid [6E3F63]Attack");
            case 2: return _("[442E70]Alien [57347E]Origin");
            case 3: return _("[624A9E]Alpha Monster");
            case 4: return _("[6FBA44]Armor Plating");
            case 5: return _("[0068A1]Background [0070AA]Dweller");
            case 6: return _("[5A6E79]Burrowing");
            case 7: return _("[5DB1DD]Camouflage");
            case 8: return _("[7C7269]Complete [958B7F]Destruction");
            case 9: return _("[836380]Media-Friendly");
            case 10: return _("[42B4B4]Eater of [25948B]the Dead");
            case 11: return _("[0C4E4A]Energy [004C6E]Hoarder");
            case 12: return _("[293066]Even Bigger");
            case 13:
            case 14: return _("[060D29]Extra [0C1946]Head");
            case 15: return _("[823F24]Fire [FAAE5A]Breathing");
            case 16: return _("[5F6D7A]Freeze Time");
            case 17: return _("[0481C4]Friend of Children");
            case 18: return _("[8E4522]Giant [277C43]Brain");
            case 19: return _("[958877]Gourmet");
            case 20: return _("[7A673C]Healing [DC825F]Ray");
            case 21: return _("[2B63A5]Herbivore");
            case 22: return _("[BBB595]Herd [835C25]Culler");
            case 23: return _("[0C94D0]It Has a Child!");
            case 24: return _("[AABEE1]Jets");
            case 25: return _("[075087]Made in [124884]a Lab");
            case 26: return _("[5E9541]Metamorph");
            case 27: return _("[85A8AA]Mimic");
            case 28: return _("[92534C]Battery [88524D]Monster");
            case 29: return _("[67374D]Nova [83B5B6]Breath");
            case 30: return _("[5B79A2]Detritivore");
            case 31: return _("[0068A1]Opportunist");
            case 32: return _("[462365]Parasitic [563D5B]Tentacles");
            case 33: return _("[CD599A]Plot [E276A7]Twist");
            case 34: return _("[1E345D]Poison Quills");
            case 35: return _("[3D5C33]Poison Spit");
            case 36: return _("[2A7C3C]Psychic [6DB446]Probe");
            case 37: return _("[8D6E5C]Rapid [B16E44]Healing");
            case 38: return _("[5C273B]Regeneration");
            case 39: return _("[007DC0]Rooting for the Underdog");
            case 40: return _("[A2B164]Shrink [A07958]Ray");
            case 41: return _("[5E7795]Smoke Cloud");
            case 42: return _("[142338]Solar [46617C]Powered");
            case 43: return _("[A9C7AD]Spiked [4F6269]Tail");
            case 44: return _("[AE2B7B]Stretchy");
            case 45: return _("[56170E]Energy Drink");
            case 46: return _("[B795A5]Urbavore");
            case 47: return _("[757A52]We're [60664A]Only [52593A]Making It [88A160]Stronger!");
            case 48: return _("[443E56]Wings");
            case 49: return ("Hibernation"); // TODODE
            case 50: return ("Nanobots"); // TODODE
            case 51: return ("Natural Selection"); // TODODE
            case 52: return ("Reflective Hide"); // TODODE
            case 53: return ("Super Jump"); // TODODE
            case 54: return ("Unstable DNA"); // TODODE
            case 55: return ("Zombify"); // TODODE
            // DISCARD
            case 101: return _("[B180A0]Apartment [9F7595]Building");
            case 102: return _("[496787]Commuter [415C7A]Train");
            case 103: return _("[993422]Corner [5F6A70]Store");
            case 104: return _("[5BB3E2]Death [45A2D6]From [CE542B]Above");
            case 105: return _("[5D657F]Energize");
            case 106:
            case 107: return _("[7F2719]Evacuation [812819]Orders");
            case 108: return _("[71200F]Flame [4E130B]Thrower");
            case 109: return _("[B1624A]Frenzy");
            case 110: return _("[645656]Gas [71625F]Refinery");
            case 111: return _("[815321]Heal");
            case 112: return _("[5B79A2]High Altitude Bombing");
            case 113: return _("[EE008E]Jet [49236C]Fighters");
            case 114: return _("[68696B]National [53575A]Guard");
            case 115: return _("[684376]Nuclear [41375F]Power Plant");
            case 116: return _("[5F8183]Skyscraper");
            case 117: return _("[AF966B]Tank");
            case 118: return _("[847443]Vast [8D7F4E]Storm");
            case 119: return "Monster pets"; // TODODE
            // COSTUME
            case 201: return _("[353d4b]Astronaut");
            case 202: return _("[005c98]Ghost");
            case 203: return _("[213b75]Vampire");
            case 204: return _("[5a4f86]Witch");
            case 205: return _("[3c4b53]Devil");
            case 206: return _("[584b84]Pirate");
            case 207: return _("[bb6082]Princess");
            case 208: return _("[7e8670]Zombie");
            case 209: return _("[52373d]Cheerleader");
            case 210: return _("[146088]Robot");
            case 211: return _("[733010]Statue of liberty");
            case 212: return _("[2d4554]Clown");
            // TRANSFORMATION
            case 301: return {
                0: _("[deaa26]Biped [72451c]Form"),
                1: _("[982620]Beast [de6526]Form"),
                null: _("[982620]Beast [de6526]Form"),
            }[side];
        }
        return null;
    };
    Cards.prototype.getCardName = function (cardTypeId, state, side) {
        if (side === void 0) { side = null; }
        var coloredCardName = this.getColoredCardName(cardTypeId, side);
        if (state == 'text-only') {
            return coloredCardName === null || coloredCardName === void 0 ? void 0 : coloredCardName.replace(/\[(\w+)\]/g, '');
        }
        else if (state == 'span') {
            var first_1 = true;
            return (coloredCardName === null || coloredCardName === void 0 ? void 0 : coloredCardName.replace(/\[(\w+)\]/g, function (index, color) {
                var span = "<span style=\"-webkit-text-stroke-color: #".concat(color, ";\">");
                if (first_1) {
                    first_1 = false;
                }
                else {
                    span = "</span>" + span;
                }
                return span;
            })) + "".concat(first_1 ? '' : '</span>');
        }
        return null;
    };
    Cards.prototype.getCardDescription = function (cardTypeId, side) {
        if (side === void 0) { side = null; }
        switch (cardTypeId) {
            // KEEP
            case 1: return _("<strong>Add</strong> [diceSmash] to your Roll");
            case 2: return _("<strong>Buying cards costs you 1 less [Energy].</strong>");
            case 3: return _("<strong>Gain 1[Star]</strong> when you roll at least one [diceSmash].");
            case 4: return _("<strong>Do not lose [heart] when you lose exactly 1[heart].</strong>");
            case 5: return _("<strong>You can always reroll any [dice3]</strong> you have.");
            case 6: return _("<strong>Add [diceSmash] to your Roll while you are in Tokyo. When you Yield Tokyo, the monster taking it loses 1[heart].</strong>");
            case 7: return _("If you lose [heart], roll a die for each [heart] you lost. <strong>Each [diceHeart] reduces the loss by 1[heart].</strong>");
            case 8: return _("If you roll [dice1][dice2][dice3][diceHeart][diceSmash][diceEnergy] <strong>gain 9[Star]</strong> in addition to the regular effects.");
            case 9: return _("<strong>Gain 1[Star]</strong> whenever you buy a Power card.");
            case 10: return _("<strong>Gain 3[Star]</strong> every time a Monster's [Heart] goes to 0.");
            case 11: return _("<strong>You gain 1[Star]</strong> for every 6[Energy] you have at the end of your turn.");
            case 12: return _("<strong>+2[Heart] when you buy this card.</strong> Your maximum [Heart] is increased to 12[Heart] as long as you own this card.");
            case 13:
            case 14: return _("<strong>You get 1 extra die.</strong>");
            case 15: return _("<strong>Your neighbors lose 1[heart]</strong> when you roll at least one [diceSmash].");
            case 16: return _("On a turn where you score [dice1][dice1][dice1], <strong>you can take another turn</strong> with one less die.");
            case 17: return _("When you gain any [Energy] <strong>gain 1 extra [Energy].</strong>");
            case 18: return _("<strong>You have one extra die Roll</strong> each turn.");
            case 19: return _("When you roll [dice1][dice1][dice1] or more <strong>gain 2 extra [Star].</strong>");
            case 20: return _("<strong>You can use your [diceHeart] to make other Monsters gain [Heart].</strong> Each Monster must pay you 2[Energy] (or 1[Energy] if it's their last one) for each [Heart] they gain this way");
            case 21: return _("<strong>Gain 1[Star]</strong> at the end of your turn if you don't make anyone lose [Heart].");
            case 22: return _("You can <strong>change one of your dice to a [dice1]</strong> each turn.");
            case 23: return _("If you reach 0[Heart] discard all your cards and lose all your [Star]. <strong>Gain 10[Heart] and continue playing outside Tokyo.</strong>");
            case 24: return _("<strong>You don't lose [Heart]<strong> if you decide to Yield Tokyo.");
            case 25: return _("During the Buy Power cards step, you can <strong>peek at the top card of the deck and buy it</strong> or put it back on top of the deck.");
            case 26: return _("At the end of your turn you can <strong>discard any [keep] cards you have to gain their full cost in [Energy].</strong>");
            case 27: return _("<strong>Choose a [keep] card any monster has in play</strong> and put a Mimic token on it. <strong>This card counts as a duplicate of that card as if you had just bought it.</strong> Spend 1[Energy] at the start of your turn to move the Mimic token and change the card you are mimicking.");
            case 28: return dojo.string.substitute(_("When you buy <i>${card_name}</i>, put 6[Energy] on it from the bank. At the start of your turn <strong>take 2[Energy] off and add them to your pool.</strong> When there are no [Energy] left discard this card."), { 'card_name': this.getCardName(cardTypeId, 'text-only') });
            case 29: return _("<strong>Your [diceSmash] damage all other Monsters.</strong>");
            case 30: return _("<strong>When you roll at least [dice1][dice2][dice3] gain 2[Star].</strong> You can also use these dice in other combinations.");
            case 31: return _("<strong>Whenever a Power card is revealed you have the option of buying it</strong> immediately.");
            case 32: return _("<strong>You may buy [keep] cards from other monsters.</strong> Pay them the [Energy] cost.");
            case 33: return _("Before resolving your dice, you may <strong>change one die to any result</strong>. Discard when used.");
            case 34: return _("When you score [dice2][dice2][dice2] or more, <strong>add [diceSmash][diceSmash] to your Roll</strong>.");
            case 35: return _("Give one <i>Poison</i> token to each Monster you Smash with your [diceSmash]. <strong>At the end of their turn, Monsters lose 1[Heart] for each <i>Poison</i> token they have on them.</strong> A <i>Poison</i> token can be discarded by using a [diceHeart] instead of gaining 1[Heart].");
            case 36: return _("You can reroll a die of your choice after the last Roll of each other Monster. If the reroll [diceHeart], discard this card.");
            case 37: return _("Spend 2[Energy] at any time to <strong>gain 1[Heart].</strong>");
            case 38: return _("When gain [Heart], <strong>gain 1 extra [Heart].</strong>");
            case 39: return _("At the end of your turn, if you have the fewest [Star], <strong>gain 1 [Star].</strong>");
            case 40: return _("Give 1 <i>Shrink Ray</i> to each Monster you Smash with your [diceSmash]. <strong>At the beginning of their turn, Monster roll 1 less dice for each <i>Shrink Ray</i> token they have on them</strong>. A <i>Shrink Ray</i> token can be discarded by using a [diceHeart] instead of gaining 1[Heart].");
            case 41: return _("Place 3 <i>Smoke</i> counters on this card. <strong>Spend 1 <i>Smoke</i> counter for an extra Roll.</strong> Discard this card when all <i>Smoke</i> counters are spent.");
            case 42: return _("At the end of your turn <strong>gain 1[Energy] if you have no [Energy].</strong>");
            case 43: return _("<strong>If you roll at least one [diceSmash], add [diceSmash]</strong> to your Roll.");
            case 44: return _("Before resolving your dice, you can spend 2[Energy] to <strong>change one of your dice to any result.</strong>");
            case 45: return _("Spend 1[Energy] to <strong>get 1 extra die Roll.</strong>");
            case 46: return _("<strong>Gain 1 extra [Star]</strong> when beginning your turn in Tokyo. If you are in Tokyo and you roll at least one [diceSmash], <strong>add [diceSmash] to your Roll.</strong>");
            case 47: return _("When you lose 2[Heart] or more <strong>gain 1[Energy].</strong>");
            case 48: return _("<strong>Spend 2[Energy] to not lose [Heart]<strong> this turn.");
            case 49: return "<div><i>".concat(/*_TODODE*/ ("You CANNOT buy this card while in TOKYO"), "</i></div>") + /*_TODODE*/ ("<strong>You no longer take damage.</strong> You cannot move, even if Tokyo is empty. You can no longer buy cards. <strong>The only results you can use are [diceHeart] and [diceEnergy].</strong> Discard this card to end its effects and restrictions immediately.");
            case 50: return /*_TODODE*/ ("At the start of your turn, if you have fewer than 3[Heart], <strong>gain 2[Heart].</strong>");
            // TODODE
            // DISCARD
            case 101: return "<strong>+ 3[Star].</strong>";
            case 102: return "<strong>+ 2[Star].</strong>";
            case 103: return "<strong>+ 1[Star].</strong>";
            case 104: return _("<strong>+ 2[Star] and take control of Tokyo</strong> if you don't already control it.");
            case 105: return "<strong>+ 9[Energy].</strong>";
            case 106:
            case 107: return _("<strong>All other Monsters lose 5[Star].</strong>");
            case 108: return _("<strong>All other Monsters lose 2[Heart].</strong>");
            case 109: return _("<strong>Take another turn</strong> after this one");
            case 110: return _("<strong>+ 2[Star] and all other monsters lose 3[Heart].</strong>");
            case 111: return "<strong>+ 2[Heart]</strong>";
            case 112: return _("<strong>All Monsters</strong> (including you) <strong>lose 3[Heart].</strong>");
            case 113: return "<strong>+ 5[Star] -4[Heart].</strong>";
            case 114: return "<strong>+ 2[Star] -2[Heart].</strong>";
            case 115: return "<strong>+ 2[Star] +3[Heart].</strong>";
            case 116: return "<strong>+ 4[Star].";
            case 117: return "<strong>+ 4[Star] -3[Heart].</strong>";
            case 118: return _("<strong>+ 2[Star] and all other Monsters lose 1[Energy] for every 2[Energy]</strong> they have.");
            case 119: return "<strong>All Monsters</strong> (including you) <strong>lose 3[Star].</strong>"; // TODODE
            // COSTUME
            case 201: return _("<strong>If you reach 17[Star],</strong> you win the game");
            case 202: return _("At the end of each Monster's turn, if you lost at least 1[Heart] <strong>that turn, gain 1[Heart].</strong>");
            case 203: return _("At the end of each Monster's turn, if you made another Monster lose at least 1[Heart], <strong>gain 1[Heart].</strong>");
            case 204: return _("If you must be wounded <strong>by another Monster,</strong> you can reroll one of their dice.");
            case 205: return _("On your turn, when you make other Monsters lose at least 1[Heart], <strong>they lose an extra [Heart].</strong>");
            case 206: return _("<strong>Steal 1[Energy]</strong> from each Monster you made lose at least 1[Heart].");
            case 207: return _("<strong>Gain 1[Star] at the start of your turn.</strong>");
            case 208: return _("You are not eliminated if you reach 0[Heart]. <strong>You cannot lose [Heart]</strong> as long as you have 0[Heart]. If you lose this card while you have 0[Heart], you are immediately eliminated.");
            case 209: return _("<strong>You can choose to cheer for another Monster on their turn.</strong> If you do, add [diceSmash] to their roll.");
            case 210: return _("You can choose to lose [Energy] instead of [Heart].");
            case 211: return _("You have an <strong>extra Roll.</strong>");
            case 212: return _("If you roll [dice1][dice2][dice3][diceHeart][diceSmash][diceEnergy], you can <strong>change the result for every die.</strong>");
            // TRANSFORMATION 
            case 301: return {
                0: _("Before the Buy Power cards phase, you may spend 1[Energy] to flip this card."),
                1: _("During the Roll Dice phase, you may reroll one of your dice an extra time. You cannot buy any more Power cards. <em>Before the Buy Power cards phase, you may spend 1[Energy] to flip this card.</em>"),
            }[side];
        }
        return null;
    };
    Cards.prototype.updateFlippableCardTooltip = function (cardDiv) {
        var type = Number(cardDiv.dataset.type);
        if (!FLIPPABLE_CARDS.includes(type)) {
            return;
        }
        this.game.addTooltipHtml(cardDiv.id, this.getTooltip(Number(cardDiv.dataset.type), Number(cardDiv.dataset.side)));
    };
    Cards.prototype.getTooltip = function (cardTypeId, side) {
        if (side === void 0) { side = null; }
        if (cardTypeId === 999) {
            return _("The Golden Scarab affects certain Curse cards. At the start of the game, the player who will play last gets the Golden Scarab.");
        }
        var cost = this.getCardCost(cardTypeId);
        var tooltip = "<div class=\"card-tooltip\">\n            <p><strong>".concat(this.getCardName(cardTypeId, 'text-only', side), "</strong></p>");
        if (cost !== null) {
            tooltip += "<p class=\"cost\">".concat(dojo.string.substitute(_("Cost : ${cost}"), { 'cost': cost }), " <span class=\"icon energy\"></span></p>");
        }
        tooltip += "<p>".concat(formatTextIcons(this.getCardDescription(cardTypeId, side)), "</p>");
        if (FLIPPABLE_CARDS.includes(cardTypeId) && side !== null) {
            var otherSide = side == 1 ? 0 : 1;
            var tempDiv = document.createElement('div');
            tempDiv.classList.add('stockitem');
            tempDiv.style.width = "".concat(CARD_WIDTH, "px");
            tempDiv.style.height = "".concat(CARD_HEIGHT, "px");
            tempDiv.style.position = "relative";
            tempDiv.style.backgroundImage = "url('".concat(g_gamethemeurl, "img/").concat(this.getImageName(cardTypeId), "-cards.jpg')");
            tempDiv.style.backgroundPosition = "-".concat(otherSide * 100, "% 0%");
            document.body.appendChild(tempDiv);
            this.setDivAsCard(tempDiv, cardTypeId, otherSide);
            document.body.removeChild(tempDiv);
            tooltip += "<p>".concat(_("Other side :"), "<br>").concat(tempDiv.outerHTML, "</p>");
        }
        tooltip += "</div>";
        return tooltip;
    };
    Cards.prototype.setupNewCard = function (cardDiv, cardType) {
        if (FLIPPABLE_CARDS.includes(cardType)) {
            cardDiv.dataset.type = '' + cardType;
            cardDiv.classList.add('card-inner');
            dojo.place("\n                <div class=\"card-side front\"></div>\n                <div class=\"card-side back\"></div>\n            ", cardDiv);
            this.setDivAsCard(cardDiv.getElementsByClassName('front')[0], 301, 0);
            this.setDivAsCard(cardDiv.getElementsByClassName('back')[0], 301, 1);
        }
        else {
            if (cardType !== 999) { // no text for golden scarab
                this.setDivAsCard(cardDiv, cardType);
            }
            this.game.addTooltipHtml(cardDiv.id, this.getTooltip(cardType));
        }
    };
    Cards.prototype.getCardTypeName = function (cardType) {
        if (cardType < 100) {
            return _('Keep');
        }
        else if (cardType < 200) {
            return _('Discard');
        }
        else if (cardType < 300) {
            return _('Costume');
        }
        else if (cardType < 400) {
            return _('Transformation');
        }
    };
    Cards.prototype.getCardTypeClass = function (cardType) {
        if (cardType < 100) {
            return 'keep';
        }
        else if (cardType < 200) {
            return 'discard';
        }
        else if (cardType < 300) {
            return 'costume';
        }
        else if (cardType < 400) {
            return 'transformation';
        }
    };
    Cards.prototype.setDivAsCard = function (cardDiv, cardType, side) {
        if (side === void 0) { side = null; }
        var type = this.getCardTypeName(cardType);
        var description = formatTextIcons(this.getCardDescription(cardType, side));
        var position = this.getCardNamePosition(cardType, side);
        cardDiv.innerHTML = "<div class=\"bottom\"></div>\n        <div class=\"name-wrapper\" ".concat(position ? "style=\"left: ".concat(position[0], "px; top: ").concat(position[1], "px;\"") : '', ">\n            <div class=\"outline\">").concat(this.getCardName(cardType, 'span', side), "</div>\n            <div class=\"text\">").concat(this.getCardName(cardType, 'text-only', side), "</div>\n        </div>\n        <div class=\"type-wrapper ").concat(this.getCardTypeClass(cardType), "\">\n            <div class=\"outline\">").concat(type, "</div>\n            <div class=\"text\">").concat(type, "</div>\n        </div>\n        \n        <div class=\"description-wrapper\">").concat(description, "</div>");
        var textHeight = cardDiv.getElementsByClassName('description-wrapper')[0].clientHeight;
        if (textHeight > 80) {
            cardDiv.getElementsByClassName('description-wrapper')[0].style.fontSize = '6pt';
            textHeight = cardDiv.getElementsByClassName('description-wrapper')[0].clientHeight;
        }
        var height = Math.min(textHeight, 116);
        cardDiv.getElementsByClassName('bottom')[0].style.top = "".concat(166 - height, "px");
        cardDiv.getElementsByClassName('type-wrapper')[0].style.top = "".concat(168 - height, "px");
        var nameTopPosition = (position === null || position === void 0 ? void 0 : position[1]) || 14;
        var nameWrapperDiv = cardDiv.getElementsByClassName('name-wrapper')[0];
        var nameDiv = nameWrapperDiv.getElementsByClassName('text')[0];
        var spaceBetweenDescriptionAndName = (155 - height) - (nameTopPosition + nameDiv.clientHeight);
        if (spaceBetweenDescriptionAndName < 0) {
            nameWrapperDiv.style.top = "".concat(Math.max(5, nameTopPosition + spaceBetweenDescriptionAndName), "px");
        }
    };
    Cards.prototype.getImageName = function (cardType) {
        if (cardType < 100) {
            return 'keep';
        }
        else if (cardType < 200) {
            return 'discard';
        }
        else if (cardType < 300) {
            return 'costume';
        }
        else if (cardType < 400) {
            return 'transformation';
        }
    };
    Cards.prototype.getMimickedCardText = function (mimickedCard) {
        var mimickedCardText = '-';
        if (mimickedCard) {
            var tempDiv = document.createElement('div');
            tempDiv.classList.add('stockitem');
            tempDiv.style.width = "".concat(CARD_WIDTH, "px");
            tempDiv.style.height = "".concat(CARD_HEIGHT, "px");
            tempDiv.style.position = "relative";
            tempDiv.style.backgroundImage = "url('".concat(g_gamethemeurl, "img/").concat(this.getImageName(mimickedCard.type), "-cards.jpg')");
            var imagePosition = ((mimickedCard.type + mimickedCard.side) % 100) - 1;
            var image_items_per_row = 10;
            var row = Math.floor(imagePosition / image_items_per_row);
            var xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
            var yBackgroundPercent = row * 100;
            tempDiv.style.backgroundPosition = "-".concat(xBackgroundPercent, "% -").concat(yBackgroundPercent, "%");
            document.body.appendChild(tempDiv);
            this.setDivAsCard(tempDiv, mimickedCard.type + (mimickedCard.side || 0));
            document.body.removeChild(tempDiv);
            mimickedCardText = "<br>".concat(tempDiv.outerHTML);
        }
        return mimickedCardText;
    };
    Cards.prototype.changeMimicTooltip = function (mimicCardId, mimickedCardText) {
        this.game.addTooltipHtml(mimicCardId, this.getTooltip(27) + "<br>".concat(_('Mimicked card:'), " ").concat(mimickedCardText));
    };
    return Cards;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var POINTS_DEG = [25, 40, 56, 73, 89, 105, 122, 138, 154, 170, 187, 204, 221, 237, 254, 271, 288, 305, 322, 339, 359];
var HEALTH_DEG = [360, 326, 301, 274, 249, 226, 201, 174, 149, 122, 98, 64, 39];
var SPLIT_ENERGY_CUBES = 6;
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        this.game = game;
        this.player = player;
        this.showHand = false;
        /*this.playerId = Number(player.id);
        this.playerNo = Number(player.player_no);
        this.monster = Number(player.monster);

        const eliminated = Number(player.eliminated) > 0;

        let html = `
        <div id="player-table-${player.id}" class="player-table whiteblock ${eliminated ? 'eliminated' : ''}">
            <div id="player-name-${player.id}" class="player-name ${game.isDefaultFont() ? 'standard' : 'goodgirl'}" style="color: #${player.color}">
                <div class="outline${player.color === '000000' ? ' white' : ''}">${player.name}</div>
                <div class="text">${player.name}</div>
            </div>
            <div id="monster-board-wrapper-${player.id}" class="monster-board-wrapper ${player.location > 0 ? 'intokyo' : ''}">
                <div class="blue wheel" id="blue-wheel-${player.id}"></div>
                <div class="red wheel" id="red-wheel-${player.id}"></div>
                <div class="kot-token"></div>
                <div id="monster-board-${player.id}" class="monster-board monster${this.monster}">
                    <div id="monster-board-${player.id}-figure-wrapper" class="monster-board-figure-wrapper">
                        <div id="monster-figure-${player.id}" class="monster-figure monster${this.monster}"><div class="stand"></div></div>
                    </div>
                </div>
                <div id="token-wrapper-${this.playerId}-poison" class="token-wrapper poison"></div>
                <div id="token-wrapper-${this.playerId}-shrink-ray" class="token-wrapper shrink-ray"></div>
            </div>
            <div id="energy-wrapper-${player.id}-left" class="energy-wrapper left"></div>
            <div id="energy-wrapper-${player.id}-right" class="energy-wrapper right"></div>`;
        if (game.isWickednessExpansion()) {
            html += `<div id="wickedness-tiles-${player.id}" class="wickedness-tile-stock player-wickedness-tiles ${player.wickednessTiles?.length ? '' : 'empty'}"></div>   `;
        }
        if (game.isPowerUpExpansion()) {
            html += `
            <div id="hidden-evolution-cards-${player.id}" class="evolution-card-stock player-evolution-cards hand ${player.hiddenEvolutions?.length ? '' : 'empty'}"></div>
            <div id="visible-evolution-cards-${player.id}" class="evolution-card-stock player-evolution-cards ${player.visibleEvolutions?.length ? '' : 'empty'}"></div>
            `;
        }
        html += `    <div id="cards-${player.id}" class="card-stock player-cards ${player.cards.length ? '' : 'empty'}"></div>
        </div>
        `;
        dojo.place(html, 'table');

        this.setMonsterFigureBeastMode(player.cards.find(card => card.type === 301)?.side === 1);

        this.cards = new ebg.stock() as Stock;
        this.cards.setSelectionAppearance('class');
        this.cards.selectionClass = 'no-visible-selection';
        this.cards.create(this.game, $(`cards-${this.player.id}`), CARD_WIDTH, CARD_HEIGHT);
        this.cards.setSelectionMode(0);
        this.cards.onItemCreate = (card_div, card_type_id) => this.game.cards.setupNewCard(card_div, card_type_id);
        this.cards.image_items_per_row = 10;
        this.cards.centerItems = true;
        dojo.connect(this.cards, 'onChangeSelection', this, (_, itemId: string) => this.game.onVisibleCardClick(this.cards, Number(itemId), this.playerId));

        this.game.cards.setupCards([this.cards]);
        this.game.cards.addCardsToStock(this.cards, player.cards);
        if (playerWithGoldenScarab) {
            this.cards.addToStockWithId(999, 'goldenscarab');
        }

        this.initialLocation = Number(player.location);

        this.setPoints(Number(player.score));
        this.setHealth(Number(player.health));
        if (!eliminated) {
            this.setEnergy(Number(player.energy));
            this.setPoisonTokens(Number(player.poisonTokens));
            this.setShrinkRayTokens(Number(player.shrinkRayTokens));
        }

        if (this.game.isKingkongExpansion()) {
            dojo.place(`<div id="tokyo-tower-${player.id}" class="tokyo-tower-wrapper"></div>`, `player-table-${player.id}`);
            this.tokyoTower = new TokyoTower(`tokyo-tower-${player.id}`, player.tokyoTowerLevels);
        }

        if (this.game.isCybertoothExpansion()) {
            dojo.place(`<div id="berserk-token-${player.id}" class="berserk-token berserk-tooltip" data-visible="${player.berserk ? 'true' : 'false'}"></div>`, `monster-board-${player.id}`);
        }

        if (this.game.isCthulhuExpansion()) {
            dojo.place(`<div id="player-table-cultist-tokens-${player.id}" class="cultist-tokens"></div>`, `monster-board-${player.id}`);
            if (!eliminated) {
                this.setCultistTokens(player.cultists);
            }
        }

        if (this.game.isWickednessExpansion()) {
            this.wickednessTiles = new ebg.stock() as Stock;
            this.wickednessTiles.setSelectionAppearance('class');
            this.wickednessTiles.selectionClass = 'no-visible-selection';
            this.wickednessTiles.create(this.game, $(`wickedness-tiles-${player.id}`), WICKEDNESS_TILES_WIDTH, WICKEDNESS_TILES_HEIGHT);
            this.wickednessTiles.setSelectionMode(0);
            this.wickednessTiles.centerItems = true;
            this.wickednessTiles.onItemCreate = (card_div, card_type_id) => this.game.wickednessTiles.setupNewCard(card_div, card_type_id);
    
            this.game.wickednessTiles.setupCards([this.wickednessTiles]);
            player.wickednessTiles?.forEach(tile => this.wickednessTiles.addToStockWithId(tile.type, '' + tile.id));
        }

        if (game.isPowerUpExpansion()) {
            this.showHand = this.playerId == this.game.getPlayerId();

            this.hiddenEvolutionCards = new ebg.stock() as Stock;
            this.hiddenEvolutionCards.setSelectionAppearance('class');
            this.hiddenEvolutionCards.selectionClass = 'no-visible-selection';
            this.hiddenEvolutionCards.create(this.game, $(`hidden-evolution-cards-${player.id}`), CARD_WIDTH, CARD_WIDTH);
            this.hiddenEvolutionCards.setSelectionMode(2);
            this.hiddenEvolutionCards.centerItems = true;
            this.hiddenEvolutionCards.onItemCreate = (card_div, card_type_id) => this.game.evolutionCards.setupNewCard(card_div, card_type_id);
            dojo.connect(this.hiddenEvolutionCards, 'onChangeSelection', this, (_, item_id: string) => this.game.onHiddenEvolutionClick(Number(item_id)));

            this.visibleEvolutionCards = new ebg.stock() as Stock;
            this.visibleEvolutionCards.setSelectionAppearance('class');
            this.visibleEvolutionCards.selectionClass = 'no-visible-selection';
            this.visibleEvolutionCards.create(this.game, $(`visible-evolution-cards-${player.id}`), CARD_WIDTH, CARD_WIDTH);
            this.visibleEvolutionCards.setSelectionMode(0);
            this.visibleEvolutionCards.centerItems = true;
            this.visibleEvolutionCards.onItemCreate = (card_div, card_type_id) => this.game.evolutionCards.setupNewCard(card_div, card_type_id);
            dojo.connect(this.visibleEvolutionCards, 'onChangeSelection', this, (_, item_id: string) => this.game.onVisibleEvolutionClick(Number(item_id)));
    
            this.game.evolutionCards.setupCards([this.hiddenEvolutionCards, this.visibleEvolutionCards]);
            player.hiddenEvolutions?.forEach(card => this.hiddenEvolutionCards.addToStockWithId(this.showHand ? card.type : 0, '' + card.id));
            if (player.visibleEvolutions) {
                this.game.evolutionCards.addCardsToStock(this.visibleEvolutionCards, player.visibleEvolutions);
            }
        }*/
    }
    PlayerTable.prototype.initPlacement = function () {
        if (this.initialLocation > 0) {
            this.enterTokyo(this.initialLocation);
        }
    };
    PlayerTable.prototype.enterTokyo = function (location) {
        transitionToObjectAndAttach(this.game, document.getElementById("monster-figure-".concat(this.playerId)), "tokyo-".concat(location == 2 ? 'bay' : 'city'), this.game.getZoom());
    };
    PlayerTable.prototype.leaveTokyo = function () {
        transitionToObjectAndAttach(this.game, document.getElementById("monster-figure-".concat(this.playerId)), "monster-board-".concat(this.playerId, "-figure-wrapper"), this.game.getZoom());
    };
    PlayerTable.prototype.setVisibleCardsSelectionClass = function (visible) {
        document.getElementById("player-table-".concat(this.playerId)).classList.toggle('double-selection', visible);
    };
    PlayerTable.prototype.removeCards = function (cards) {
        var _this = this;
        var cardsIds = cards.map(function (card) { return card.id; });
        cardsIds.forEach(function (id) { return _this.cards.removeFromStockById('' + id); });
    };
    PlayerTable.prototype.removeWickednessTiles = function (tiles) {
        var _this = this;
        var tilesIds = tiles.map(function (tile) { return tile.id; });
        tilesIds.forEach(function (id) { return _this.wickednessTiles.removeFromStockById('' + id); });
    };
    PlayerTable.prototype.removeEvolutions = function (cards) {
        var _this = this;
        var cardsIds = cards.map(function (card) { return card.id; });
        cardsIds.forEach(function (id) {
            _this.hiddenEvolutionCards.removeFromStockById('' + id);
            _this.visibleEvolutionCards.removeFromStockById('' + id);
        });
    };
    PlayerTable.prototype.setPoints = function (points, delay) {
        var _this = this;
        if (delay === void 0) { delay = 0; }
        setTimeout(function () { return document.getElementById("blue-wheel-".concat(_this.playerId)).style.transform = "rotate(".concat(POINTS_DEG[Math.min(20, points)], "deg)"); }, delay);
    };
    PlayerTable.prototype.setHealth = function (health, delay) {
        var _this = this;
        if (delay === void 0) { delay = 0; }
        setTimeout(function () { return document.getElementById("red-wheel-".concat(_this.playerId)).style.transform = "rotate(".concat(health > 12 ? 22 : HEALTH_DEG[health], "deg)"); }, delay);
    };
    PlayerTable.prototype.setEnergy = function (energy, delay) {
        var _this = this;
        if (delay === void 0) { delay = 0; }
        setTimeout(function () {
            if (_this.game.isKingkongExpansion()) {
                _this.setEnergyOnSide('left', energy);
            }
            else {
                _this.setEnergyOnSide('left', Math.min(energy, SPLIT_ENERGY_CUBES));
                _this.setEnergyOnSide('right', Math.max(energy - SPLIT_ENERGY_CUBES, 0));
            }
        }, delay);
    };
    PlayerTable.prototype.eliminatePlayer = function () {
        var _this = this;
        this.setEnergy(0);
        this.cards.items.filter(function (item) { return item.id !== 'goldenscarab'; }).forEach(function (item) { return _this.cards.removeFromStockById(item.id); });
        if (document.getElementById("monster-figure-".concat(this.playerId))) {
            this.game.fadeOutAndDestroy("monster-figure-".concat(this.playerId));
        }
        dojo.addClass("player-table-".concat(this.playerId), 'eliminated');
    };
    PlayerTable.prototype.setActivePlayer = function (active) {
        dojo.toggleClass("player-table-".concat(this.playerId), 'active', active);
        dojo.toggleClass("overall_player_board_".concat(this.playerId), 'active', active);
    };
    PlayerTable.prototype.setFont = function (prefValue) {
        var defaultFont = prefValue === 1;
        dojo.toggleClass("player-name-".concat(this.playerId), 'standard', defaultFont);
        dojo.toggleClass("player-name-".concat(this.playerId), 'goodgirl', !defaultFont);
    };
    PlayerTable.prototype.getDistance = function (p1, p2) {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    };
    PlayerTable.prototype.getPlaceEnergySide = function (placed) {
        var _this = this;
        var newPlace = {
            x: Math.random() * 33 + 16,
            y: Math.random() * 188 + 16,
        };
        var protection = 0;
        while (protection < 1000 && placed.some(function (place) { return _this.getDistance(newPlace, place) < 32; })) {
            newPlace.x = Math.random() * 33 + 16;
            newPlace.y = Math.random() * 188 + 16;
            protection++;
        }
        return newPlace;
    };
    PlayerTable.prototype.setEnergyOnSide = function (side, energy) {
        var divId = "energy-wrapper-".concat(this.playerId, "-").concat(side);
        var div = document.getElementById(divId);
        if (!div) {
            return;
        }
        var placed = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];
        // remove tokens
        for (var i = energy; i < placed.length; i++) {
            this.game.fadeOutAndDestroy("".concat(divId, "-token").concat(i));
        }
        placed.splice(energy, placed.length - energy);
        // add tokens
        for (var i = placed.length; i < energy; i++) {
            var newPlace = this.getPlaceEnergySide(placed);
            placed.push(newPlace);
            var html = "<div id=\"".concat(divId, "-token").concat(i, "\" style=\"left: ").concat(newPlace.x - 16, "px; top: ").concat(newPlace.y - 16, "px;\" class=\"energy-cube\"></div>");
            dojo.place(html, divId);
        }
        div.dataset.placed = JSON.stringify(placed);
    };
    PlayerTable.prototype.setMonster = function (monster) {
        var newMonsterClass = "monster".concat(monster);
        dojo.removeClass("monster-figure-".concat(this.playerId), 'monster0');
        dojo.addClass("monster-figure-".concat(this.playerId), newMonsterClass);
        dojo.removeClass("monster-board-".concat(this.playerId), 'monster0');
        dojo.addClass("monster-board-".concat(this.playerId), newMonsterClass);
    };
    PlayerTable.prototype.getPlaceToken = function (placed) {
        var _this = this;
        var newPlace = {
            x: 16,
            y: Math.random() * 138 + 16,
        };
        var protection = 0;
        while (protection < 1000 && placed.some(function (place) { return _this.getDistance(newPlace, place) < 32; })) {
            newPlace.y = Math.random() * 138 + 16;
            protection++;
        }
        return newPlace;
    };
    PlayerTable.prototype.setTokens = function (type, tokens) {
        var divId = "token-wrapper-".concat(this.playerId, "-").concat(type);
        var div = document.getElementById(divId);
        if (!div) {
            return;
        }
        var placed = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];
        // remove tokens
        for (var i = tokens; i < placed.length; i++) {
            this.game.fadeOutAndDestroy("".concat(divId, "-token").concat(i));
        }
        placed.splice(tokens, placed.length - tokens);
        // add tokens
        for (var i = placed.length; i < tokens; i++) {
            var newPlace = this.getPlaceToken(placed);
            placed.push(newPlace);
            var html = "<div id=\"".concat(divId, "-token").concat(i, "\" style=\"left: ").concat(newPlace.x - 16, "px; top: ").concat(newPlace.y - 16, "px;\" class=\"").concat(type, " token\"></div>");
            dojo.place(html, divId);
            this.game.addTooltipHtml("".concat(divId, "-token").concat(i), type === 'poison' ? this.game.POISON_TOKEN_TOOLTIP : this.game.SHINK_RAY_TOKEN_TOOLTIP);
        }
        div.dataset.placed = JSON.stringify(placed);
    };
    PlayerTable.prototype.setPoisonTokens = function (tokens) {
        this.setTokens('poison', tokens);
    };
    PlayerTable.prototype.setShrinkRayTokens = function (tokens) {
        this.setTokens('shrink-ray', tokens);
    };
    PlayerTable.prototype.getTokyoTower = function () {
        return this.tokyoTower;
    };
    PlayerTable.prototype.setBerserk = function (berserk) {
        document.getElementById("berserk-token-".concat(this.playerId)).dataset.visible = berserk ? 'true' : 'false';
    };
    PlayerTable.prototype.changeForm = function (card) {
        var cardDiv = document.getElementById("".concat(this.cards.container_div.id, "_item_").concat(card.id));
        cardDiv.dataset.side = '' + card.side;
        this.game.addTooltipHtml(cardDiv.id, this.game.cards.updateFlippableCardTooltip(cardDiv));
        this.setMonsterFigureBeastMode(card.side === 1);
    };
    PlayerTable.prototype.setMonsterFigureBeastMode = function (beastMode) {
        if (this.monster === 12) {
            document.getElementById("monster-figure-".concat(this.playerId)).classList.toggle('beast-mode', beastMode);
        }
    };
    PlayerTable.prototype.setCultistTokens = function (tokens) {
        var containerId = "player-table-cultist-tokens-".concat(this.playerId);
        var container = document.getElementById(containerId);
        while (container.childElementCount > tokens) {
            container.removeChild(container.lastChild);
        }
        for (var i = container.childElementCount; i < tokens; i++) {
            dojo.place("<div id=\"".concat(containerId, "-").concat(i, "\" class=\"cultist-token cultist-tooltip\"></div>"), containerId);
            this.game.addTooltipHtml("".concat(containerId, "-").concat(i), this.game.CULTIST_TOOLTIP);
        }
    };
    PlayerTable.prototype.takeGoldenScarab = function (previousOwnerStock) {
        var sourceStockItemId = "".concat(previousOwnerStock.container_div.id, "_item_goldenscarab");
        this.cards.addToStockWithId(999, 'goldenscarab', sourceStockItemId);
        previousOwnerStock.removeFromStockById("goldenscarab");
    };
    PlayerTable.prototype.showEvolutionPickStock = function (cards) {
        var _this = this;
        if (!this.pickEvolutionCards) {
            dojo.place("<div id=\"pick-evolution".concat(this.playerId, "\" class=\"evolution-card-stock player-evolution-cards pick-evolution-cards\"></div>"), "monster-board-wrapper-".concat(this.playerId));
            this.pickEvolutionCards = new ebg.stock();
            this.pickEvolutionCards.setSelectionAppearance('class');
            this.pickEvolutionCards.selectionClass = 'no-visible-selection-except-double-selection';
            this.pickEvolutionCards.create(this.game, $("pick-evolution".concat(this.playerId)), CARD_WIDTH, CARD_WIDTH);
            this.pickEvolutionCards.setSelectionMode(1);
            this.pickEvolutionCards.onItemCreate = function (card_div, card_type_id) { return _this.game.evolutionCards.setupNewCard(card_div, card_type_id); };
            this.pickEvolutionCards.image_items_per_row = 10;
            this.pickEvolutionCards.centerItems = true;
            dojo.connect(this.pickEvolutionCards, 'onChangeSelection', this, function (_, item_id) { return _this.game.chooseEvolutionCardClick(Number(item_id)); });
        }
        else {
            document.getElementById("pick-evolution".concat(this.playerId)).style.display = 'block';
        }
        this.game.evolutionCards.setupCards([this.pickEvolutionCards]);
        //this.game.evolutionCards.addCardsToStock(this.pickEvolutionCards, cards);
        cards.forEach(function (card) { return _this.pickEvolutionCards.addToStockWithId(card.type, '' + card.id); });
    };
    PlayerTable.prototype.hideEvolutionPickStock = function () {
        var div = document.getElementById("pick-evolution".concat(this.playerId));
        if (div) {
            document.getElementById("pick-evolution".concat(this.playerId)).style.display = 'none';
            this.pickEvolutionCards.removeAll();
        }
    };
    PlayerTable.prototype.playEvolution = function (card) {
        this.game.evolutionCards.moveToAnotherStock(this.hiddenEvolutionCards, this.visibleEvolutionCards, card);
    };
    PlayerTable.prototype.highlightHiddenEvolutions = function (cards) {
        var _this = this;
        cards.forEach(function (card) {
            var cardDiv = document.getElementById("".concat(_this.hiddenEvolutionCards.container_div.id, "_item_").concat(card.id));
            cardDiv === null || cardDiv === void 0 ? void 0 : cardDiv.classList.add('highlight-evolution');
        });
    };
    PlayerTable.prototype.unhighlightHiddenEvolutions = function () {
        var _this = this;
        var _a;
        (_a = this.hiddenEvolutionCards) === null || _a === void 0 ? void 0 : _a.items.forEach(function (card) {
            var cardDiv = document.getElementById("".concat(_this.hiddenEvolutionCards.container_div.id, "_item_").concat(card.id));
            cardDiv.classList.remove('highlight-evolution');
        });
    };
    return PlayerTable;
}());
var WICKEDNESS_MONSTER_ICON_POSITION = [
    [2, 270],
    [35, 321],
    [87, 316],
    [129, 284],
    [107, 237],
    [86, 193],
    [128, 165],
    [86, 130],
    [44, 96],
    [88, 58],
    [128, 31],
];
var TableCenter = /** @class */ (function () {
    function TableCenter(game) {
        this.game = game;
        this.wickednessTiles = [];
        this.wickednessTilesStocks = [];
        this.wickednessPoints = new Map();
        /*this.createVisibleCards(visibleCards, topDeckCardBackType);

        if (game.isWickednessExpansion()) {
            dojo.place(`
            <div id="wickedness-board-wrapper">
                <div id="wickedness-board"></div>
            </div>`, 'full-board');
            this.createWickednessTiles(wickednessTiles);

            players.forEach(player => {
                dojo.place(`<div id="monster-icon-${player.id}" class="monster-icon monster${player.monster}" style="background-color: #${player.color};"></div>`, 'wickedness-board');
                this.wickednessPoints.set(Number(player.id), Number(player.wickedness));
            });
            this.moveWickednessPoints();
        }

        if (game.isKingkongExpansion()) {
            dojo.place(`<div id="tokyo-tower-0" class="tokyo-tower-wrapper"></div>`, 'full-board');
            this.tokyoTower = new TokyoTower('tokyo-tower-0', tokyoTowerLevels);
        }

        if (game.isAnubisExpansion()) {
            this.createCurseCard(curseCard);
        }*/
    }
    TableCenter.prototype.createVisibleCards = function (visibleCards, topDeckCardBackType) {
        var _this = this;
        this.visibleCards = new ebg.stock();
        this.visibleCards.setSelectionAppearance('class');
        this.visibleCards.selectionClass = 'no-visible-selection-except-double-selection';
        this.visibleCards.create(this.game, $('visible-cards'), CARD_WIDTH, CARD_HEIGHT);
        this.visibleCards.setSelectionMode(0);
        this.visibleCards.onItemCreate = function (card_div, card_type_id) { return _this.game.cards.setupNewCard(card_div, card_type_id); };
        this.visibleCards.image_items_per_row = 10;
        this.visibleCards.centerItems = true;
        dojo.connect(this.visibleCards, 'onChangeSelection', this, function (_, item_id) { return _this.game.onVisibleCardClick(_this.visibleCards, Number(item_id)); });
        this.game.cards.setupCards([this.visibleCards]);
        this.setVisibleCards(visibleCards);
        this.setTopDeckCardBackType(topDeckCardBackType);
    };
    TableCenter.prototype.createCurseCard = function (curseCard) {
        var _this = this;
        dojo.place("<div id=\"curse-wrapper\">\n            <div id=\"curse-deck\"></div>\n            <div id=\"curse-card\"></div>\n        </div>", 'full-board', 'before');
        this.curseCard = new ebg.stock();
        this.curseCard.setSelectionAppearance('class');
        this.curseCard.selectionClass = 'no-visible-selection';
        this.curseCard.create(this.game, $('curse-card'), CARD_WIDTH, CARD_HEIGHT);
        this.curseCard.setSelectionMode(0);
        this.curseCard.centerItems = true;
        this.curseCard.onItemCreate = function (card_div, card_type_id) { return _this.game.curseCards.setupNewCard(card_div, card_type_id); };
        this.game.curseCards.setupCards([this.curseCard]);
        this.curseCard.addToStockWithId(curseCard.type, '' + curseCard.id);
        this.game.addTooltipHtml("curse-deck", "\n        <strong>".concat(_("Curse card pile."), "</strong>\n        <div> ").concat(dojo.string.substitute(_("Discard the current Curse and reveal the next one by rolling ${changeCurseCard}."), { 'changeCurseCard': '<div class="anubis-icon anubis-icon1"></div>' }), "</div>\n        "));
    };
    TableCenter.prototype.setVisibleCardsSelectionMode = function (mode) {
        this.visibleCards.setSelectionMode(mode);
    };
    TableCenter.prototype.setVisibleCardsSelectionClass = function (visible) {
        document.getElementById('table-center').classList.toggle('double-selection', visible);
    };
    TableCenter.prototype.showPickStock = function (cards) {
        var _this = this;
        if (!this.pickCard) {
            dojo.place('<div id="pick-stock" class="card-stock"></div>', 'deck-wrapper');
            this.pickCard = new ebg.stock();
            this.pickCard.setSelectionAppearance('class');
            this.pickCard.selectionClass = 'no-visible-selection';
            this.pickCard.create(this.game, $('pick-stock'), CARD_WIDTH, CARD_HEIGHT);
            this.pickCard.setSelectionMode(1);
            this.pickCard.onItemCreate = function (card_div, card_type_id) { return _this.game.cards.setupNewCard(card_div, card_type_id); };
            this.pickCard.image_items_per_row = 10;
            this.pickCard.centerItems = true;
            dojo.connect(this.pickCard, 'onChangeSelection', this, function (_, item_id) { return _this.game.onVisibleCardClick(_this.pickCard, Number(item_id)); });
        }
        else {
            document.getElementById('pick-stock').style.display = 'block';
        }
        this.game.cards.setupCards([this.pickCard]);
        this.game.cards.addCardsToStock(this.pickCard, cards);
    };
    TableCenter.prototype.hidePickStock = function () {
        var div = document.getElementById('pick-stock');
        if (div) {
            document.getElementById('pick-stock').style.display = 'none';
            this.pickCard.removeAll();
        }
    };
    TableCenter.prototype.renewCards = function (cards, topDeckCardBackType) {
        this.visibleCards.removeAll();
        this.setVisibleCards(cards);
        this.setTopDeckCardBackType(topDeckCardBackType);
    };
    TableCenter.prototype.setTopDeckCardBackType = function (topDeckCardBackType) {
        if (topDeckCardBackType !== undefined && topDeckCardBackType !== null) {
            document.getElementById('deck').dataset.type = topDeckCardBackType;
        }
    };
    TableCenter.prototype.setInitialCards = function (cards) {
        this.game.cards.addCardsToStock(this.visibleCards, cards, 'deck');
    };
    TableCenter.prototype.setVisibleCards = function (cards) {
        var newWeights = {};
        cards.forEach(function (card) { return newWeights[card.type] = card.location_arg; });
        this.visibleCards.changeItemsWeight(newWeights);
        this.game.cards.addCardsToStock(this.visibleCards, cards, 'deck');
    };
    TableCenter.prototype.removeOtherCardsFromPick = function (cardId) {
        var _this = this;
        var _a;
        var removeFromPickIds = (_a = this.pickCard) === null || _a === void 0 ? void 0 : _a.items.map(function (item) { return Number(item.id); });
        removeFromPickIds === null || removeFromPickIds === void 0 ? void 0 : removeFromPickIds.forEach(function (id) {
            if (id !== cardId) {
                _this.pickCard.removeFromStockById('' + id);
            }
        });
    };
    TableCenter.prototype.changeVisibleCardWeight = function (card) {
        var _a;
        this.visibleCards.changeItemsWeight((_a = {}, _a[card.type] = card.location_arg, _a));
    };
    TableCenter.prototype.getVisibleCards = function () {
        return this.visibleCards;
    };
    TableCenter.prototype.getPickCard = function () {
        return this.pickCard;
    };
    TableCenter.prototype.getTokyoTower = function () {
        return this.tokyoTower;
    };
    TableCenter.prototype.changeCurseCard = function (card) {
        this.curseCard.removeAll();
        this.curseCard.addToStockWithId(card.type, '' + card.id, 'curse-deck');
    };
    TableCenter.prototype.createWickednessTiles = function (wickednessTiles) {
        var _this = this;
        WICKEDNESS_LEVELS.forEach(function (level) {
            _this.wickednessTiles[level] = wickednessTiles.filter(function (tile) { return _this.game.wickednessTiles.getCardLevel(tile.type) === level; });
            var html = "<div id=\"wickedness-tiles-reduced-".concat(level, "\" class=\"wickedness-tiles-reduced wickedness-tile-stock\"></div>\n            <div id=\"wickedness-tiles-expanded-").concat(level, "\" class=\"wickedness-tiles-expanded\">\n                <div id=\"wickedness-tiles-expanded-").concat(level, "-close\" class=\"close\">\u2716</div>\n                <div id=\"wickedness-tiles-expanded-").concat(level, "-stock\" class=\"wickedness-tile-stock table-wickedness-tiles\"></div>\n            </div>");
            dojo.place(html, 'wickedness-board');
            _this.setReducedWickednessTiles(level);
            document.getElementById("wickedness-tiles-reduced-".concat(level)).addEventListener('click', function () { return _this.showWickednessTiles(level); });
            _this.wickednessTilesStocks[level] = new ebg.stock();
            _this.wickednessTilesStocks[level].setSelectionAppearance('class');
            _this.wickednessTilesStocks[level].selectionClass = 'no-visible-selection';
            _this.wickednessTilesStocks[level].create(_this.game, $("wickedness-tiles-expanded-".concat(level, "-stock")), WICKEDNESS_TILES_WIDTH, WICKEDNESS_TILES_HEIGHT);
            _this.wickednessTilesStocks[level].setSelectionMode(0);
            _this.wickednessTilesStocks[level].centerItems = true;
            _this.wickednessTilesStocks[level].onItemCreate = function (card_div, card_type_id) { return _this.game.wickednessTiles.setupNewCard(card_div, card_type_id); };
            dojo.connect(_this.wickednessTilesStocks[level], 'onChangeSelection', _this, function (_, item_id) { return _this.game.takeWickednessTile(Number(item_id)); });
            _this.game.wickednessTiles.setupCards([_this.wickednessTilesStocks[level]]);
            _this.wickednessTiles[level].forEach(function (tile) { return _this.wickednessTilesStocks[level].addToStockWithId(tile.type, '' + tile.id); });
            document.getElementById("wickedness-tiles-expanded-".concat(level)).addEventListener('click', function () { return dojo.removeClass("wickedness-tiles-expanded-".concat(level), 'visible'); });
        });
    };
    TableCenter.prototype.moveWickednessPoints = function () {
        var _this = this;
        this.wickednessPoints.forEach(function (wickedness, playerId) {
            var markerDiv = document.getElementById("monster-icon-".concat(playerId));
            var position = WICKEDNESS_MONSTER_ICON_POSITION[wickedness];
            var topShift = 0;
            var leftShift = 0;
            _this.wickednessPoints.forEach(function (iWickedness, iPlayerId) {
                if (iWickedness === wickedness && iPlayerId < playerId) {
                    topShift += 5;
                    leftShift += 5;
                }
            });
            markerDiv.style.left = "".concat(position[0] + leftShift, "px");
            markerDiv.style.top = "".concat(position[1] + topShift, "px");
        });
    };
    TableCenter.prototype.setWickedness = function (playerId, wickedness) {
        this.wickednessPoints.set(playerId, wickedness);
        this.moveWickednessPoints();
    };
    TableCenter.prototype.getWickednessTilesStock = function (level) {
        return this.wickednessTilesStocks[level];
    };
    TableCenter.prototype.showWickednessTiles = function (level) {
        dojo.addClass("wickedness-tiles-expanded-".concat(level), 'visible');
    };
    TableCenter.prototype.setWickednessTilesSelectable = function (level, show, selectable) {
        var _this = this;
        if (show) {
            this.showWickednessTiles(level);
        }
        else {
            WICKEDNESS_LEVELS.forEach(function (level) { return dojo.removeClass("wickedness-tiles-expanded-".concat(level), 'visible'); });
        }
        if (selectable) {
            dojo.addClass("wickedness-tiles-expanded-".concat(level), 'selectable');
            this.wickednessTilesStocks[level].setSelectionMode(1);
        }
        else {
            WICKEDNESS_LEVELS.forEach(function (level) {
                _this.wickednessTilesStocks[level].setSelectionMode(0);
                dojo.removeClass("wickedness-tiles-expanded-".concat(level), 'selectable');
            });
        }
    };
    TableCenter.prototype.setReducedWickednessTiles = function (level) {
        var _this = this;
        document.getElementById("wickedness-tiles-reduced-".concat(level)).innerHTML = '';
        this.wickednessTiles[level].forEach(function (tile, index) {
            dojo.place("<div id=\"wickedness-tiles-reduced-tile-".concat(tile.id, "\" class=\"stockitem wickedness-tiles-reduced-tile\" style=\"left: ").concat(index * 5, "px; top: ").concat(index * 5, "px;\"></div>"), "wickedness-tiles-reduced-".concat(level));
            _this.game.wickednessTiles.setDivAsCard(document.getElementById("wickedness-tiles-reduced-tile-".concat(tile.id)), tile.type);
        });
    };
    TableCenter.prototype.removeReducedWickednessTile = function (level, removedTile) {
        this.wickednessTiles[level].splice(this.wickednessTiles[level].findIndex(function (tile) { return tile.id == removedTile.id; }), 1);
        this.setReducedWickednessTiles(level);
    };
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
        this.cards = new Cards(this);
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this);
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
            /*case 'pickMonster':
                dojo.addClass('kot-table', 'pickMonsterOrEvolutionDeck');
                this.onEnteringPickMonster(args.args);
                break;*/
        }
    };
    /*private onEnteringPickMonster(args: EnteringPickMonsterArgs) {
        // TODO clean only needed
        document.getElementById('monster-pick').innerHTML = '';
        args.availableMonsters.forEach(monster => {
            let html = `
            <div id="pick-monster-figure-${monster}-wrapper">
                <div id="pick-monster-figure-${monster}" class="monster-figure monster${monster}"></div>`;
            if (this.isPowerUpExpansion()) {
                html += `<div><button id="see-monster-evolution-${monster}" class="bgabutton bgabutton_blue see-evolutions-button"><div class="player-evolution-card"></div>${('Show Evolutions')}</button></div>`;
            }
            html += `</div>`;
            dojo.place(html, `monster-pick`);

            document.getElementById(`pick-monster-figure-${monster}`).addEventListener('click', () => this.pickMonster(monster));
            if (this.isPowerUpExpansion()) {
                document.getElementById(`see-monster-evolution-${monster}`).addEventListener('click', () => this.showMonsterEvolutions(monster));
            }
        });

        const isCurrentPlayerActive = (this as any).isCurrentPlayerActive();
        dojo.toggleClass('monster-pick', 'selectable', isCurrentPlayerActive);
    }*/
    PointSalad.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            /*case 'beforeStartTurn':
                this.onLeavingStepEvolution();
                break;*/
        }
    };
    /*private onLeavingStepEvolution() {
            const playerId = this.getPlayerId();
            this.getPlayerTable(playerId)?.unhighlightHiddenEvolutions();
    }*/
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    PointSalad.prototype.onUpdateActionButtons = function (stateName, args) {
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                /*case 'beforeStartTurn':
                    (this as any).addActionButton('skipBeforeStartTurn_button', _("Skip"), () => this.skipBeforeStartTurn());
                    break;*/
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
        Object.values(gamedatas.players).forEach(function (player) {
            /*         const playerId = Number(player.id);
         
                     // health & energy counters
                     let html = `<div class="counters">
                         <div id="health-counter-wrapper-${player.id}" class="counter">
                             <div class="icon health"></div>
                             <span id="health-counter-${player.id}"></span>
                         </div>
                         <div id="energy-counter-wrapper-${player.id}" class="counter">
                             <div class="icon energy"></div>
                             <span id="energy-counter-${player.id}"></span>
                         </div>`;
                     if (gamedatas.wickednessExpansion) {
                         html += `
                         <div id="wickedness-counter-wrapper-${player.id}" class="counter">
                             <div class="icon wickedness"></div>
                             <span id="wickedness-counter-${player.id}"></span>
                         </div>`; // TODOWI
                     }
                     html += `</div>`;
                     dojo.place(html, `player_board_${player.id}`);
         
                     if (gamedatas.kingkongExpansion || gamedatas.cybertoothExpansion || gamedatas.cthulhuExpansion) {
                         let html = `<div class="counters">`;
         
                         if (gamedatas.cthulhuExpansion) {
                             html += `
                             <div id="cultist-counter-wrapper-${player.id}" class="counter cultist-tooltip">
                                 <div class="icon cultist"></div>
                                 <span id="cultist-counter-${player.id}"></span>
                             </div>`;
                         }
         
                         if (gamedatas.kingkongExpansion) {
                             html += `<div id="tokyo-tower-counter-wrapper-${player.id}" class="counter tokyo-tower-tooltip">`;
                             for (let level = 1; level <= 3 ; level++) {
                                 html += `<div id="tokyo-tower-icon-${player.id}-level-${level}" class="tokyo-tower-icon level${level}" data-owned="${player.tokyoTowerLevels.includes(level).toString()}"></div>`;
                             }
                             html += `</div>`;
                         }
         
                         if (gamedatas.cybertoothExpansion) {
                             html += `
                             <div id="berserk-counter-wrapper-${player.id}" class="counter berserk-tooltip">
                                 <div class="berserk-icon-wrapper">
                                     <div id="player-panel-berserk-${player.id}" class="berserk icon ${player.berserk ? 'active' : ''}"></div>
                                 </div>
                             </div>`;
                         }
         
                         html += `</div>`;
                         dojo.place(html, `player_board_${player.id}`);
         
                         if (gamedatas.cthulhuExpansion) {
                             const cultistCounter = new ebg.counter();
                             cultistCounter.create(`cultist-counter-${player.id}`);
                             cultistCounter.setValue(player.cultists);
                             this.cultistCounters[playerId] = cultistCounter;
                         }
                     }
         
                     const healthCounter = new ebg.counter();
                     healthCounter.create(`health-counter-${player.id}`);
                     healthCounter.setValue(player.health);
                     this.healthCounters[playerId] = healthCounter;
         
                     const energyCounter = new ebg.counter();
                     energyCounter.create(`energy-counter-${player.id}`);
                     energyCounter.setValue(player.energy);
                     this.energyCounters[playerId] = energyCounter;
         
                     if (gamedatas.wickednessExpansion) {
                         const wickednessCounter = new ebg.counter();
                         wickednessCounter.create(`wickedness-counter-${player.id}`);
                         wickednessCounter.setValue(player.wickedness);
                         this.wickednessCounters[playerId] = wickednessCounter;
                     }
         
                     if (gamedatas.powerUpExpansion) {
                         // hand cards counter
                         dojo.place(`<div class="counters">
                             <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                                 <div class="player-evolution-card"></div>
                                 <div class="player-hand-card"></div>
                                 <span id="playerhand-counter-${player.id}"></span>
                             </div>
                         </div>`, `player_board_${player.id}`);
         
                         const handCounter = new ebg.counter();
                         handCounter.create(`playerhand-counter-${playerId}`);
                         handCounter.setValue(player.hiddenEvolutions.length);
                         this.handCounters[playerId] = handCounter;
                     }
         */
        });
    };
    PointSalad.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        orderedPlayers.forEach(function (player) {
            return _this.playersTables.push(new PlayerTable(_this, gamedatas.players[Number(player.id)]));
        });
    };
    PointSalad.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === Number(playerId); });
    };
    PointSalad.prototype.getZoom = function () {
        return 1;
    };
    PointSalad.prototype.pickMonster = function (monster) {
        if (!this.checkAction('pickMonster')) {
            return;
        }
        this.takeAction('pickMonster', {
            monster: monster
        });
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
            ['pickMonster', ANIMATION_MS],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    PointSalad.prototype.notif_pickMonster = function (notif) {
        var _this = this;
        var monsterDiv = document.getElementById("pick-monster-figure-".concat(notif.args.monster));
        var destinationId = "player-board-monster-figure-".concat(notif.args.playerId);
        var animation = this.slideToObject(monsterDiv, destinationId);
        dojo.connect(animation, 'onEnd', dojo.hitch(this, function () {
            _this.fadeOutAndDestroy(monsterDiv);
            dojo.removeClass(destinationId, 'monster0');
            dojo.addClass(destinationId, "monster".concat(notif.args.monster));
        }));
        animation.play();
        this.getPlayerTable(notif.args.playerId).setMonster(notif.args.monster);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    PointSalad.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
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
