import {charts01, charts02, charts03, charts04, charts05} from "./constants";

export const getColorArray = (length) => {
    const oneColor = [charts05]
    const twoColors = [charts05, charts04]
    const threeColors = [charts05, charts04, charts01]
    const fourColors = [charts05, charts04, charts03, charts01]
    const fiveColors = [charts05, charts04, charts03, charts02, charts01]

    switch (length) {
        case 1:
            return oneColor
        case 2:
            return twoColors
        case 3:
            return threeColors
        case 4:
            return fourColors
        case 5:
            return fiveColors
        default:
            return fiveColors
    }
}

export function addAlpha(color, opacity) {
    // coerce values so it is between 0 and 1.
    let _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}