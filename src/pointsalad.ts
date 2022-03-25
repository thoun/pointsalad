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

        this.setupNotifications();

        log( "Ending game setup" );
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
        }
    }
    
    private onEnteringTakeCards(args: EnteringTakeCardsArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            document.getElementById('table').dataset.selectableCards = 'true';
        }
    }
    
    private onEnteringFlipCard(args: EnteringFlipCardArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            document.getElementById(`player-points-${this.getPlayerId()}`).dataset.selectableCards = 'true';
        }
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

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    private createPlayerPanels(gamedatas: PointSaladGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);
            this.veggieCounters[playerId] = [];

            let html = ``;
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
            
            dojo.place(html, `player_board_${player.id}`);

            for (let veggie = 1; veggie <= 6; veggie++) {
                const veggieCounter = new ebg.counter();
                veggieCounter.create(`veggie${veggie}-counter-${player.id}`);
                veggieCounter.setValue(player.veggieCounts[veggie]);
                this.veggieCounters[playerId][veggie] = veggieCounter;
            }

        });
    }

    private createPlayerTables(gamedatas: PointSaladGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;

        orderedPlayers.forEach(player => this.createPlayerTable(gamedatas, Number(player.id)) );
    }

    private createPlayerTable(gamedatas: PointSaladGamedatas, playerId: number) {
        const playerTable = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(playerTable);
    }

    public getZoom() {
        return 1;
    }

    public createOrMoveCard(card: Card, destinationId: string, init: boolean = false) {
        const existingDiv = document.getElementById(`card-${card.id}`);
        if (existingDiv) {
            existingDiv.dataset.side = ''+card.side;
            if (card.side === 1) {
                existingDiv.innerHTML = '';
            }
            if (init) {
                document.getElementById(destinationId).appendChild(existingDiv);
            } else {
                slideToObjectAndAttach(this, existingDiv, destinationId);
            }
        } else {
            const div = document.createElement('div');
            div.id = `card-${card.id}`;
            div.classList.add('card');
            div.dataset.side = ''+card.side;
            div.dataset.veggie = ''+card.veggie;
            div.dataset.index = ''+card.index;
            document.getElementById(destinationId).appendChild(div);
            div.addEventListener('click', () => this.onCardClick(card));
            if (card.side === 0) {
                div.innerHTML = `<span>${CARDS_EFFECTS[card.veggie]?.[card.index] || ''}</span>`;
            }
        }
    }

    private updateVeggieCount(playerId: number, veggieCounts: VeggieCounts) {
        for (let veggie = 1; veggie <= 6; veggie++) {
            this.veggieCounters[playerId][veggie].toValue(veggieCounts[veggie]);
        }
    }

    private checkSelection() {
        const canTakeCards = 
            (this.selectedCards.length === 1 && this.selectedCards[0].side === 0) ||
            (this.selectedCards.length === 2 && this.selectedCards[0].side === 1); // TODO handle only 1 remaining market card
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

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
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
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_points(notif: Notif<NotifPointsArgs>) {
        (this as any).scoreCtrl[notif.args.playerId]?.toValue(notif.args.points);
    }

    notif_takenCards(notif: Notif<NotifTakenCardsArgs>) {
        const playerId = notif.args.playerId;
        notif.args.cards.forEach(card => 
            this.createOrMoveCard(card, card.side === 0 ? `player-points-${playerId}` : `player-veggies-${playerId}-${card.veggie}`)
        );
        this.updateVeggieCount(playerId, notif.args.veggieCounts);

        const pile = notif.args.pile;
        const pileTop = notif.args.pileTop;
        const pileCount = notif.args.pileCount;
        if (pileTop) {
            this.createOrMoveCard(pileTop, `pile${pile}`);
        }
        if (pileCount !== null) {
            this.tableCenter.pileCounters[pile].setValue(pileCount);
        }
    }

    notif_flippedCard(notif: Notif<NotifFlippedCardArgs>) {
        const playerId = notif.args.playerId;
        const card = notif.args.card;
        this.createOrMoveCard(card, `player-veggies-${playerId}-${card.veggie}`);
        this.updateVeggieCount(playerId, notif.args.veggieCounts);
    }

    notif_marketRefill(notif: Notif<NotifMarketRefillArgs>) {
        const pile = notif.args.pile;
        const card = notif.args.card;
        this.createOrMoveCard(card, `market-row${card.locationArg}-card${pile}`);
        const pileTop = notif.args.pileTop;
        this.createOrMoveCard(pileTop, `pile${pile}`);
        this.tableCenter.pileCounters[pile].setValue(notif.args.pileCount);
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