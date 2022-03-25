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
    public cards: Cards;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];

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

        this.cards = new Cards(this);

        this.createPlayerPanels(gamedatas); 
        this.tableCenter = new TableCenter(this);
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
            /*case 'pickMonster':
                dojo.addClass('kot-table', 'pickMonsterOrEvolutionDeck');
                this.onEnteringPickMonster(args.args);
                break;*/
        }
    }
    
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

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            /*case 'beforeStartTurn':
                this.onLeavingStepEvolution();
                break;*/
        }
    }
    
    /*private onLeavingStepEvolution() {
            const playerId = this.getPlayerId();
            this.getPlayerTable(playerId)?.unhighlightHiddenEvolutions();
    }*/

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {

        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                /*case 'beforeStartTurn':
                    (this as any).addActionButton('skipBeforeStartTurn_button', _("Skip"), () => this.skipBeforeStartTurn());
                    break;*/
                
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

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === Number(playerId));
    }

    public getZoom() {
        return 1;
    }

    public pickMonster(monster: number) {
        if(!(this as any).checkAction('pickMonster')) {
            return;
        }

        this.takeAction('pickMonster', {
            monster
        });
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
            ['pickMonster', ANIMATION_MS],
            ['points', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_pickMonster(notif: Notif<any/*NotifPickMonsterArgs*/>) {
       const monsterDiv = document.getElementById(`pick-monster-figure-${notif.args.monster}`); 
       const destinationId = `player-board-monster-figure-${notif.args.playerId}`;
       const animation = (this as any).slideToObject(monsterDiv, destinationId);

        dojo.connect(animation, 'onEnd', dojo.hitch(this, () => {
            (this as any).fadeOutAndDestroy(monsterDiv);
            dojo.removeClass(destinationId, 'monster0');
            dojo.addClass(destinationId, `monster${notif.args.monster}`);
        }));
        animation.play();

        this.getPlayerTable(notif.args.playerId).setMonster(notif.args.monster);
    }

    notif_points(notif: Notif<NotifPointsArgs>) {
        (this as any).scoreCtrl[notif.args.playerId]?.toValue(notif.args.points);
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
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
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}