import { Tool } from "@langchain/core/tools";
// import { API_BASE_URL } from '../../../../utils/config'; // Removed problematic import

// Helper function to fetch inventory data using environment variable for API base URL
async function fetchInventoryFromAPI() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  if (!API_BASE_URL) {
    console.error("[InventoryCheckerTool] REACT_APP_API_BASE_URL is not defined in your .env file.");
    return []; // Or throw an error
  }
  console.log(`[InventoryCheckerTool] Fetching inventory from API base: ${API_BASE_URL}`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("[InventoryCheckerTool] Fetched inventory data:", data);
    return data;
  } catch (error) {
    console.error("[InventoryCheckerTool] Error fetching inventory:", error);
    // Return an empty array or a specific error structure if the API fails,
    // so the tool can inform the agent about the problem.
    return []; // Or throw the error to be caught by the agent executor
  }
}

export class InventoryCheckerTool extends Tool {
  static lc_name() {
    return "InventoryCheckerTool";
  }

  name = "inventory-checker";
  description =
    "Use this to find the current price and stock quantity for any specific meat item sold in the store. " +
    "Input MUST be the specific name of the item as you might see it listed (e.g., 'Chicken Breast', 'Ribeye Steak', 'Steak', 'Chicken'). " +
    "Responds with price per unit (e.g., /lb) and quantity in stock, or if the item is not found.";

  async _call(itemName) {
    console.log(`[InventoryCheckerTool] Received call for item: ${itemName}`);
    try {
      const inventory = await fetchInventoryFromAPI();
      if (!inventory || inventory.length === 0) {
        return "Sorry, I couldn\'t fetch the inventory information at the moment. Please try again later.";
      }

      const searchTerm = itemName.toLowerCase().trim();
      let foundItem = null;

      for (const category of inventory) {
        if (category.items && category.items.length > 0) {
          foundItem = category.items.find(item => item.name.toLowerCase() === searchTerm);
          if (foundItem) break;
        }
      }

      if (foundItem) {
        if (foundItem.quantity > 0) {
          let priceString = "Price not available";
          // Check for all possible price fields
          if (foundItem.price_per_pound !== null && typeof foundItem.price_per_pound !== 'undefined') {
            priceString = `$${parseFloat(foundItem.price_per_pound).toFixed(2)}/lb`;
          } else if (foundItem.pricePerPound !== null && typeof foundItem.pricePerPound !== 'undefined') {
            priceString = `$${parseFloat(foundItem.pricePerPound).toFixed(2)}/lb`;
          } else if (foundItem.price_per_box !== null && typeof foundItem.price_per_box !== 'undefined') {
            priceString = `$${parseFloat(foundItem.price_per_box).toFixed(2)}/box`;
          } else if (foundItem.pricePerBox !== null && typeof foundItem.pricePerBox !== 'undefined') {
            priceString = `$${parseFloat(foundItem.pricePerBox).toFixed(2)}/box`;
          } else if (foundItem.price_per_item !== null && typeof foundItem.price_per_item !== 'undefined') {
            priceString = `$${parseFloat(foundItem.price_per_item).toFixed(2)}/item`;
          } else if (foundItem.pricePerItem !== null && typeof foundItem.pricePerItem !== 'undefined') {
            priceString = `$${parseFloat(foundItem.pricePerItem).toFixed(2)}/item`;
          }
          // You might need to adjust the quantity unit (e.g., lbs, pieces) based on your data
          return `${foundItem.name}: ${foundItem.quantity} units available at ${priceString}.`;
        } else {
          return `Sorry, ${foundItem.name} is currently out of stock.`;
        }
      } else {
        return `Sorry, I couldn\'t find \'${itemName}\' in our inventory. Please check the spelling or try a different item.`;
      }
    } catch (error) {
      console.error(`[InventoryCheckerTool] Error processing item "${itemName}":`, error);
      return `An error occurred while checking the inventory for \'${itemName}\'. Details: ${error.message}`;
    }
  }
} 