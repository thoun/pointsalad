declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;

const ANIMATION_MS = 500;

class PointSalad implements PointSaladGame {
    private gamedatas: PointSaladGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private selectedCards: Card[] = [];
    private veggieCounters: Counter[][] = [];
    private canTakeOnlyOneVeggie: boolean = false;    
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor() {
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

    public setup(gamedatas: PointSaladGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.createPlayerPanels(gamedatas); 
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);        
        this.createPlayerJumps(gamedatas);

        if (gamedatas.cardScores) {
            Object.keys(gamedatas.cardScores).forEach(key => this.setCardScore(Number(key), gamedatas.cardScores[key]))
        }

        this.setupNotifications();

        if (gamedatas.showAskFlipPhase) {
            this.addAskFlipPhaseToggle(gamedatas.askFlipPhase);
        }

        (this as any).onScreenWidthChange = () => this.placeMarket();

        log( "Ending game setup" );

        // TODO TEMP
        //this.debugSeeAllPointCards();
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
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
    }
    
    private onEnteringTakeCards(args: EnteringTakeCardsArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            document.getElementById('table').dataset.selectableCards = 'true';
            this.canTakeOnlyOneVeggie = args.canTakeOnlyOneVeggie;
        }
    }
    
    private onEnteringFlipCard(args: EnteringFlipCardArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            document.getElementById(`player-points-${this.getPlayerId()}`).dataset.selectableCards = 'true';
        }
    }

    private onEnteringShowScore() {
        Object.keys(this.gamedatas.players).forEach(playerId => (this as any).scoreCtrl[playerId]?.setValue(0));
        this.gamedatas.hiddenScore = false;
        console.log('onEnteringShowScore', this.gamedatas.hiddenScore);
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'takeCards':
                this.onLeavingTakeCards();
                break;
            case 'flipCard':
                this.onLeavingFlipCard();
                break;
        }
    }
    
    private onLeavingTakeCards() {
        this.selectedCards = [];
        Array.from(document.getElementsByClassName('card selected')).forEach(card => card.classList.remove('selected'));
        document.getElementById('table').dataset.selectableCards = 'false';
    }
    
    private onLeavingFlipCard() {
        this.selectedCards = [];
        Array.from(document.getElementsByClassName('card selected')).forEach(card => card.classList.remove('selected'));
        const playerPoints = document.getElementById(`player-points-${this.getPlayerId()}`);
        if (playerPoints) {
            playerPoints.dataset.selectableCards = 'false';
        }
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {

        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'takeCards':
                    (this as any).addActionButton('takeCards_button', _("Take selected card(s)"), () => this.takeCards(this.selectedCards.map(card => card.id)));
                    this.checkSelection();
                    break;
                case 'flipCard':
                    (this as any).addActionButton('flipCard_button', _("Flip selected card"), () => this.flipCard(this.selectedCards[0].id));
                    (this as any).addActionButton('skipFlipCard_button', _("Skip"), () => this.skipFlipCard());
                    this.checkSelection();
                    break;
            }
        }
    }
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public isVisibleScoring(): boolean {
        return !this.gamedatas.hiddenScore;
    }

    // gameui.debugSeeAllPointCards()
    debugSeeAllPointCards() {
        let html = `<div id="all-point-cards">`;
        for (let veggie = 1; veggie <= 6; veggie++) {
            html += `<div id="all-point-cards-${veggie}" style="display: flex; flex-wrap: nowrap;"></div>`;
        }
        html += `</div>`;
        dojo.place(html, 'full-table', 'before');

        for (let veggie = 1; veggie <= 6; veggie++) {
            for (let i = 1; i <= 12; i++) {
                this.createOrMoveCard({
                    id: 1000*veggie+i,
                    side: 0,
                    index: i,
                    veggie: veggie,
                } as Card, `all-point-cards-${veggie}`, 'for test only');
            }
        }
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }

    private createPlayerPanels(gamedatas: PointSaladGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);
            this.veggieCounters[playerId] = [];

            let html = ``;
            if (playerId === this.getPlayerId()) {
                html += `<div id="rapid-actions"></div>`;
            }
            html += `<div id="veggie-counters-${playerId}">`;
            for (let veggie = 1; veggie <= 6; veggie++) {
                if (veggie === 1 || veggie === 4) {
                    html += `<div class="counters">`;
                }

                html += `
                    <div id="veggie${veggie}-counter-wrapper-${player.id}" class="counter">
                        <div class="icon" data-veggie="${veggie}"></div> 
                        <span id="veggie${veggie}-counter-${player.id}"></span>
                    </div>`;

                if (veggie === 3 || veggie === 6) {
                    html += `</div>`;
                }
            }
            html += `</div>`;
            
            dojo.place(html, `player_board_${player.id}`);

            for (let veggie = 1; veggie <= 6; veggie++) {
                const veggieCounter = new ebg.counter();
                veggieCounter.create(`veggie${veggie}-counter-${player.id}`);
                veggieCounter.setValue(player.veggieCounts[veggie]);
                this.veggieCounters[playerId][veggie] = veggieCounter;
            }

            this.setTooltip(`veggie-counters-${playerId}`, _("Veggie counters"));   

            this.setNewScore(playerId, Number(player.score));
        });
    }

    private getOrderedPlayers(gamedatas: PointSaladGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerTables(gamedatas: PointSaladGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => this.createPlayerTable(gamedatas, Number(player.id)) );
    }

    private createPlayerTable(gamedatas: PointSaladGamedatas, playerId: number) {
        const playerTable = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(playerTable);
    }

    private createPlayerJumps(gamedatas: PointSaladGamedatas) {
        dojo.place(`
        <div id="jump-toggle" class="jump-link toggle">
            ⇔
        </div>
        <div id="jump-0" class="jump-link">
            <div class="eye"></div> ${_('Market')}
        </div>`, `jump-controls`);
        document.getElementById(`jump-toggle`).addEventListener('click', () => this.jumpToggle());
        document.getElementById(`jump-0`).addEventListener('click', () => this.jumpToPlayer(0));
        
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => {
            dojo.place(`<div id="jump-${player.id}" class="jump-link" style="color: #${player.color}; border-color: #${player.color};"><div class="eye" style="background: #${player.color};"></div> ${player.name}</div>`, `jump-controls`);
            document.getElementById(`jump-${player.id}`).addEventListener('click', () => this.jumpToPlayer(Number(player.id)));	
        });

        const jumpDiv = document.getElementById(`jump-controls`);
        jumpDiv.style.marginTop = `-${Math.round(jumpDiv.getBoundingClientRect().height / 2)}px`;
    }
    
    private jumpToggle(): void {
        document.getElementById(`jump-controls`).classList.toggle('folded');
    }
    
    private jumpToPlayer(playerId: number): void {
        const elementId = playerId === 0 ? `market` : `player-table-${playerId}`;
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    private placeMarket() {
        const market = document.getElementById('table');
        const largeScreen = document.getElementById(`full-table`).clientWidth >= 1020;
        document.getElementById(largeScreen ? `table-right` : `table-inner`).appendChild(market);
    }

    public getZoom() {
        return 1;
    }

    private getVeggieName(veggie: number) {
        switch (veggie) {
            case CABBAGE: return _('Cabbage');
            case CARROT: return _('Carrot');
            case LETTUCE: return _('Lettuce');
            case ONION: return _('Onion');
            case PEPPER: return _('Pepper');
            case TOMATO: return _('Tomato');
        }
    }

    private setNewScore(playerId: number, score: number) {
        if (this.gamedatas.hiddenScore) {
            setTimeout(() => {
                if (this.gamedatas.hiddenScore) {
                    Object.keys(this.gamedatas.players).forEach(pId => document.getElementById(`player_score_${pId}`).innerHTML = '-');
                }
            }, 100);
        } else {
            if (!isNaN(score)) {
                (this as any).scoreCtrl[playerId]?.toValue(score);
            }
        }
    }

    public createOrMoveCard(card: Card, destinationId: string, tooltip: string, init: boolean = false, from: string = null) {
        const existingDiv = document.getElementById(`card-${card.id}`);
        if (existingDiv) {
            (this as any).removeTooltip(`card-${card.id}`);

            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            } else {
                slideToObjectAndAttach(this, existingDiv, destinationId);
            }
            existingDiv.dataset.side = ''+card.side;

            this.setTooltip(existingDiv.id, tooltip);
        } else {
            const name = this.getVeggieName(card.veggie);
            const div = document.createElement('div');
            div.id = `card-${card.id}`;
            div.classList.add('card');
            div.dataset.side = ''+card.side;
            div.dataset.veggie = ''+card.veggie;
            div.dataset.index = ''+card.index;
            div.innerHTML = `
                <div class="card-sides">
                    <div class="card-side front">
                        <div>${CARDS_EFFECTS[card.veggie]?.[card.index]?.() || ''}</div>
                    </div>
                    <div class="card-side back">
                        <div class="name">${name}</div>
                        <div class="name rotated">${name}</div>
                    </div>
                </div>
            `;
            document.getElementById(destinationId).appendChild(div);
            div.addEventListener('click', () => this.onCardClick(card));

            if (from) {
                const fromCardId = document.getElementById(from).children[0].id;
                slideFromObject(this, div, fromCardId);
            }
            
            this.setTooltip(div.id, tooltip);
        }
    }

    private getPointSideTooltip(card: Card) {
        return ``;
    }

    public getPlayerCardTooltip(card: Card) {
        if (card.side === 0) {
            return `<div class="card-tooltip">
                <div class="card-tooltip-name">${_("Point card")}</div>
                <div class="card-tooltip-description">
                    <div>${_("At the end of the game, score Victory Points if you match the card conditions with your veggie cards. You may score a point card multiple times.")}</div>
                    <div>${this.getPointSideTooltip(card)}</div>
                </div>
            </div>`;
        } else if (card.side === 1) {
            return `<div class="card-tooltip">
                <div class="card-tooltip-name">${_("Veggie card")}</div>
                <div class="card-tooltip-description">
                    <div>${this.getVeggieName(card.veggie)}</div>
                </div>
            </div>`;
        }
    }

    public getMarketCardTooltip(card: Card) {
        if (card.side === 0) {
            return `<div class="card-tooltip">
                <div class="card-tooltip-name">${_("Draw pile")} (${_("Point card")})</div>
                <div class="card-tooltip-description">
                    <div>${_("At your turn, you can take one Point card from the draw pile.")}</div>
                    <div>${this.getPointSideTooltip(card)}</div>
                </div>
            </div>`;
        } else if (card.side === 1) {
            return `<div class="card-tooltip">
                <div class="card-tooltip-name">${_("Veggie market")} (${_("Veggie card")})</div>
                <div class="card-tooltip-description">
                    <div>${_("At your turn, you can take two Veggie cards from the market.")}</div>
                    <div>${this.getVeggieName(card.veggie)}</div>
                </div>
            </div>`;
        }
    }

    private updateVeggieCount(playerId: number, veggieCounts: VeggieCounts) {
        for (let veggie = 1; veggie <= 6; veggie++) {
            this.veggieCounters[playerId][veggie].toValue(veggieCounts[veggie]);
        }
    }

    private getSide(cardId: number): number {        
        const div = document.getElementById(`card-${cardId}`);
        return Number(div.dataset.side);
    }

    private addAskFlipPhaseToggle(active: boolean) {
        if (!document.getElementById('askFlipPhaseWrapper')) {
            dojo.place(`<div id="askFlipPhaseWrapper">
                <label class="switch">
                    <input id="askFlipPhaseCheckbox" type="checkbox" ${active ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
                <label for="askFlipPhaseCheckbox" class="text-label">${_("Ask to flip cards")}</label>
            </div>`, 'rapid-actions');

            document.getElementById('askFlipPhaseCheckbox').addEventListener('change', (e: any) => this.setAskFlipPhase(e.target.checked));

            this.setTooltip('askFlipPhaseWrapper', _("Disable this is you don't want to be asked to flip a Point card."));
        }
    }

    private removeAskFlipPhaseToggle() {
        const wrapper = document.getElementById('askFlipPhaseWrapper');
        wrapper?.parentElement?.removeChild(wrapper);
    }

    private setCardScore(cardId: number, cardScore: number) {
        dojo.place(formatTextIcons(`<div class="final-score">[${cardScore}]</div>`), `card-${cardId}`);
    }

    private checkSelection() {
        const canTakeCards = 
            (this.selectedCards.length === 1 && this.getSide(this.selectedCards[0].id) === 0) ||
            (this.selectedCards.length === (this.canTakeOnlyOneVeggie ? 1 : 2) && this.selectedCards.every(card => this.getSide(card.id) === 1));
        document.getElementById('takeCards_button')?.classList.toggle('disabled', !canTakeCards);
        document.getElementById('flipCard_button')?.classList.toggle('disabled', this.selectedCards.length !== 1);
    }

    private onCardClick(card: Card) {
        const div = document.getElementById(`card-${card.id}`);

        if(!(this as any).isCurrentPlayerActive() || !div.closest('[data-selectable-cards="true"]')) {
            return;
        }

        const index = this.selectedCards.indexOf(card);
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        } else {
            this.selectedCards.push(card);
        }

        div.classList.toggle('selected');

        this.checkSelection();
    }

    public takeCards(ids: number[]) {
        if(!(this as any).checkAction('takeCards')) {
            return;
        }

        this.takeAction('takeCards', {
            ids: ids.join(','),
        });
    }

    public flipCard(id: number) {
        if(!(this as any).checkAction('flipCard')) {
            return;
        }

        this.takeAction('flipCard', {
            id
        });
    }

    public skipFlipCard() {
        if(!(this as any).checkAction('skipFlipCard')) {
            return;
        }

        this.takeAction('skipFlipCard');
    }

    public setAskFlipPhase(askFlipPhase: boolean) {
        this.takeNoLockAction('setAskFlipPhase', {
            askFlipPhase
        });
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/pointsalad/pointsalad/${action}.html`, data, this, () => {});
    }

    public takeNoLockAction(action: string, data?: any) {
        data = data || {};
        (this as any).ajaxcall(`/pointsalad/pointsalad/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['points', 1],
            ['takenCards', ANIMATION_MS],
            ['flippedCard', ANIMATION_MS],
            ['marketRefill', ANIMATION_MS],
            ['pileRefill', ANIMATION_MS],
            ['cardScore', 1000],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_points(notif: Notif<NotifPointsArgs>) {
        Object.keys(notif.args.points).forEach((playerId) =>        
            this.setNewScore(Number(playerId), notif.args.points[playerId])
        );
    }

    notif_takenCards(notif: Notif<NotifTakenCardsArgs>) {
        const playerId = notif.args.playerId;
        notif.args.cards.forEach(card => 
            this.createOrMoveCard(card, card.side === 0 ? `player-points-${playerId}` : `player-veggies-${playerId}-${card.veggie}`, this.getPlayerCardTooltip(card))
        );
        this.updateVeggieCount(playerId, notif.args.veggieCounts);

        const pile = notif.args.pile;
        const pileTop = notif.args.pileTop;
        const pileCount = notif.args.pileCount;
        if (pileTop) {
            this.createOrMoveCard(pileTop, `pile${pile}`, this.getMarketCardTooltip(pileTop));
        }
        if (pileCount !== null) {
            this.tableCenter.pileCounters[pile].setValue(pileCount);
        }

        if (notif.args.showAskFlipCard && playerId == this.getPlayerId()) {
            this.addAskFlipPhaseToggle(true);
        }
    }

    notif_flippedCard(notif: Notif<NotifFlippedCardArgs>) {
        const playerId = notif.args.playerId;
        const card = notif.args.card;
        this.createOrMoveCard(card, `player-veggies-${playerId}-${card.veggie}`, this.getPlayerCardTooltip(card));
        this.updateVeggieCount(playerId, notif.args.veggieCounts);

        if (notif.args.hideAskFlipCard && playerId == this.getPlayerId()) {
            this.removeAskFlipPhaseToggle();
        }        
    }

    notif_marketRefill(notif: Notif<NotifMarketRefillArgs>) {
        const pile = notif.args.pile;
        const card = notif.args.card;
        this.createOrMoveCard(card, `market-row${card.locationArg}-card${pile}`, this.getMarketCardTooltip(card));
        const pileTop = notif.args.pileTop;
        if (pileTop) {
            this.createOrMoveCard(pileTop, `pile${pile}`, this.getMarketCardTooltip(pileTop));
        }
        this.tableCenter.pileCounters[pile].setValue(notif.args.pileCount);
    }

    notif_pileRefill(notif: Notif<NotifPileRefillArgs>) {
        const pile = notif.args.pile;
        const pileTop = notif.args.pileTop;
        if (pileTop) {
            this.createOrMoveCard(pileTop, `pile${pile}`, this.getMarketCardTooltip(pileTop), false, `pile${notif.args.fromPile}`);
        }
        this.tableCenter.setPileCounts(notif.args.pileCounts);
    }

    notif_cardScore(notif: Notif<NotifCardScoreArgs>) {
        this.setCardScore(notif.args.card.id, notif.args.cardScore);
        (this as any).scoreCtrl[notif.args.playerId]?.incValue(notif.args.cardScore);
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card

                if (args.veggies && typeof args.veggies == 'object') {
                    args.veggies = args.veggies.map(veggie => `<div class="icon" data-veggie="${veggie}"></div>`).join('');
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
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}