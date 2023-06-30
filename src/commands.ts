import {events} from "bdsx/event";
import {command} from "bdsx/command";
import {CxxString} from "bdsx/nativetype";
import {
    DeletePlayerHomeResult,
    deleteServerHome,
    getOwnedHomes,
    getRemainingTeleportCooldown,
    SendHomeFormResult,
    tryCreateHome,
    trySendDeleteForm,
    trySendWarpForm
} from "./homeManager";
import {SerializableVec3} from "./serializableVec3";
import {CommandPermissionLevel} from "bdsx/bds/command";
import {FormButton, SimpleForm} from "bdsx/bds/form";
import {decay} from "bdsx/decay";
import isDecayed = decay.isDecayed;
import {sendConfigEditForm} from "./configManager";

events.serverOpen.on(() => {
    command
        .register("home", "Command for managing your homes!")
        .overload((params, origin, output) => {
            const player = origin.getEntity();
            if (player === null || !player.isPlayer()) {
                output.error("Command needs to be ran by a player!");
                return;
            }

            const home = tryCreateHome(
                new SerializableVec3(player.getPosition()),
                player.getDimensionId(),
                params.name,
                player
            );

            if (typeof home === "string") {
                output.error(home);
                return;
            }

            output.success("§aHome created!");
        }, {
            options: command.enum("options.create", "create"),
            name: CxxString,
        })
        .overload((_p, origin, output) => {
            const player = origin.getEntity();
            if (player === null || !player.isPlayer()) {
                output.error("Command needs to be ran by a player!");
                return;
            }

            const res = trySendWarpForm(player);

            if (res !== SendHomeFormResult.Success) {
                switch (res) {
                    case SendHomeFormResult.NoHomes:
                        output.error("You dont have any homes to warp to in this dimension!");
                        return;
                    case SendHomeFormResult.OnCooldown:
                        let remainingTime = getRemainingTeleportCooldown(player.getXuid());
                        let formattedRemainingTime = createFormattedTimeString(remainingTime);

                        output.error(`You still have to wait ${formattedRemainingTime} before you can teleport!`);
                }
            }
        }, {
            options: command.enum("options.warp", "warp"),
        })
        .overload((_p, origin, output) => {
            const player = origin.getEntity();
            if (player === null || !player.isPlayer()) {
                output.error("Command needs to be ran by a player!");
                return;
            }

            const formSendResult = trySendDeleteForm(player);

            if (formSendResult !== SendHomeFormResult.Success) {
                output.error("You have no homes to delete!");
            }
        }, {
            options: command.enum("options.delete", "delete"),
        })

    command
        .register("shome", "Command for managing server homes!", CommandPermissionLevel.Operator)
        .overload((_p, origin, output) => {
            const player = origin.getEntity();
            if (player === null || !player.isPlayer()) {
                output.error("Command needs to be ran by a player!");
                return;
            }

            // Generating form
            const serverHomes = getOwnedHomes("SERVER");

            if (serverHomes.length === 0) {
                output.error("There are no server homes!");
                return;
            }

            const buttons: FormButton[] = [];
            for (const home of serverHomes) {
                buttons.push(new FormButton(home.name))
            }
            
            const form = new SimpleForm("Server Home List", "Select a server home to delete!", buttons);
            form.sendTo(player.getNetworkIdentifier(), (res) => {
                if (res.response === null || isDecayed(player)) {
                    return;
                }

                const home = serverHomes[res.response];

                if (deleteServerHome(home.name) !== DeletePlayerHomeResult.Success) {
                    player.sendMessage(`§cCant find server home with the name ${home.name}!`);
                    return;
                }

                player.sendMessage(`§aDeleted home §e${home.name}§a!`);
            })
        }, {
            options: command.enum("options.delete", "delete"),
        })
        .overload((params, origin, output) => {
            const player = origin.getEntity();
            if (player === null || !player.isPlayer()) {
                output.error("Command needs to be ran by a player!");
                return;
            }

            const home = tryCreateHome(
                new SerializableVec3(player.getPosition()),
                player.getDimensionId(),
                params.name,
            );

            if (typeof home === "string") {
                output.error(home);
            } else {
                output.success("§aServer home created!");
            }
        }, {
            options: command.enum("options.create", "create"),
            name: CxxString,
        })
        .overload((_p, origin, output) => {
            const player = origin.getEntity();
            if (player === null || !player.isPlayer()) {
                output.error("Command needs to be ran by a player!");
                return;
            }
            
            sendConfigEditForm(player);
        }, {
            options: command.enum("options.editconfig", "editconfig"),
        })
})

function createFormattedTimeString(time: number) {
    const days = Math.floor(time / 86_400_000);
    time -= days * 86_400_000;

    const hours = Math.floor(time / 3_600_000);
    time -= hours * 3_600_000;

    const minutes = Math.floor(time / 60_000);
    time -= minutes * 60_000;

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

    return timeStr.slice(0 ,timeStr.length - 2);
}