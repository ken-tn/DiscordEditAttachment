import "dotenv/config";
import { createReadStream } from "fs";
import FormData from "form-data";

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  console.log(url);
  // Stringify payloads
  if (options.body && !options.headers)
    options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  if (!options.headers) {
    options.headers = { "Content-Type": "application/json; charset=UTF-8" };
  }
  options.headers.Authorization = `Bot ${process.env.DISCORD_TOKEN}`;
  options.headers["User-Agent"] =
    "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)";
  console.log(options);
  const res = await fetch(url, {
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    const res = await DiscordRequest(endpoint, {
      method: "PUT",
      body: commands,
    });
    const commandList = await res.json(); // Extract JSON from the response
    console.log(commandList); // Log the list of application commands
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = [
    "😭",
    "😄",
    "😌",
    "🤓",
    "😎",
    "😤",
    "🤖",
    "😶‍🌫️",
    "🌏",
    "📸",
    "💿",
    "👋",
    "🌊",
    "✨",
  ];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getMessageFromIds(channelId, messageId) {
  const message = await DiscordRequest(
    `/channels/${channelId}/messages/${messageId}`,
    { method: "GET" } // Specify the GET method
  );

  // Now you can use `message` to access the message object
  if (message.ok) {
    return await message.json();
  } else {
    console.error(
      "Failed to fetch the message",
      message.status,
      message.statusText
    );
  }
}

export function getMessageFromLink(link) {
  const match = link.match(/\/channels\/(\d+)\/(\d+)\/(\d+)/);
  if (!match) throw new Error("Invalid message link");

  return { guildId: match[1], channelId: match[2], messageId: match[3] };
}

  // Add the file as 'files[0]'
  //   form.append("files[0]", fileStream, {
  //     filename: filename, // Include filename in Content-Disposition
  //   });

  //   // Create the attachments metadata
  //   const attachmentsMeta = [
  //     {
  //       id: "0", // Corresponds to 'files[0]'
  //       filename: filename,
  //     },
  //   ];

  //   // Add the JSON payload with the attachments metadata
  //   form.append('content', "hello world");
  //   form.append("payload_json", JSON.stringify({ content: "hello world", attachments: attachmentsMeta }));

// Replace message attachments function
export async function replaceMessageAttachments(message, filePath) {
  const fileStream = createReadStream(filePath);
  const filename = filePath.split("/").pop(); // Extract filename from path

  // Create FormData for multipart/form-data request
  const form = new FormData();

  // Append the payload_json without setting a Content-Type
  form.append('payload_json', JSON.stringify({ content: "hello" }));

  const { channel_id, id } = message;
  const endpoint = `/channels/${channel_id}/messages/${id}`;

  // Send PATCH request to update the message content
  const res = await DiscordRequest(endpoint, {
    method: 'PATCH',
    body: form,
    headers: form.getHeaders(), // Get headers from FormData (includes Content-Type)
  });

  if (res.ok) {
    // Return the updated message with attachments
    return await res.json();
  } else {
    // Throw error if request fails
    throw new Error(
      `Failed to replace attachments: ${res.status} ${res.statusText}`
    );
  }
}
