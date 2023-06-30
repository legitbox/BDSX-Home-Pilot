import {readFileSync} from "fs";

let bdsxPackageInfoStr = readFileSync('../package.json', 'utf-8');
let bdsxPackageInfo = JSON.parse(bdsxPackageInfoStr);

let isInstalled = false;
let dependencies = Object.keys(bdsxPackageInfo.dependencies);
if (dependencies.includes("@bdsx/claim-pilot")) {
    isInstalled = true;
}

export function isClaimsAddonEnabled() {
    return isInstalled;
}


