import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from "discord-interactions";
import {
  getRandomEmoji,
  getMessageFromLink,
  replaceMessageAttachments,
  getMessageFromIds,
} from "./utils.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async function (req, res) {
    // Interaction type and data
    const { type, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name, options } = data;

      // "test" command
      if (name === "test") {
        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: `hello world from app.js ${getRandomEmoji()}`,
          },
        });
      }

      if (name === "edit") {
        // Send a message into the channel where command was triggered from
        const messageLink = options[0].value; // Assuming the link is passed as a command argument
        const filePath = options[1].value; // Assuming the link is passed as a command argument

        try {
          // Extract channel ID and message ID from the link
          const { channelId, messageId } = getMessageFromLink(messageLink);

          // Fetch the original message
          const message = await getMessageFromIds(channelId, messageId);
          const updatedMessage = await replaceMessageAttachments(message, filePath);
          console.log(updatedMessage.content)

          // Send a success message
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Attachments in the message have been successfully replaced!`,
            },
          });
        } catch (error) {
          console.error("Error replacing attachments:", error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Failed to replace the attachments. Error: ${error.message}`,
            },
          });
        }
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: "unknown command" });
    }

    console.error("unknown interaction type", type);
    return res.status(400).json({ error: "unknown interaction type" });
  }
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
