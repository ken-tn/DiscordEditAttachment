import "dotenv/config";
import { getRPSChoices } from "./game.js";
import { capitalize, InstallGlobalCommands } from "./utils.js";

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TESTING_COMMAND = {
  name: "test",
  description: "Basic command hello",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const EDIT_COMMAND = {
    name: "edit",
    description: "Edit attachments in a message",
    type: 1,
    options: [
      {
        name: "message_link",
        description: "The link to the message you want to edit",
        type: 3, // STRING type
        required: true, // This makes the argument mandatory
      },
      {
        name: "file_path",
        description: "The path to the new file to attach",
        type: 3, // STRING type
        required: true, // This makes the argument mandatory
      }
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  };

// Command containing options
const CHALLENGE_COMMAND = {
  name: "challenge",
  description: "Challenge to a match of rock paper scissors",
  options: [
    {
      type: 3,
      name: "object",
      description: "Pick your object",
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [TESTING_COMMAND, EDIT_COMMAND, CHALLENGE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
