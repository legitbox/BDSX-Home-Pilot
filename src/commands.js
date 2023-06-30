"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("bdsx/event");
const command_1 = require("bdsx/command");
const nativetype_1 = require("bdsx/nativetype");
const homeManager_1 = require("./homeManager");
const serializableVec3_1 = require("./serializableVec3");
const command_2 = require("bdsx/bds/command");
const form_1 = require("bdsx/bds/form");
const decay_1 = require("bdsx/decay");
var isDecayed = decay_1.decay.isDecayed;
const configManager_1 = require("./configManager");
event_1.events.serverOpen.on(() => {
    command_1.command
        .register("home", "Command for managing your homes!")
        .overload((params, origin, output) => {
        const player = origin.getEntity();
        if (player === null || !player.isPlayer()) {
            output.error("Command needs to be ran by a player!");
            return;
        }
        const home = (0, homeManager_1.tryCreateHome)(new serializableVec3_1.SerializableVec3(player.getPosition()), player.getDimensionId(), params.name, player);
        if (typeof home === "string") {
            output.error(home);
            return;
        }
        output.success("§aHome created!");
    }, {
        options: command_1.command.enum("options.create", "create"),
        name: nativetype_1.CxxString,
    })
        .overload((_p, origin, output) => {
        const player = origin.getEntity();
        if (player === null || !player.isPlayer()) {
            output.error("Command needs to be ran by a player!");
            return;
        }
        const res = (0, homeManager_1.trySendWarpForm)(player);
        if (res !== homeManager_1.SendHomeFormResult.Success) {
            switch (res) {
                case homeManager_1.SendHomeFormResult.NoHomes:
                    output.error("You dont have any homes to warp to in this dimension!");
                    return;
                case homeManager_1.SendHomeFormResult.OnCooldown:
                    let remainingTime = (0, homeManager_1.getRemainingTeleportCooldown)(player.getXuid());
                    let formattedRemainingTime = createFormattedTimeString(remainingTime);
                    output.error(`You still have to wait ${formattedRemainingTime} before you can teleport!`);
            }
        }
    }, {
        options: command_1.command.enum("options.warp", "warp"),
    })
        .overload((_p, origin, output) => {
        const player = origin.getEntity();
        if (player === null || !player.isPlayer()) {
            output.error("Command needs to be ran by a player!");
            return;
        }
        const formSendResult = (0, homeManager_1.trySendDeleteForm)(player);
        if (formSendResult !== homeManager_1.SendHomeFormResult.Success) {
            output.error("You have no homes to delete!");
        }
    }, {
        options: command_1.command.enum("options.delete", "delete"),
    });
    command_1.command
        .register("shome", "Command for managing server homes!", command_2.CommandPermissionLevel.Operator)
        .overload((_p, origin, output) => {
        const player = origin.getEntity();
        if (player === null || !player.isPlayer()) {
            output.error("Command needs to be ran by a player!");
            return;
        }
        // Generating form
        const serverHomes = (0, homeManager_1.getOwnedHomes)("SERVER");
        if (serverHomes.length === 0) {
            output.error("There are no server homes!");
            return;
        }
        const buttons = [];
        for (const home of serverHomes) {
            buttons.push(new form_1.FormButton(home.name));
        }
        const form = new form_1.SimpleForm("Server Home List", "Select a server home to delete!", buttons);
        form.sendTo(player.getNetworkIdentifier(), (res) => {
            if (res.response === null || isDecayed(player)) {
                return;
            }
            const home = serverHomes[res.response];
            if ((0, homeManager_1.deleteServerHome)(home.name) !== homeManager_1.DeletePlayerHomeResult.Success) {
                player.sendMessage(`§cCant find server home with the name ${home.name}!`);
                return;
            }
            player.sendMessage(`§aDeleted home §e${home.name}§a!`);
        });
    }, {
        options: command_1.command.enum("options.delete", "delete"),
    })
        .overload((params, origin, output) => {
        const player = origin.getEntity();
        if (player === null || !player.isPlayer()) {
            output.error("Command needs to be ran by a player!");
            return;
        }
        const home = (0, homeManager_1.tryCreateHome)(new serializableVec3_1.SerializableVec3(player.getPosition()), player.getDimensionId(), params.name);
        if (typeof home === "string") {
            output.error(home);
        }
        else {
            output.success("§aServer home created!");
        }
    }, {
        options: command_1.command.enum("options.create", "create"),
        name: nativetype_1.CxxString,
    })
        .overload((_p, origin, output) => {
        const player = origin.getEntity();
        if (player === null || !player.isPlayer()) {
            output.error("Command needs to be ran by a player!");
            return;
        }
        (0, configManager_1.sendConfigEditForm)(player);
    }, {
        options: command_1.command.enum("options.editconfig", "editconfig"),
    });
});
function createFormattedTimeString(time) {
    const days = Math.floor(time / 86400000);
    time -= days * 86400000;
    const hours = Math.floor(time / 3600000);
    time -= hours * 3600000;
    const minutes = Math.floor(time / 60000);
    time -= minutes * 60000;
    const seconds = Math.floor(time / 1000);
    let timeStr = '';
    if (days !== 0) {
        const unit = minutes === 1 ? 'day' : 'days';
        timeStr += `${days} ${unit}, `;
    }
    if (hours !== 0) {
        const unit = minutes === 1 ? 'hour' : 'hours';
        timeStr += `${hours} ${unit}, `;
    }
    if (minutes !== 0) {
        const unit = minutes === 1 ? 'minute' : 'minutes';
        timeStr += `${minutes} ${unit}, `;
    }
    if (seconds !== 0) {
        const unit = seconds === 1 ? 'second' : 'seconds';
        timeStr += `${seconds} ${unit}, `;
    }
    if (timeStr === '') {
        return 'less than a second';
    }
    return timeStr.slice(0, timeStr.length - 2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUFrQztBQUNsQywwQ0FBcUM7QUFDckMsZ0RBQTBDO0FBQzFDLCtDQVN1QjtBQUN2Qix5REFBb0Q7QUFDcEQsOENBQXdEO0FBQ3hELHdDQUFxRDtBQUNyRCxzQ0FBaUM7QUFDakMsSUFBTyxTQUFTLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQztBQUNuQyxtREFBbUQ7QUFFbkQsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3RCLGlCQUFPO1NBQ0YsUUFBUSxDQUFDLE1BQU0sRUFBRSxrQ0FBa0MsQ0FBQztTQUNwRCxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQyxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDdkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ3JELE9BQU87U0FDVjtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUEsMkJBQWEsRUFDdEIsSUFBSSxtQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsRUFDMUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUN2QixNQUFNLENBQUMsSUFBSSxFQUNYLE1BQU0sQ0FDVCxDQUFDO1FBRUYsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixPQUFPO1NBQ1Y7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdEMsQ0FBQyxFQUFFO1FBQ0MsT0FBTyxFQUFFLGlCQUFPLENBQUMsSUFB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