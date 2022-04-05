class TableCenter {
    public pileCounters: Counter[] = [];

    constructor(private game: PointSaladGame, gamedatas: PointSaladGamedatas) {
        for (let pile = 1; pile <= 3; pile++) {
            const pileTop = gamedatas.pileTopCard[pile];
            if (pileTop) {
                this.game.createOrMoveCard(pileTop, `pile${pile}`, this.game.getMarketCardTooltip(pileTop), true);
            }
            
            gamedatas.market[pile].filter(card => !!card).forEach(card => this.game.createOrMoveCard(card, `market-row${card.locationArg}-card${pile}`, this.game.getMarketCardTooltip(card)));

            const pileCounter = new ebg.counter();
            pileCounter.create(`pile${pile}-counter`);
            pileCounter.setValue(gamedatas.pileCount[pile]);
            this.pileCounters[pile] = pileCounter;
        }
    }
    
    public setPileCounts(pileCounts: number[]) {
        for (let pile = 1; pile <= 3; pile++) {
            this.pileCounters[pile].setValue(pileCounts[pile]);
        }
    }
}