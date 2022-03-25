class TableCenter {
    public pileCounters: Counter[] = [];

    constructor(private game: PointSaladGame, gamedatas: PointSaladGamedatas) {
        for (let pile = 1; pile <= 3; pile++) {
            if (gamedatas.pileTopCard[pile]) {
                this.game.createOrMoveCard(gamedatas.pileTopCard[pile], `pile${pile}`, true);
            }
            
            gamedatas.market[pile].filter(card => !!card).forEach(card => this.game.createOrMoveCard(card, `market-row${card.locationArg}-card${pile}`));

            const pileCounter = new ebg.counter();
            pileCounter.create(`pile${pile}-counter`);
            pileCounter.setValue(gamedatas.pileCount[pile]);
            this.pileCounters[pile] = pileCounter;
        }
    }
}