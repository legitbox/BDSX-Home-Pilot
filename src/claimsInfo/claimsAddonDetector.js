"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClaimsAddonEnabled = void 0;
const fs_1 = require("fs");
let bdsxPackageInfoStr = (0, fs_1.readFileSync)('../package.json', 'utf-8');
let bdsxPackageInfo = JSON.parse(bdsxPackageInfoStr);
let isInstalled = false;
let dependencies = Object.keys(bdsxPackageInfo.dependencies);
if (dependencies.includes("@bdsx/claim-pilot")) {
    isInstalled = true;
}
function isClaimsAddonEnabled() {
    return isInstalled;
}
exports.isClaimsAddonEnabled = isClaimsAddonEnabled;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhaW1zQWRkb25EZXRlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNsYWltc0FkZG9uRGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQWdDO0FBRWhDLElBQUksa0JBQWtCLEdBQUcsSUFBQSxpQkFBWSxFQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2xFLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUVyRCxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDeEIsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0QsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEVBQUU7SUFDNUMsV0FBVyxHQUFHLElBQUksQ0FBQztDQUN0QjtBQUVELFNBQWdCLG9CQUFvQjtJQUNoQyxPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBRkQsb0RBRUMifQ==