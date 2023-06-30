import {SerializableVec3} from "./serializableVec3";
import {DimensionId} from "bdsx/bds/actor";
import {isClaimsAddonEnabled} from "./claimsInfo/claimsAddonDetector";
import {getClaimAtPoint} from "./claimsInfo/claimsFunctions";
import {ServerPlayer} from "bdsx/bds/player";
import {CommandPermissionLevel} from "bdsx/bds/command";
import {CONFIG} from "./configManager";
import {FormButton, SimpleForm} from "bdsx/bds/form";
import {decay} from "bdsx/decay";
import isDecayed = decay.isDecayed;
import {Vec3} from "bdsx/bds/blockpos";
import {readFileSync, writeFileSync} from "fs";
import {fsutil} from "bdsx/fsutil";
import isFileSync = fsutil.isFileSync;

const HOME_STORAGE_PATH = __dirname + "/../storage.json";

class Home {
    ownerXuid: string;
    name: string;
    point: SerializableVec3;
    dimension: DimensionId;

    constructor(ownerXuid: string, name: string, point: SerializableVec3, dimensionId: DimensionId) {
        this.ownerXuid = ownerXuid;
        this.name = name;
        this.point = point;
        this.dimension = dimensionId;
    }

    static fromData(data: any) {
        const point = new SerializableVec3(data.point);
        return new Home(data.ownerXuid, data.name, point, data.dimension);
    }
}

const HomesStorage: Map<string, Home[]> = new Map();

function saveHomes() {
    let saveData: any = {};
    saveData.playerHomes = {};
    for (let [xuid, homes] of HomesStorage.entries()) {
        let homesData: any = {};
        for (let home of homes) {
            homesData[home.name] = home;
        }

        if (xuid === "SERVER") {
            saveData.serverHomes = homesData;
        } else {
            saveData.playerHomes[xuid] = homesData;
        }
    }

    writeFileSync(HOME_STORAGE_PATH, JSON.stringify(saveData, null, 4));
}

function loadHomes() {
    if (!isFileSync(HOME_STORAGE_PATH)) {
        return;
    }

    const saveData = JSON.parse(readFileSync(HOME_STORAGE_PATH, 'utf-8'));

    if (saveData.serverHomes !== undefined) {
        let homes: Home[] = [];
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

        const homes: Home[] = [];
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
export function tryCreateHome(point: SerializableVec3, dimensionId: DimensionId, name: string, owner?: ServerPlayer): Home | String {
    if (!areHomesAllowedInDimension(dimensionId)) {
        return "Home are not allowed in this dimension!";
    } else if (name.trim() === "") {
        return "The home name cant be blank!";
    }

    let ownerXuid;
    if (owner === undefined) {
        ownerXuid = "SERVER";
    } else if (isClaimsAddonEnabled()) {
        ownerXuid = owner.getXuid();
        let claim = getClaimAtPoint(point, dimensionId);
        if (claim !== undefined) {
            let memberPermissions = claim.members[ownerXuid];
            if (
                claim.owner !== ownerXuid &&
                owner.getCommandPermissionLevel() === CommandPermissionLevel.Normal &&
                memberPermissions === undefined
            ) {
                // Shouldn't be allowed to create home!
                return "You dont have permission to create a home in that claim!";
            }
        }
    } else {
        ownerXuid = owner.getXuid();
    }

    // No reason home cant be created
    let home = new Home(ownerXuid, name, point, dimensionId);

    let playerHomes = HomesStorage.get(ownerXuid);
    if (playerHomes === undefined) {
        playerHomes = [];
    } else {
        for (let home of playerHomes) {
            if (home.name === name) {
                return `You already have a home named ${home.name}!`;
            }
        }
    }

    if (playerHomes.length >= CONFIG.defaultMaxHomes && CONFIG.defaultMaxHomes !== -1) {
        return `You cant have more than ${CONFIG.defaultMaxHomes} homes!`;
    }

    playerHomes.push(home);
    HomesStorage.set(ownerXuid, playerHomes);

    saveHomes();

    return home;
}

function areHomesAllowedInDimension(dimensionId: DimensionId) {
    switch (dimensionId) {
        case DimensionId.Overworld:
            return CONFIG.allowedDimensions.overworld;
        case DimensionId.Nether:
            return CONFIG.allowedDimensions.nether;
        case DimensionId.TheEnd:
            return CONFIG.allowedDimensions.theend;
        default:
            return false;
    }
}

export function getAllAvailableHomesForPlayer(playerXuid: string, currentDimension: DimensionId, includeServer: boolean) {
    let playerHomes = HomesStorage.get(playerXuid);

    if (playerHomes === undefined) {
        playerHomes = []
    } else if (!CONFIG.allowCrossDimensionTeleport) {
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
    } else if (!CONFIG.allowCrossDimensionTeleportForServerClaims) {
        serverHomes = serverHomes.filter((value) => {
            return value.dimension === currentDimension;
        });
    }

    return serverHomes.concat(playerHomes);
}

const PlayerTeleportCooldowns: Map<string, number> = new Map();

export function getRemainingTeleportCooldown(xuid: string) {
    const teleportCooldown = PlayerTeleportCooldowns.get(xuid);
    if (teleportCooldown === undefined) {
        return 0;
    }

    const passedTime = Date.now() - teleportCooldown;
    return Math.max(CONFIG.teleportCooldown - passedTime, 0);
}

export function getAvailableHomesAndButtons(xuid: string, dimensionId: DimensionId, includeServer: boolean) {
    const availableHomes = getAllAvailableHomesForPlayer(xuid, dimensionId, includeServer);
    if (availableHomes.length === 0) {
        return SendHomeFormResult.NoHomes;
    }

    const homeButtons: FormButton[] = [];
    for (let home of availableHomes) {
        homeButtons.push(new FormButton(home.name));
    }

    return {availableHomes, homeButtons};
}

export enum SendHomeFormResult {
    Success,
    OnCooldown,
    NoHomes,
}

export function trySendWarpForm(player: ServerPlayer) {
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

    const form = new SimpleForm('Home Selection', "Select a home to warp to!", homeButtons);

    form.sendTo(player.getNetworkIdentifier(), (res) => {
        if (res.response === null || isDecayed(player)) {
            return;
        }

        const home = availableHomes[res.response];

        player.sendMessage(`§aWarping to §e${home.name}§a!`);

        PlayerTeleportCooldowns.set(playerXuid, Date.now());
        const teleportPos = Vec3.create(
            home.point.x,
            home.point.y - 1.5,
            home.point.z,
        );
        player.teleport(teleportPos, home.dimension);
    })

    return SendHomeFormResult.Success;
}

export enum DeletePlayerHomeResult {
    Success,
    NoHomeWithName,
}

export function deleteServerHome(homeName: string) {
    return deletePlayerHome("SERVER", homeName);
}

export function deletePlayerHome(xuid: string, homeName: string) {
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
    })

    if (!deletedOne) {
        return DeletePlayerHomeResult.NoHomeWithName;
    }

    HomesStorage.set(xuid, newHomes);

    saveHomes();

    return DeletePlayerHomeResult.Success;
}

export function getOwnedHomes(xuid: string) {
    let res = HomesStorage.get(xuid);
    if (res === undefined) {
        res = [];
    }

    return res;
}

export function trySendDeleteForm(player: ServerPlayer) {
    let playerXuid = player.getXuid();

    let availableHomes = getOwnedHomes(playerXuid);

    if (availableHomes.length === 0) {
        return SendHomeFormResult.NoHomes;
    }

    let homeButtons: FormButton[] = [];
    for (const home of availableHomes) {
        homeButtons.push(new FormButton(home.name));
    }

    const form = new SimpleForm('Home Selection', "Select a home to delete!", homeButtons);

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
    })

    return SendHomeFormResult.Success;
}

loadHomes();