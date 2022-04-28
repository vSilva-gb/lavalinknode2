const { functions: { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Move extends Command {
    constructor(client) {
        super(client, {
            name: 'move',
            guildOnly: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Moves the specified song to the specified position.',
            usage: 'move <position> <new position>',
            cooldown: 3000,
            examples: ['move 4 8'],
            slash: true,
            options: [{
                name: 'position',
                description: 'The initial position of the song.',
                type: 'INTEGER',
                required: true,
            },
            {
                name: 'newposition',
                description: 'The new position of the song.',
                type: 'INTEGER',
                required: false,
            }],
        });
    }

    async run(client, message, settings) {
        
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(message.guild.id);
        if (isNaN(message.args[0])) return message.channel.send(message.translate('music/move:INVALID'));

        if (message.args[0] === 0) return message.channel.send(message.translate('music/move:IS_PLAYING', { PREFIX: settings.prefix }));

        if ((message.args[0] > player.queue.length) || (message.args[0] && !player.queue[message.args[0]])) return message.channel.send(message.translate('music/move:NOT_FOUND')).then(m => m.timedDelete({ timeout: 10000 }));

        if (!message.args[1]) {
            const song = player.queue[message.args[0] - 1];
            player.queue.splice(message.args[0] - 1, 1);
            player.queue.splice(0, 0, song);
            return message.channel.send(message.translate('music/move:MOVED_1', { TITLE: song.title }));
        } else if (message.args[1]) {
            if (message.args[1] == 0) return message.channel.send(message.translate('music/move:IS_PLAYING', { PREFIX: settings.prefix }));
            if ((message.args[1] > player.queue.length) || !player.queue[message.args[1]]) return message.channel.send(message.translate('music/move:NOT_FOUND')).then(m => m.timedDelete({ timeout: 10000 }));
			const song = player.queue[message.args[0] - 1];
			player.queue.splice(message.args[0] - 1, 1);
			player.queue.splice(message.args[1] - 1, 0, song);
			return message.channel.send(message.translate('music/move:MOVED_2', { TITLE: song.title, POS: message.args[1] }));
        }
    }

    async callback(client, interaction, guild, args) {
        
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId),
            pos1 = args.get('position').value,
            pos2 = args.get('newposition')?.value;

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);

        if (pos1 === 0) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:IS_PLAYING', {}, true)] });

        if ((pos1 > player.queue.length) || (pos1 && !player.queue[pos1])) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:NOT_FOUND', {}, true)] });

        if (!pos2) {
            const song = player.queue[pos1 - 1];
            player.queue.splice(pos1 - 1, 1);
            player.queue.splice(0, 0, song);
            return interaction.reply(client.translate('music/move:MOVED_1', { TITLE: song.title }));
        } else if (pos2) {
            if (pos2 == 0) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:IS_PLAYING', {}, true)] });
			if ((pos2 > player.queue.length) || !player.queue[pos2]) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/move:NOT_FOUND', {}, true)] });
			const song = player.queue[pos1 - 1];
			player.queue.splice(pos1 - 1, 1);
			player.queue.splice(pos2 - 1, 0, song);
			return interaction.reply(guild.translate('music/move:MOVED_2', { TITLE: song.title, POS: pos2 }));
        }
    }
}

module.exports = Move;