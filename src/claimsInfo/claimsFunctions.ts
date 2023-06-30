import {isClaimsAddonEnabled} from "./claimsAddonDetector";
import {SerializableVec3} from "../serializableVec3";
import {DimensionId} from "bdsx/bds/actor";

let CACHED_CLAIMS_CTX: any = undefined;

function trySetClaimsCtxCache(): boolean {
    if (!isClaimsAddonEnabled()) {
        return false;
    }

    if (CACHED_CLAIMS_CTX === undefined) {
        CACHED_CLAIMS_CTX = require('@bdsx/claim-pilot/src/claims/claim');
    }

    return true;
}

export function getClaimAtPoint(point: SerializableVec3, dimensionId: DimensionId) {
    if (!trySetClaimsCtxCache()) {
        throw "ERROR: Claims addon not enabled and trying to get a value!";
    }

    return CACHED_CLAIMS_CTX.getClaimAtPos(point, dimensionId);
}