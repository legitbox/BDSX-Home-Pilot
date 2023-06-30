"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaimAtPoint = void 0;
const claimsAddonDetector_1 = require("./claimsAddonDetector");
let CACHED_CLAIMS_CTX = undefined;
function trySetClaimsCtxCache() {
    if (!(0, claimsAddonDetector_1.isClaimsAddonEnabled)()) {
        return false;
    }
    if (CACHED_CLAIMS_CTX === undefined) {
        CACHED_CLAIMS_CTX = require('@bdsx/claim-pilot/src/claims/claim');
    }
    return true;
}
function getClaimAtPoint(point, dimensionId) {
    if (!trySetClaimsCtxCache()) {
        throw "ERROR: Claims addon not enabled and trying to get a value!";
    }
    return CACHED_CLAIMS_CTX.getClaimAtPos(point, dimensionId);
}
exports.getClaimAtPoint = getClaimAtPoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhaW1zRnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xhaW1zRnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUEyRDtBQUkzRCxJQUFJLGlCQUFpQixHQUFRLFNBQVMsQ0FBQztBQUV2QyxTQUFTLG9CQUFvQjtJQUN6QixJQUFJLENBQUMsSUFBQSwwQ0FBb0IsR0FBRSxFQUFFO1FBQ3pCLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7UUFDakMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7S0FDckU7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLEtBQXVCLEVBQUUsV0FBd0I7SUFDN0UsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7UUFDekIsTUFBTSw0REFBNEQsQ0FBQztLQUN0RTtJQUVELE9BQU8saUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBTkQsMENBTUMifQ==