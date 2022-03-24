const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

const POINTS_DEG = [25, 40, 56, 73, 89, 105, 122, 138, 154, 170, 187, 204, 221, 237, 254, 271, 288, 305, 322, 339, 359];
const HEALTH_DEG = [360, 326, 301, 274, 249, 226, 201, 174, 149, 122, 98, 64, 39];
const SPLIT_ENERGY_CUBES = 6;
type TokenType = 'poison' | 'shrink-ray';

class PlayerTable {
    public playerId: number;
    public playerNo: number;
    private monster: number;
    private initialLocation: number;
    private tokyoTower: TokyoTower;
    private showHand: boolean = false;

    public cards: Stock;
    public wickednessTiles: Stock;
    public hiddenEvolutionCards: Stock;
    public visibleEvolutionCards: Stock;
    public pickEvolutionCards: Stock;

    constructor(private game: PointSaladGame, private player: PointSaladPlayer) {
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

    public initPlacement() {
        if (this.initialLocation > 0) {
            this.enterTokyo(this.initialLocation);
        }
    }

    public enterTokyo(location: number) {        
        transitionToObjectAndAttach(this.game, document.getElementById(`monster-figure-${this.playerId}`), `tokyo-${location == 2 ? 'bay' : 'city'}`, this.game.getZoom());
    }

    public leaveTokyo() {  
        transitionToObjectAndAttach(this.game, document.getElementById(`monster-figure-${this.playerId}`), `monster-board-${this.playerId}-figure-wrapper`, this.game.getZoom());
    }

    public setVisibleCardsSelectionClass(visible: boolean) {
        document.getElementById(`player-table-${this.playerId}`).classList.toggle('double-selection', visible);
    }

    public removeCards(cards: Card[]) {
        const cardsIds = cards.map(card => card.id);
        cardsIds.forEach(id => this.cards.removeFromStockById(''+id));
    }

    public removeWickednessTiles(tiles: WickednessTile[]) {
        const tilesIds = tiles.map(tile => tile.id);
        tilesIds.forEach(id => this.wickednessTiles.removeFromStockById(''+id));
    }

    public removeEvolutions(cards: EvolutionCard[]) {
        const cardsIds = cards.map(card => card.id);
        cardsIds.forEach(id => {
            this.hiddenEvolutionCards.removeFromStockById(''+id);
            this.visibleEvolutionCards.removeFromStockById(''+id);
        });
    }

    public setPoints(points: number, delay: number = 0) {
        setTimeout(
            () => document.getElementById(`blue-wheel-${this.playerId}`).style.transform = `rotate(${POINTS_DEG[Math.min(20, points)]}deg)`,
            delay
        );
    }

    public setHealth(health: number, delay: number = 0) {
        setTimeout(
            () => document.getElementById(`red-wheel-${this.playerId}`).style.transform = `rotate(${health > 12 ? 22 : HEALTH_DEG[health]}deg)`,
            delay
        );
    }

    public setEnergy(energy: number, delay: number = 0) {
        setTimeout(
            () => {
                if (this.game.isKingkongExpansion()) {
                    this.setEnergyOnSide('left', energy);
                } else {
                    this.setEnergyOnSide('left', Math.min(energy, SPLIT_ENERGY_CUBES));
                    this.setEnergyOnSide('right', Math.max(energy - SPLIT_ENERGY_CUBES, 0));
                }
            },
            delay
        );
    }

    public eliminatePlayer() {
        this.setEnergy(0);
        this.cards.items.filter(item => item.id !== 'goldenscarab').forEach(item => this.cards.removeFromStockById(item.id));
        if (document.getElementById(`monster-figure-${this.playerId}`)) {
            (this.game as any).fadeOutAndDestroy(`monster-figure-${this.playerId}`);
        }
        dojo.addClass(`player-table-${this.playerId}`, 'eliminated');
    }
    
    public setActivePlayer(active: boolean): void {
        dojo.toggleClass(`player-table-${this.playerId}`, 'active', active);
        dojo.toggleClass(`overall_player_board_${this.playerId}`, 'active', active);
    }
    
    public setFont(prefValue: number): void {
        const defaultFont = prefValue === 1;
        dojo.toggleClass(`player-name-${this.playerId}`, 'standard', defaultFont);
        dojo.toggleClass(`player-name-${this.playerId}`, 'goodgirl', !defaultFont);
    }

    private getDistance(p1: PlacedTokens, p2: PlacedTokens): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    private getPlaceEnergySide(placed: PlacedTokens[]): PlacedTokens {
        const newPlace = {
            x: Math.random() * 33 + 16,
            y: Math.random() * 188 + 16,
        };
        let protection = 0;
        while (protection < 1000 && placed.some(place => this.getDistance(newPlace, place) < 32)) {
            newPlace.x = Math.random() * 33 + 16;
            newPlace.y = Math.random() * 188 + 16;
            protection++;
        }

        return newPlace;
    }

    private setEnergyOnSide(side: 'left' | 'right', energy: number) {
        const divId = `energy-wrapper-${this.playerId}-${side}`;
        const div = document.getElementById(divId);
        if (!div) {
            return;
        }
        const placed: PlacedTokens[] = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];

        // remove tokens
        for (let i = energy; i < placed.length; i++) {
            (this.game as any).fadeOutAndDestroy(`${divId}-token${i}`);
        }
        placed.splice(energy, placed.length - energy);

        // add tokens
        for (let i = placed.length; i < energy; i++) {
            const newPlace = this.getPlaceEnergySide(placed);

            placed.push(newPlace);
            let html = `<div id="${divId}-token${i}" style="left: ${newPlace.x - 16}px; top: ${newPlace.y - 16}px;" class="energy-cube"></div>`;
            dojo.place(html, divId);
        }

        div.dataset.placed = JSON.stringify(placed);
    }
    
    public setMonster(monster: number) {
        const newMonsterClass = `monster${monster}`;

        dojo.removeClass(`monster-figure-${this.playerId}`, 'monster0');
        dojo.addClass(`monster-figure-${this.playerId}`, newMonsterClass);

        dojo.removeClass(`monster-board-${this.playerId}`, 'monster0');
        dojo.addClass(`monster-board-${this.playerId}`, newMonsterClass);
    }

    private getPlaceToken(placed: PlacedTokens[]): PlacedTokens {
        const newPlace = {
            x: 16,
            y: Math.random() * 138 + 16,
        };
        let protection = 0;
        while (protection < 1000 && placed.some(place => this.getDistance(newPlace, place) < 32)) {
            newPlace.y = Math.random() * 138 + 16;
            protection++;
        }

        return newPlace;
    }

    private setTokens(type: TokenType, tokens: number) {
        const divId = `token-wrapper-${this.playerId}-${type}`;
        const div = document.getElementById(divId);
        if (!div) {
            return;
        }
        const placed: PlacedTokens[] = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];

        // remove tokens
        for (let i = tokens; i < placed.length; i++) {
            (this.game as any).fadeOutAndDestroy(`${divId}-token${i}`);
        }
        placed.splice(tokens, placed.length - tokens);

        // add tokens
        for (let i = placed.length; i < tokens; i++) {
            const newPlace = this.getPlaceToken(placed);

            placed.push(newPlace);
            let html = `<div id="${divId}-token${i}" style="left: ${newPlace.x - 16}px; top: ${newPlace.y - 16}px;" class="${type} token"></div>`;
            dojo.place(html, divId);

            (this.game as any).addTooltipHtml(`${divId}-token${i}`, type === 'poison' ? this.game.POISON_TOKEN_TOOLTIP : this.game.SHINK_RAY_TOKEN_TOOLTIP)
        }

        div.dataset.placed = JSON.stringify(placed);
    }

    public setPoisonTokens(tokens: number) {
        this.setTokens('poison', tokens);
    }

    public setShrinkRayTokens(tokens: number) {
        this.setTokens('shrink-ray', tokens);
    }
    
    public getTokyoTower() {
        return this.tokyoTower;
    }

    public setBerserk(berserk: boolean) {
        document.getElementById(`berserk-token-${this.playerId}`).dataset.visible = berserk ? 'true' : 'false';
    }
    
    public changeForm(card: Card) {
        const cardDiv = document.getElementById(`${this.cards.container_div.id}_item_${card.id}`) as HTMLDivElement;
        cardDiv.dataset.side = ''+card.side;
        (this.game as any).addTooltipHtml(cardDiv.id, this.game.cards.updateFlippableCardTooltip(cardDiv));
        this.setMonsterFigureBeastMode(card.side === 1);
    }

    private setMonsterFigureBeastMode(beastMode: boolean) {
        if (this.monster === 12) {
            document.getElementById(`monster-figure-${this.playerId}`).classList.toggle('beast-mode', beastMode);
        }
    }

    public setCultistTokens(tokens: number) {
        const containerId = `player-table-cultist-tokens-${this.playerId}`;
        const container = document.getElementById(containerId);
        while (container.childElementCount > tokens) {
            container.removeChild(container.lastChild);
        }
        for (let i=container.childElementCount; i<tokens; i++) {
            dojo.place(`<div id="${containerId}-${i}" class="cultist-token cultist-tooltip"></div>`, containerId);
            (this.game as any).addTooltipHtml(`${containerId}-${i}`, this.game.CULTIST_TOOLTIP);
        }
    }

    public takeGoldenScarab(previousOwnerStock: Stock) {
        const sourceStockItemId = `${previousOwnerStock.container_div.id}_item_goldenscarab`;
        this.cards.addToStockWithId(999, 'goldenscarab', sourceStockItemId);
        previousOwnerStock.removeFromStockById(`goldenscarab`);
    }
    
    public showEvolutionPickStock(cards: EvolutionCard[]) {
        if (!this.pickEvolutionCards) { 
            dojo.place(`<div id="pick-evolution${this.playerId}" class="evolution-card-stock player-evolution-cards pick-evolution-cards"></div>`, `monster-board-wrapper-${this.playerId}`);

            this.pickEvolutionCards = new ebg.stock() as Stock;
            this.pickEvolutionCards.setSelectionAppearance('class');
            this.pickEvolutionCards.selectionClass = 'no-visible-selection-except-double-selection';
            this.pickEvolutionCards.create(this.game, $(`pick-evolution${this.playerId}`), CARD_WIDTH, CARD_WIDTH);
            this.pickEvolutionCards.setSelectionMode(1);
            this.pickEvolutionCards.onItemCreate = (card_div, card_type_id) => this.game.evolutionCards.setupNewCard(card_div, card_type_id); 
            this.pickEvolutionCards.image_items_per_row = 10;
            this.pickEvolutionCards.centerItems = true;
            dojo.connect(this.pickEvolutionCards, 'onChangeSelection', this, (_, item_id: string) => this.game.chooseEvolutionCardClick(Number(item_id)));
        } else {
            document.getElementById(`pick-evolution${this.playerId}`).style.display = 'block';
        }

        this.game.evolutionCards.setupCards([this.pickEvolutionCards]);
        //this.game.evolutionCards.addCardsToStock(this.pickEvolutionCards, cards);
        cards.forEach(card => this.pickEvolutionCards.addToStockWithId(card.type, '' + card.id));
    }

    public hideEvolutionPickStock() {
        const div = document.getElementById(`pick-evolution${this.playerId}`);
        if (div) {
            document.getElementById(`pick-evolution${this.playerId}`).style.display = 'none';
            this.pickEvolutionCards.removeAll();
        }
    }
    
    public playEvolution(card: EvolutionCard) {
        this.game.evolutionCards.moveToAnotherStock(this.hiddenEvolutionCards, this.visibleEvolutionCards, card);
    }
    
    public highlightHiddenEvolutions(cards: EvolutionCard[]) {
        cards.forEach(card => {
            const cardDiv = document.getElementById(`${this.hiddenEvolutionCards.container_div.id}_item_${card.id}`) as HTMLDivElement;
            cardDiv?.classList.add('highlight-evolution');
        });
    }
    
    public unhighlightHiddenEvolutions() {
        this.hiddenEvolutionCards?.items.forEach(card => {
            const cardDiv = document.getElementById(`${this.hiddenEvolutionCards.container_div.id}_item_${card.id}`) as HTMLDivElement;
            cardDiv.classList.remove('highlight-evolution');
        });
    }
}