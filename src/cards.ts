const CABBAGE = 1;
const CARROT = 2;
const LETTUCE = 3;
const ONION = 4;
const PEPPER = 5;
const TOMATO = 6;

function evenOdd(veggie: number): string {
    return formatTextIcons(`
        <div class="flex">[veggie${veggie}]</div>
        <div class="flex">
            <span class="flex wrap">${_('Even total')}</span>
            <span> = </span>
            <span>[7]</span>
        </div>
        <div class="flex">
            <span class="flex wrap">${_('Odd total')}</span>
            <span> = </span>
            <span>[3]</span>
        </div>
    `);
}

function mostLeast(word: string, veggie: number): string {
    return formatTextIcons(`
        <div class="flex">
            <span class="flex wrap">${word} [veggie${veggie}]</span>
            <span> = </span>
            <span>[10]</span>
        </div>
    `);
}
function most(veggie: number): string {
    return mostLeast(_('Most'), veggie);
}
function least(veggie: number): string {
    return mostLeast(_('Least'), veggie);
}

function sets(sets: number[][]) {
    return formatTextIcons(`
        <div>
        ${sets.map(set => `<div>[${set[0]}] / [veggie${set[1]}]</div>`).join('')}
        </div>
    `);
}

function pairSet(veggies: number[]) {
    return formatTextIcons(`
    <div class="multiple-set">
        ${veggies.map((veggie, index) => `<span data-index="${index}">[veggie${veggie}]</span>`).join('<span class="plus">+</span>')}
         = [5]</div>
    `);
}

function tripletSet(veggies: number[]) {
    return formatTextIcons(`
    <div class="multiple-set">
        ${veggies.map((veggie, index) => `<span data-index="${index}">[veggie${veggie}]</span>`).join('<span class="plus">+</span>')}
    </div>
    <div class="flex"> = [8]</div>
    `);
}

const CARDS_EFFECTS = [];
    
CARDS_EFFECTS[CABBAGE] = [
    null,
    // special
    () => formatTextIcons(`
        <div class="flex">
            <span>[5]</span>
            <span>/</span>
            <span>${_('Missing veggie type')}</span>
        </div>
    `),
    // odd/even
    () => evenOdd(CARROT),
    // most
    () => most(CARROT),
    // least
    () => least(CARROT),
    // 2/V
    () => sets([[2, CARROT]]),
    // 1/V 1/V (x1)
    () => sets([[1, CARROT], [1, PEPPER]]),
    () => sets([[1, CARROT], [1, LETTUCE]]),
    // 3/V -2/V
    () => sets([[3, CARROT], [-2, ONION]]),
    // 2/V 1/V -2/V
    () => sets([[2, CARROT], [1, PEPPER], [-2, ONION]]),
    // 2/V 2/V -4/V
    () => sets([[2, CARROT], [2, ONION], [-4, PEPPER]]),
    // 3/V -1/V -1/V
    () => sets([[3, CARROT], [-1, PEPPER], [-1, CABBAGE]]),
    // 4/V -2/V -2/V
    () => sets([[4, CARROT], [-2, LETTUCE], [-2, TOMATO]]),
    // V+V = 5 (x3)
    () => pairSet([CARROT, CARROT]),
    () => pairSet([LETTUCE, ONION]),
    () => pairSet([TOMATO, PEPPER]),
    // V+V+V = 8 (x3)
    () => tripletSet([CARROT, CARROT, CARROT]),
    () => tripletSet([CABBAGE, CARROT, TOMATO]),
    () => tripletSet([LETTUCE, CARROT, ONION]),
]
    
CARDS_EFFECTS[CARROT] = [
    null,
    // special
    () => formatTextIcons(`<div class="flex">[5]<span>/</span><span>${_('Veggie type with at least 3')}</span></div>`), // TODO merge with similar label?
    // odd/even
    () => evenOdd(CABBAGE),
    // most
    () => most(CABBAGE),
    // least
    () => least(CABBAGE),
    // 2/V
    () => sets([[2, CABBAGE]]),
    // 1/V 1/V (x2)
    () => sets([[1, CABBAGE], [1, LETTUCE]]),
    () => sets([[1, CABBAGE], [1, PEPPER]]),
    // 3/V -2/V
    () => sets([[3, CABBAGE], [-2, TOMATO]]),
    // 2/V 1/V -2/V
    () => sets([[2, CABBAGE], [1, LETTUCE], [-2, CARROT]]),
    // 2/V 2/V -4/V
    () => sets([[2, CABBAGE], [2, TOMATO], [-4, LETTUCE]]),
    // 3/V -1/V -1/V
    () => sets([[3, CABBAGE], [-1, LETTUCE], [-1, CARROT]]),
    // 4/V -2/V -2/V
    () => sets([[4, CABBAGE], [-2, PEPPER], [-2, ONION]]),
    // V+V = 5 (x3)
    () => pairSet([CABBAGE, CABBAGE]),
    () => pairSet([TOMATO, LETTUCE]),
    () => pairSet([ONION, PEPPER]),
    // V+V+V = 8 (x3)
    () => tripletSet([CABBAGE, CABBAGE, CABBAGE]),
    () => tripletSet([PEPPER, CABBAGE, TOMATO]),
    () => tripletSet([CARROT, CABBAGE, ONION]),
];
    
CARDS_EFFECTS[LETTUCE] = [
    null,
    // special
    () => formatTextIcons(`<div class="flex"><span>${_('Lowest veggie total')}</span> = [7]</div>`), // TODO check text
    // odd/even
    () => evenOdd(PEPPER),
    // most
    () => most(PEPPER),
    // least
    () => least(PEPPER),
    // 2/V
    () => sets([[2, PEPPER]]),
    // 1/V 1/V (x2)
    () => sets([[1, PEPPER], [1, ONION]]),
    () => sets([[1, PEPPER], [1, TOMATO]]),
    // 3/V -2/V
    () => sets([[3, PEPPER], [-2, CABBAGE]]),
    // 2/V 1/V -2/V
    () => sets([[2, PEPPER], [1, TOMATO], [-2, LETTUCE]]),
    // 2/V 2/V -4/V
    () => sets([[2, PEPPER], [2, CABBAGE], [-4, TOMATO]]),
    // 3/V -1/V -1/V
    () => sets([[3, PEPPER], [-1, TOMATO], [-1, LETTUCE]]),
    // 4/V -2/V -2/V
    () => sets([[4, PEPPER], [-2, ONION], [-2, CARROT]]),
    // V+V = 5 (x3)
    () => pairSet([PEPPER, PEPPER]),
    () => pairSet([CARROT, TOMATO]),
    () => pairSet([CABBAGE, ONION]),
    // V+V+V = 8 (x3)
    () => tripletSet([PEPPER, PEPPER, PEPPER]),
    () => tripletSet([LETTUCE, PEPPER, CARROT]),
    () => tripletSet([ONION, PEPPER, CABBAGE]),
];
    
CARDS_EFFECTS[ONION] = [
    null,
    // special
    () => formatTextIcons(`<div class="flex">[5]<span>/</span><span>${_('Veggie type with at least 2')}</span></div>`), // TODO merge with similar label?
    // odd/even
    () => evenOdd(TOMATO),
    // most
    () => most(TOMATO),
    // least
    () => least(TOMATO),
    // 2/V
    () => sets([[2, TOMATO]]),
    // 1/V 1/V (x2)
    () => sets([[1, TOMATO], [1, CARROT]]),
    () => sets([[1, TOMATO], [1, CABBAGE]]),
    // 3/V -2/V
    () => sets([[3, TOMATO], [-2, LETTUCE]]),
    // 2/V 1/V -2/V
    () => sets([[2, TOMATO], [1, CARROT], [-2, ONION]]),
    // 2/V 2/V -4/V
    () => sets([[2, TOMATO], [2, LETTUCE], [-4, CARROT]]),
    // 3/V -1/V -1/V
    () => sets([[3, TOMATO], [-1, CARROT], [-1, ONION]]),
    // 4/V -2/V -2/V
    () => sets([[4, TOMATO], [-2, CABBAGE], [-2, PEPPER]]),
    // V+V = 5 (x3)
    () => pairSet([TOMATO, TOMATO]),
    () => pairSet([CARROT, PEPPER]),
    () => pairSet([CABBAGE, LETTUCE]),
    // V+V+V = 8 (x3)
    () => tripletSet([TOMATO, TOMATO, TOMATO]),
    () => tripletSet([CABBAGE, TOMATO, LETTUCE]),
    () => tripletSet([ONION, TOMATO, PEPPER]),
];
    
CARDS_EFFECTS[PEPPER] = [
    null,
    // special
    () => formatTextIcons(`<div class="flex"><span>${_('Highest veggie total')}</span> = [7]</div>`), // TODO check text
    // odd/even
    () => evenOdd(LETTUCE),
    // most
    () => most(LETTUCE),
    // least
    () => least(LETTUCE),
    // 2/V
    () => sets([[2, LETTUCE]]),
    // 1/V 1/V (x2)
    () => sets([[1, LETTUCE], [1, TOMATO]]),
    () => sets([[1, LETTUCE], [1, ONION]]),
    // 3/V -2/V
    () => sets([[3, LETTUCE], [-2, CARROT]]),
    // 2/V 1/V -2/V
    () => sets([[2, LETTUCE], [1, ONION], [-2, PEPPER]]),
    // 2/V 2/V -4/V
    () => sets([[2, LETTUCE], [2, CARROT], [-4, ONION]]),
    // 3/V -1/V -1/V
    () => sets([[3, LETTUCE], [-1, ONION], [-1, PEPPER]]),
    // 4/V -2/V -2/V
    () => sets([[4, LETTUCE], [-2, TOMATO], [-2, CABBAGE]]),
    // V+V = 5 (x3)
    () => pairSet([LETTUCE, LETTUCE]),
    () => pairSet([CARROT, ONION]),
    () => pairSet([CABBAGE, TOMATO]),
    // V+V+V = 8 (x3)
    () => tripletSet([LETTUCE, LETTUCE, LETTUCE]),
    () => tripletSet([PEPPER, LETTUCE, CABBAGE]),
    () => tripletSet([TOMATO, LETTUCE, CARROT]),
];
    
CARDS_EFFECTS[TOMATO] = [
    null,
    // special
    () => formatTextIcons(`
    <div class="flex complete-set top">[veggie6][veggie3][veggie2]</div>
    <div class="flex"><span>[12]</span><span>/</span><span>${_('Complete set')}</span></div>
    <div class="flex complete-set bottom">[veggie1][veggie5][veggie4]</div>
    `),
    // odd/even
    () => evenOdd(ONION),
    // most
    () => most(ONION),
    // least
    () => least(ONION),
    // 2/V
    () => sets([[2, ONION]]),
    // 1/V 1/V (x2)
    () => sets([[1, ONION], [1, CARROT]]),
    () => sets([[1, ONION], [1, CABBAGE]]),
    // 3/V -2/V
    () => sets([[3, ONION], [-2, PEPPER]]),
    // 2/V 1/V -2/V
    () => sets([[2, ONION], [1, CABBAGE], [-2, TOMATO]]),
    // 2/V 2/V -4/V
    () => sets([[2, ONION], [2, PEPPER], [-4, CABBAGE]]),
    // 3/V -1/V -1/V
    () => sets([[3, ONION], [-1, CABBAGE], [-1, TOMATO]]),
    // 4/V -2/V -2/V
    () => sets([[4, ONION], [-2, CARROT], [-2, LETTUCE]]),
    // V+V = 5 (x3)
    () => pairSet([ONION, ONION]),
    () => pairSet([CABBAGE, PEPPER]),
    () => pairSet([CARROT, LETTUCE]),
    // V+V+V = 8 (x3)
    () => tripletSet([ONION, ONION, ONION]),
    () => tripletSet([CARROT, ONION, PEPPER]),
    () => tripletSet([TOMATO, ONION, LETTUCE]),
];
