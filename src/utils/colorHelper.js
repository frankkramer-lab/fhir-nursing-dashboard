import {charts01, charts02, charts03, charts04, charts05} from "./constants";

export const getColorArray=(length)=>{
    const  oneColor=[charts05]
    const  twoColors=[charts01, charts05]
    const threeColors=[charts01, charts03, charts05]
    const fourColors=[charts01, charts02, charts03, charts05]
    const fiveColors=[charts01, charts02, charts03, charts04, charts05]


    let colorArray=[]
    switch (length) {
        case 1:
            colorArray=oneColor
            break;
        case 2:
            colorArray=twoColors
            break;
        case 3:
            colorArray=threeColors
            break;
        case 4:
            colorArray=fourColors
            break;
        case 5:
            colorArray=fiveColors
            break;
        default:
            colorArray=fiveColors
            break;
    }
    return colorArray;
}