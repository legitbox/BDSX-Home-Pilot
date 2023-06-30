"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfigEditForm = exports.CONFIG = void 0;
const fs_1 = require("fs");
const fsutil_1 = require("bdsx/fsutil");
var isFileSync = fsutil_1.fsutil.isFileSync;
const form_1 = require("bdsx/bds/form");
const decay_1 = require("bdsx/decay");
var isDecayed = decay_1.decay.isDecayed;
const CONFIG_PATH = __dirname + '/../config.json';
exports.CONFIG = loadConfigFromFile();
function createDefaultConfig() {
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
    };
}
function loadConfigFromFile() {
    let retConfig;
    let shouldRegenerateConfig = false;
    if (!isFileSync(CONFIG_PATH)) {
        shouldRegenerateConfig = true;
    }
    else {
        try {
            let configStr = (0, fs_1.readFileSync)(CONFIG_PATH, 'utf-8');
            retConfig = JSON.parse(configStr);
        }
        catch (_a) {
            shouldRegenerateConfig = true;
        }
    }
    if (shouldRegenerateConfig) {
        retConfig = createDefaultConfig();
        (0, fs_1.writeFileSync)(CONFIG_PATH, JSON.stringify(retConfig, null, 4));
    }
    return retConfig;
}
function sendConfigEditForm(player) {
    const form = new form_1.CustomForm("Config Editor", [
        new form_1.FormInput("Default Max Homes", exports.CONFIG.defaultMaxHomes.toString(), exports.CONFIG.defaultMaxHomes.toString()),
        new form_1.FormInput("Teleport Cooldown", exports.CONFIG.teleportCooldown.toString(), exports.CONFIG.teleportCooldown.toString()),
        new form_1.FormLabel("Allow homes in the Overworld:"),
        new form_1.FormToggle("", exports.CONFIG.allowedDimensions.overworld),
        new form_1.FormLabel("Allow homes in the Nether:"),
        new form_1.FormToggle("", exports.CONFIG.allowedDimensions.nether),
        new form_1.FormLabel("Allow homes in the End:"),
        new form_1.FormToggle("", exports.CONFIG.allowedDimensions.theend),
        new form_1.FormLabel("Cross-dimensional home warping:"),
        new form_1.FormToggle("", exports.CONFIG.allowCrossDimensionTeleport),
        new form_1.FormLabel("Cross-dimension server home warping:"),
        new form_1.FormToggle("", exports.CONFIG.allowCrossDimensionTeleportForServerClaims), //11
    ]);
    form.sendTo(player.getNetworkIdentifier(), (data) => {
        if (data.response === null || isDecayed(player)) {
            return;
        }
        const defaultMaxHomesStr = data.response[0];
        let defaultMaxHomes = parseInt(defaultMaxHomesStr);
        if (isNaN(defaultMaxHomes)) {
            defaultMaxHomes = exports.CONFIG.defaultMaxHomes;
        }
        const teleportCooldownStr = data.response[1];
        let teleportCooldown = parseInt(teleportCooldownStr);
        if (isNaN(teleportCooldown)) {
            teleportCooldown = exports.CONFIG.teleportCooldown;
        }
        const allowHomesInOverworld = data.response[3];
        const allowHomesInNether = data.response[5];
        const allowHomesInTheEnd = data.response[7];
        const allowCrossDimensionTeleport = data.response[9];
        const allowCrossDimensionServerTeleport = data.response[11];
        exports.CONFIG.defaultMaxHomes = defaultMaxHomes;
        exports.CONFIG.teleportCooldown = teleportCooldown;
        exports.CONFIG.allowedDimensions.overworld = allowHomesInOverworld;
        exports.CONFIG.allowedDimensions.nether = allowHomesInNether;
        exports.CONFIG.allowedDimensions.theend = allowHomesInTheEnd;
        exports.CONFIG.allowCrossDimensionTeleport = allowCrossDimensionTeleport;
        exports.CONFIG.allowCrossDimensionTeleportForServerClaims = allowCrossDimensionServerTeleport;
        (0, fs_1.writeFileSync)(CONFIG_PATH, JSON.stringify(exports.CONFIG, null, 4));
        player.sendMessage("§aUpdated config!");
    });
}
exports.sendConfigEditForm = sendConfigEditForm;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbmZpZ01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQStDO0FBQy9DLHdDQUFtQztBQUNuQyxJQUFPLFVBQVUsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDO0FBRXRDLHdDQUEyRTtBQUMzRSxzQ0FBaUM7QUFDakMsSUFBTyxTQUFTLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQztBQUVuQyxNQUFNLFdBQVcsR0FBRyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7QUFFdkMsUUFBQSxNQUFNLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztBQWN6QyxTQUFTLG1CQUFtQjtJQUN4QixPQUFPO1FBQ0gsZUFBZSxFQUFFLENBQUM7UUFDbEIsaUJBQWlCLEVBQUU7WUFDZixXQUFXLEVBQUUsSUFBSTtZQUNqQixRQUFRLEVBQUUsSUFBSTtZQUNkLFFBQVEsRUFBRSxJQUFJO1NBQ2pCO1FBQ0QsZ0JBQWdCLEVBQUUsS0FBSztRQUN2QiwyQkFBMkIsRUFBRSxJQUFJO1FBQ2pDLDBDQUEwQyxFQUFFLElBQUk7S0FDbkQsQ0FBQTtBQUNMLENBQUM7QUFFRCxTQUFTLGtCQUFrQjtJQUN2QixJQUFJLFNBQWlCLENBQUM7SUFDdEIsSUFBSSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7SUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUMxQixzQkFBc0IsR0FBRyxJQUFJLENBQUM7S0FDakM7U0FBTTtRQUNILElBQUk7WUFDQSxJQUFJLFNBQVMsR0FBRyxJQUFBLGlCQUFZLEVBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3JDO1FBQUMsV0FBTTtZQUNKLHNCQUFzQixHQUFHLElBQUksQ0FBQztTQUNqQztLQUVKO0lBRUQsSUFBSSxzQkFBc0IsRUFBRTtR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