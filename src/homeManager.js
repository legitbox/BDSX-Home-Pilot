"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trySendDeleteForm = exports.getOwnedHomes = exports.deletePlayerHome = exports.deleteServerHome = exports.DeletePlayerHomeResult = exports.trySendWarpForm = exports.SendHomeFormResult = exports.getAvailableHomesAndButtons = exports.getRemainingTeleportCooldown = exports.getAllAvailableHomesForPlayer = exports.tryCreateHome = void 0;
const serializableVec3_1 = require("./serializableVec3");
const actor_1 = require("bdsx/bds/actor");
const claimsAddonDetector_1 = require("./claimsInfo/claimsAddonDetector");
const claimsFunctions_1 = require("./claimsInfo/claimsFunctions");
const command_1 = require("bdsx/bds/command");
const configManager_1 = require("./configManager");
const form_1 = require("bdsx/bds/form");
const decay_1 = require("bdsx/decay");
var isDecayed = decay_1.decay.isDecayed;
const blockpos_1 = require("bdsx/bds/blockpos");
const fs_1 = require("fs");
const fsutil_1 = require("bdsx/fsutil");
var isFileSync = fsutil_1.fsutil.isFileSync;
const HOME_STORAGE_PATH = __dirname + "/../storage.json";
class Home {
    constructor(ownerXuid, name, point, dimensionId) {
        this.ownerXuid = ownerXuid;
        this.name = name;
        this.point = point;
        this.dimension = dimensionId;
    }
    static fromData(data) {
        const point = new serializableVec3_1.SerializableVec3(data.point);
        return new Home(data.ownerXuid, data.name, point, data.dimension);
    }
}
const HomesStorage = new Map();
function saveHomes() {
    let saveData = {};
    saveData.playerHomes = {};
    for (let [xuid, homes] of HomesStorage.entries()) {
        let homesData = {};
        for (let home of homes) {
            homesData[home.name] = home;
        }
        if (xuid === "SERVER") {
            saveData.serverHomes = homesData;
        }
        else {
            saveData.playerHomes[xuid] = homesData;
        }
    }
    (0, fs_1.writeFileSync)(HOME_STORAGE_PATH, JSON.stringify(saveData, null, 4));
}
function loadHomes() {
    if (!isFileSync(HOME_STORAGE_PATH)) {
        return;
    }
    const saveData = JSON.parse((0, fs_1.readFileSync)(HOME_STORAGE_PATH, 'utf-8'));
    if (saveData.serverHomes !== undefined) {
        let homes = [];
        const homeKeys = Object.keys(saveData.serverHomes);
        for (const homeName of homeKeys) {
            let homeData = saveData.serverHomes[homeName];
            let home = Home.fromData(homeData);
            homes.push(home);
        }
        HomesStorage.set("SERVER", homes);
    }
    const playerXuids = Object.keys(saveData.playerHomes);
    for (let xuid of playerXuids) {
        const homesData = saveData.playerHomes[xuid];
        const homes = [];
        const homeNames = Object.keys(homesData);
        for (const name of homeNames) {
            const homeData = homesData[name];
            let home = Home.fromData(homeData);
            homes.push(home);
        }
        HomesStorage.set(xuid, homes);
    }
}
// Function for creating home, no ownerXUID makes a Server claims
function tryCreateHome(point, dimensionId, name, owner) {
    if (!areHomesAllowedInDimension(dimensionId)) {
        return "Home are not allowed in this dimension!";
    }
    else if (name.trim() === "") {
        return "The home name cant be blank!";
    }
    let ownerXuid;
    if (owner === undefined) {
        ownerXuid = "SERVER";
    }
    else if ((0, claimsAddonDetector_1.isClaimsAddonEnabled)()) {
        ownerXuid = owner.getXuid();
        let claim = (0, claimsFunctions_1.getClaimAtPoint)(point, dimensionId);
        if (claim !== undefined) {
            let memberPermissions = claim.members[ownerXuid];
            if (claim.owner !== ownerXuid &&
                owner.getCommandPermissionLevel() === command_1.CommandPermissionLevel.Normal &&
                memberPermissions === undefined) {
                // Shouldn't be allowed to create home!
                return "You dont have permission to create a home in that claim!";
            }
        }
    }
    else {
        ownerXuid = owner.getXuid();
    }
    // No reason home cant be created
    let home = new Home(ownerXuid, name, point, dimensionId);
    let playerHomes = HomesStorage.get(ownerXuid);
    if (playerHomes === undefined) {
        playerHomes = [];
    }
    else {
        for (let home of playerHomes) {
            if (home.name === name) {
                return `You already have a home named ${home.name}!`;
            }
        }
    }
    if (playerHomes.length >= configManager_1.CONFIG.defaultMaxHomes && configManager_1.CONFIG.defaultMaxHomes !== -1) {
        return `You cant have more than ${configManager_1.CONFIG.defaultMaxHomes} homes!`;
    }
    playerHomes.push(home);
    HomesStorage.set(ownerXuid, playerHomes);
    saveHomes();
    return home;
}
exports.tryCreateHome = tryCreateHome;
function areHomesAllowedInDimension(dimensionId) {
    switch (dimensionId) {
        case actor_1.DimensionId.Overworld:
            return configManager_1.CONFIG.allowedDimensions.overworld;
        case actor_1.DimensionId.Nether:
            return configManager_1.CONFIG.allowedDimensions.nether;
        case actor_1.DimensionId.TheEnd:
            return configManager_1.CONFIG.allowedDimensions.theend;
        default:
            return false;
    }
}
function getAllAvailableHomesForPlayer(playerXuid, currentDimension, includeServer) {
    let playerHomes = HomesStorage.get(playerXuid);
    if (playerHomes === undefined) {
        playerHomes = [];
    }
    else if (!configManager_1.CONFIG.allowCrossDimensionTeleport) {
        playerHomes = playerHomes.filter((value) => {
            return value.dimension === currentDimension;
        });
    }
    if (!includeServer) {
        return playerHomes;
    }
    let serverHomes = HomesStorage.get("SERVER");
    if (serverHomes === undefined) {
        serverHomes = [];
    }
    else if (!configManager_1.CONFIG.allowCrossDimensionTeleportForServerClaims) {
        serverHomes = serverHomes.filter((value) => {
            return value.dimension === currentDimension;
        });
    }
    return serverHomes.concat(playerHomes);
}
exports.getAllAvailableHomesForPlayer = getAllAvailableHomesForPlayer;
const PlayerTeleportCooldowns = new Map();
function getRemainingTeleportCooldown(xuid) {
    const teleportCooldown = PlayerTeleportCooldowns.get(xuid);
    if (teleportCooldown === undefined) {
        return 0;
    }
    const passedTime = Date.now() - teleportCooldown;
    return Math.max(configManager_1.CONFIG.teleportCooldown - passedTime, 0);
}
exports.getRemainingTeleportCooldown = getRemainingTeleportCooldown;
function getAvailableHomesAndButtons(xuid, dimensionId, includeServer) {
    const availableHomes = getAllAvailableHomesForPlayer(xuid, dimensionId, includeServer);
    if (availableHomes.length === 0) {
        return SendHomeFormResult.NoHomes;
    }
    const homeButtons = [];
    for (let home of availableHomes) {
        homeButtons.push(new form_1.FormButton(home.name));
    }
    return { availableHomes, homeButtons };
}
exports.getAvailableHomesAndButtons = getAvailableHomesAndButtons;
var SendHomeFormResult;
(function (SendHomeFormResult) {
    SendHomeFormResult[SendHomeFormResult["Success"] = 0] = "Success";
    SendHomeFormResult[SendHomeFormResult["OnCooldown"] = 1] = "OnCooldown";
    SendHomeFormResult[SendHomeFormResult["NoHomes"] = 2] = "NoHomes";
})(SendHomeFormResult = exports.SendHomeFormResult || (exports.SendHomeFormResult = {}));
function trySendWarpForm(player) {
    let playerXuid = player.getXuid();
    let remainingTime = getRemainingTeleportCooldown(playerXuid);
    if (remainingTime !== 0) {
        return SendHomeFormResult.OnCooldown;
    }
    const availableInfo = getAvailableHomesAndButtons(playerXuid, player.getDimensionId(), true);
    if (availableInfo === SendHomeFormResult.NoHomes) {
        return SendHomeFormResult.NoHomes;
    }
    let availableHomes = availableInfo.availableHomes;
    let homeButtons = availableInfo.homeButtons;
    const form = new form_1.SimpleForm('Home Selection', "Select a home to warp to!", homeButtons);
    form.sendTo(player.getNetworkIdentifier(), (res) => {
        if (res.response === null || isDecayed(player)) {
            return;
        }
        const home = availableHomes[res.response];
        player.sendMessage(`§aWarping to §e${home.name}§a!`);
        PlayerTeleportCooldowns.set(playerXuid, Date.now());
        const teleportPos = blockpos_1.Vec3.create(home.point.x, home.point.y - 1.5, home.point.z);
        player.teleport(teleportPos, home.dimension);
    });
    return SendHomeFormResult.Success;
}
exports.trySendWarpForm = trySendWarpForm;
var DeletePlayerHomeResult;
(function (DeletePlayerHomeResult) {
    DeletePlayerHomeResult[DeletePlayerHomeResult["Success"] = 0] = "Success";
    DeletePlayerHomeResult[DeletePlayerHomeResult["NoHomeWithName"] = 1] = "NoHomeWithName";
})(DeletePlayerHomeResult = exports.DeletePlayerHomeResult || (exports.DeletePlayerHomeResult = {}));
function deleteServerHome(homeName) {
    return deletePlayerHome("SERVER", homeName);
}
exports.deleteServerHome = deleteServerHome;
function deletePlayerHome(xuid, homeName) {
    const homes = HomesStorage.get(xuid);
    if (homes === undefined) {
        return DeletePlayerHomeResult.NoHomeWithName;
    }
    let deletedOne = false;
    const newHomes = homes.filter((value) => {
        let willStay = value.name !== homeName;
        if (!willStay) {
            deletedOne = true;
        }
        return willStay;
    });
    if (!deletedOne) {
        return DeletePlayerHomeResult.NoHomeWithName;
    }
    HomesStorage.set(xuid, newHomes);
    saveHomes();
    return DeletePlayerHomeResult.Success;
}
exports.deletePlayerHome = deletePlayerHome;
function getOwnedHomes(xuid) {
    let res = HomesStorage.get(xuid);
    if (res === undefined) {
        res = [];
    }
    return res;
}
exports.getOwnedHomes = getOwnedHomes;
function trySendDeleteForm(player) {
    let playerXuid = player.getXuid();
    let availableHomes = getOwnedHomes(playerXuid);
    if (availableHomes.length === 0) {
        return SendHomeFormResult.NoHomes;
    }
    let homeButtons = [];
    for (const home of availableHomes) {
        homeButtons.push(new form_1.FormButton(home.name));
    }
    const form = new form_1.SimpleForm('Home Selection', "Select a home to delete!", homeButtons);
    form.sendTo(player.getNetworkIdentifier(), (data) => {
        if (data.response === null || isDecayed(player)) {
            return;
        }
        const home = availableHomes[data.response];
        const deleteResult = deletePlayerHome(playerXuid, home.name);
        switch (deleteResult) {
            case DeletePlayerHomeResult.Success:
                player.sendMessage("§aHome deleted!");
                break;
            case DeletePlayerHomeResult.NoHomeWithName:
                player.sendMessage("§aYou dont have a home with that name!");
                break;
        }
    });
    return SendHomeFormResult.Success;
}
exports.trySendDeleteForm = trySendDeleteForm;
loadHomes();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJob21lTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5REFBb0Q7QUFDcEQsMENBQTJDO0FBQzNDLDBFQUFzRTtBQUN0RSxrRUFBNkQ7QUFFN0QsOENBQXdEO0FBQ3hELG1EQUF1QztBQUN2Qyx3Q0FBcUQ7QUFDckQsc0NBQWlDO0FBQ2pDLElBQU8sU0FBUyxHQUFHLGFBQUssQ0FBQyxTQUFTLENBQUM7QUFDbkMsZ0RBQXVDO0FBQ3ZDLDJCQUErQztBQUMvQyx3Q0FBbUM7QUFDbkMsSUFBTyxVQUFVLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQztBQUV0QyxNQUFNLGlCQUFpQixHQUFHLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUV6RCxNQUFNLElBQUk7SUFNTixZQUFZLFNBQWlCLEVBQUUsSUFBWSxFQUFFLEtBQXVCLEVBQUUsV0FBd0I7UUFDMUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7SUFDakMsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBUztRQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7Q0FDSjtBQUVELE1BQU0sWUFBWSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRXBELFNBQVMsU0FBUztJQUNkLElBQUksUUFBUSxHQUFRLEVBQUUsQ0FBQztJQUN2QixR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