const { functions: { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Remove extends Command {
    constructor(client) {
        super(client, {
            name: 'remove',
            guildOnly: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Removes a song from the queue.',
            usage: 'remove <position> [position]',
            cooldown: 3000,
            examples: ['remove 3', 'remove 3 7'],
            slash: true,
            options: [{
				name: 'position',
				description: 'The position of the queue.',
				type: 'INTEGER',
				required: true,
			},
			{
				name: 'newposition',
				description: 'The 2nd position of the queue.',
				type: 'INTEGER',
				required: false,
			}],
		});
    }

    async run(client, message, settings) {

        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 15000 }));

        const player = client.manager?.players.get(message.guild.id);

        if (isNaN(message.args[0])) return message.channel.send(message.translate('music/remove:NAN')).then(m => m.timedDelete({ timeout: 10000 }));

        if (!message.args[1]) {
			if (message.args[0] == 0) return message.channel.send(message.translate('music/remove:PLAYING', { PREFIX: settings.prefix }));
			if (message.args[0] > player.queue.length) return message.channel.send(message.translate('music/remove:MISSING')).then(m => m.timedDelete({ timeout: 10000 }));

			const { title } = player.queue[message.args[0] - 1];

			player.queue.splice(message.args[0] - 1, 1);
			return message.channel.send(message.translate('music/remove:REMOVED', { TITLE: title }));
		} else {
			if (message.args[0] == 0 || message.args[1] == 0) return message.channel.send(message.translate('music/remove:PLAYING', { PREFIX: settings.prefix }));
			if (message.args[0] > player.queue.length || message.args[1] > player.queue.length) return message.channel.send(message.translate('music/remove:MISSING'));
			if (message.args[0] > message.args[1]) return message.channel.send(message.translate('music/remove:INVALID'));

			const songsToRemove = message.args[1] - message.args[0];
			player.queue.splice(message.args[0] - 1, songsToRemove + 1);
			return message.channel.send(message.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
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
		if (!pos2) {
			if (pos1 == 0) return interaction.reply({ content: guild.translate('music/remove:PLAYING') });
			if (pos1 > player.queue.length) return interaction.reply({ content: guild.translate('music/remove:MISSING') });
			const { title } = player.queue[pos1 - 1];

			player.queue.splice(pos1 - 1, 1);
			return interaction.reply({ content: guild.translate('music/remove:REMOVED', { TITLE: title }) });
		} else {
			if (pos1 == 0 || pos2 == 0) return interaction.reply({ content: guild.translate('music/remove:PLAYING') });
			if (pos1 > player.queue.length || pos2 > player.queue.length) return interaction.reply({ content: guild.translate('music/remove:MISSING') });
			if (pos1 > pos2) return interaction.reply({ content: guild.translate('music/remove:INVALID') });

			const songsToRemove = pos2 - pos1;
			player.queue.splice(pos1 - 1, songsToRemove + 1);
			return interaction.reply(client.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
		}
    }
}

module.exports = Remove;