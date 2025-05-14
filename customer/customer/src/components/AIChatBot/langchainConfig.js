// LangChain agent setup and configuration will go here 

import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";

// Import your custom tool
import { InventoryCheckerTool } from "./tools/inventoryTool";
// import { cartTool } from "./tools/cartTool";

const SYSTEM_PROMPT = `You are a helpful and friendly AI assistant for Atlas Market, a local butcher's online ordering website.
Your main job is to help customers plan meals using meats sold in the store, and guide them through ordering what they need.

When customers mention a dish or meal name:
1. Search for 3 popular recipes using the tavilySearchTool.
2. Extract ingredients lists, highlighting meats needed.
3. For each meat identified, use the inventory-checker tool to find its availability and price.
4. Calculate needed meat quantities (assume 0.5-1 lb per person if not specified by the user or recipe, and assume 2 servings if user doesn't specify).
5. Return:
    - Friendly greeting.
    - Recipe summaries and ingredients.
    - Required meats, their individual prices/unit, quantities, and total estimated cost for each meat.
    - An overall total estimated cost for all meats in the meal plan.
    - Politely offer an option to add these items to their cart (though you cannot do this directly yet).

If the user asks for the price or availability of a specific item (e.g., 'How much is Steak?', 'Do you have Chicken Breast?'), use the inventory-checker tool with the specified item name.

If the user asks a general question about what items are in the store (e.g., 'What do you sell?', 'What kinds of meat do you have?'), explain that you can check the availability and price of specific items if they provide a name. You can mention that the store sells common meats like beef, chicken, and pork. Do NOT attempt to list all inventory items unless the user asks for items within a *specific category* they name and you have a tool for that.

Be concise and conversational. Assume 2 servings if not specified by the user.`;

const initializeChatAgent = async () => {
  // 1. Initialize the OpenAI Model
  // IMPORTANT: Ensure REACT_APP_OPENAI_API_KEY is set in your .env file
  // In a production environment, this key should be handled by a backend proxy.
  const llm = new ChatOpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo", // Or your preferred model
    temperature: 0.7,
  });

  // 2. Define Tools
  // IMPORTANT: Ensure REACT_APP_TAVILY_API_KEY is set in your .env file for TavilySearchResults
  // In production, this key might also be handled via a backend proxy.
  const tavilySearchTool = new TavilySearchResults({
    apiKey: process.env.REACT_APP_TAVILY_API_KEY,
    maxResults: 5, // Get a few more results for the agent to pick from
    description: "A search engine optimized for comprehensive, accurate, and trusted results. Use this for finding recipes or general web information.",
  });

  // Instantiate your custom tool
  const inventoryTool = new InventoryCheckerTool();

  const tools = [
    tavilySearchTool,
    inventoryTool, // Add your inventory tool to the list
    // TODO: Replace with actual cartTool instance once created
    // { name: "cartManager", description: "Manages shopping cart operations (add, remove, view).", execute: async (input) => ({ result: "Dummy cart operation for: " + input }) },
  ];

  // 3. Create the Prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // 4. Create the Agent
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  // 5. Initialize Memory
  // Use BufferMemory instead of ConversationBufferMemory
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    inputKey: "input", // Specify the input key
    outputKey: "output", // Changed from "log" to "output"
    returnMessages: true, // Return actual message objects
  });

  // 6. Create the Agent Executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true, // Set to true for detailed logging during development
  });

  return agentExecutor;
};

export { initializeChatAgent, AIMessage, HumanMessage }; 