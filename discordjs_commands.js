import "dotenv/config";
import { REST, Routes } from "discord.js";

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "edit",
    description: "Edit a message attachment",
    options: [
      {
        type: 3, // STRING
        name: "message_link",
        description: "The link to the message you want to edit",
        required: true,
      },
      {
        type: 3, // STRING
        name: "file_path",
        description: "The path to the new file",
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log("Started refreshing application (/) commands.");

  await rest.put(Routes.applicationCommands(process.env.APP_ID), {
    body: commands,
  });

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}
