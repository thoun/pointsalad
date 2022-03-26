function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[veggie(\d)\]/ig, (_, veggie) => `<div class="icon" data-veggie="${veggie}"></div>`)
        .replace(/\[(\-?\d+)\]/ig, (_, points) => `<div class="icon points">${points}</div>`)
}