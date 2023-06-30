import {readFileSync, writeFileSync} from "fs";
import {fsutil} from "bdsx/fsutil";
import isFileSync = fsutil.isFileSync;
import {ServerPlayer} from "bdsx/bds/player";
import {CustomForm, FormInput, FormLabel, FormToggle} from "bdsx/bds/form";
import {decay} from "bdsx/decay";
import isDecayed = decay.isDecayed;

const CONFIG_PATH = __dirname + '/../config.json';

export let CONFIG = loadConfigFromFile();

interface CONFIG {
    defaultMaxHomes: number,
    allowedDimensions: {
        "overworld": boolean,
        "nether": boolean,
        "theend": boolean,
    },
    teleportCooldown: number,
    allowCrossDimensionTeleport: boolean,
    allowCrossDimensionTeleportForServerClaims: boolean,
}

function createDefaultConfig(): CONFIG {
    return {
        defaultMaxHomes: 1,
        allowedDimensions: {
            "overworld": true,
            "nether": true,
            "theend": true,
        },
        teleportCooldown: 30000,
        allowCrossDimensionTeleport: true,
        allowCrossDimensionTeleportForServerClaims: true,
    }
}

function loadConfigFromFile(): CONFIG {
    let retConfig: CONFIG;
    let shouldRegenerateConfig = false;
    if (!isFileSync(CONFIG_PATH)) {
        shouldRegenerateConfig = true;
    } else {
        try {
            let configStr = readFileSync(CONFIG_PATH, 'utf-8');
            retConfig = JSON.parse(configStr);
        } catch {
            shouldRegenerateConfig = true;
        }

    }

    if (shouldRegenerateConfig) {
        retConfig = createDefaultConfig();
        writeFileSync(CONFIG_PATH, JSON.stringify(retConfig, null, 4));
    }

    return retConfig!;
}

export function sendConfigEditForm(player: ServerPlayer) {
    const form = new CustomForm("Config Editor", [
        new FormInput("Default Max Homes", CONFIG.defaultMaxHomes.toString(), CONFIG.defaultMaxHomes.toString()), // 0
        new FormInput("Teleport Cooldown", CONFIG.teleportCooldown.toString(), CONFIG.teleportCooldown.toString()), // 1
        new FormLabel("Allow homes in the Overworld:"),
        new FormToggle("", CONFIG.allowedDimensions.overworld), // 3
        new FormLabel("Allow homes in the Nether:"),
        new FormToggle("", CONFIG.allowedDimensions.nether), // 5
        new FormLabel("Allow homes in the End:"),
        new FormToggle("", CONFIG.allowedDimensions.theend), // 7
        new FormLabel("Cross-dimensional home warping:"),
        new FormToggle("", CONFIG.allowCrossDimensionTeleport), // 9
        new FormLabel("Cross-dimension server home warping:"),
        new FormToggle("", CONFIG.allowCrossDimensionTeleportForServerClaims), //11
    ])

    form.sendTo(player.getNetworkIdentifier(), (data) => {
        if (data.response === null || isDecayed(player)) {
            return;
        }

        const defaultMaxHomesStr = data.response[0];
        let defaultMaxHomes = parseInt(defaultMaxHomesStr);
        if (isNaN(defaultMaxHomes)) {
            defaultMaxHomes = CONFIG.defaultMaxHomes;
        }

        const teleportCooldownStr = data.response[1];
        let teleportCooldown = parseInt(teleportCooldownStr);
        if (isNaN(teleportCooldown)) {
            teleportCooldown = CONFIG.teleportCooldown;
        }

        const allowHomesInOverworld = data.response[3];
        const allowHomesInNether = data.response[5];
        const allowHomesInTheEnd = data.response[7];

        const allowCrossDimensionTeleport = data.response[9];
        const allowCrossDimensionServerTeleport = data.response[11];

        CONFIG.defaultMaxHomes = defaultMaxHomes;
        CONFIG.teleportCooldown = teleportCooldown;

        CONFIG.allowedDimensions.overworld = allowHomesInOverworld;
        CONFIG.allowedDimensions.nether = allowHomesInNether;
        CONFIG.allowedDimensions.theend = allowHomesInTheEnd;

        CONFIG.allowCrossDimensionTeleport = allowCrossDimensionTeleport;
        CONFIG.allowCrossDimensionTeleportForServerClaims = allowCrossDimensionServerTeleport;

        writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 4));

        player.sendMessage("§aUpdated config!");
    })
}