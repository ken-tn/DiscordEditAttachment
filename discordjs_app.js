import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Event when the bot is ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Function to edit message attachments
async function editMessageAttachment(messageLink, filePath, interaction) {
    try {
        const [channelId, messageId] = messageLink.split('/').slice(-2);
        const channel = await client.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);

        // Check if the message has attachments
        if (message.attachments.size > 0) {
            // Check if the provided file exists
            if (fs.existsSync(filePath)) {
                // Edit the message with the new attachment
                await message.edit({ content: 'Updated attachment:', files: [filePath] });
                await interaction.reply({ content: 'Attachment updated successfully!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'File does not exist: ' + filePath, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Message has no attachments to edit.', ephemeral: true });
        }
    } catch (error) {
        console.error('Error editing message attachment:', error);
        await interaction.reply({ content: 'An error occurred while editing the attachment.', ephemeral: true });
    }
}

// Listen for interaction events
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "edit") {
    const messageLink = options.getString("message_link");
    const filePath = options.getString("file_path");
    await editMessageAttachment(messageLink, filePath, interaction);
  }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
