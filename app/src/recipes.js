import { Recipe } from './recipe';

export const wellRec = new Recipe("Well", [
  [["wood", "stone"]],
  [["wood"], ["stone"]],
  [["stone", "wood"]],
  [["stone"], ["wood"]],
  [["stone", "wood"]],
  [["wood", "stone"]],
  [["wood"], ["stone"]],
  [["stone"], ["wood"]]
], "🕳️", "🪙1 for each adjacent 🏠.");

export const theatreRec = new Recipe("Theatre", [
  [["", "stone", ""], ["wood", "glass", "wood"]],
  [["wood", ""], ["glass", "stone"], ["wood", ""]],
  [["wood", "glass", "wood"], ["", "stone", ""]],
  [["", "wood"], ["stone", "glass"], ["", "wood"]],
  [["", "stone", ""], ["wood", "glass", "wood"]],
  [["wood", "glass", "wood"], ["", "stone", ""]],
  [["", "wood"], ["stone", "glass"], ["", "wood"]],
  [["wood", ""], ["glass", "stone"], ["wood", ""]]
], "🎭", "🪙1 for each other unique building type in the same row or column as 🎭.");

export const factoryRec = new Recipe("Factory", [
  [["wood", "", "", ""], ["brick", "stone", "stone", "brick"]],
  [["brick", "wood"], ["stone", ""], ["stone", ""], ["brick", ""]],
  [["brick", "stone", "stone", "brick"], ["", "", "", "wood"]],
  [["", "brick"], ["", "stone"], ["", "stone"], ["wood", "brick"]],
  [["", "", "", "wood"], ["brick", "stone", "stone", "brick"]],
  [["brick", "stone", "stone", "brick"], ["wood", "", "", ""]],
  [["wood", "brick"], ["", "stone"], ["", "stone"], ["", "brick"]],
  [["brick", ""], ["stone", ""], ["stone", ""], ["brick", "wood"]]
], "🏭", "When constructed, place 1 of the 5 resources on 🏭.");

export const cottageRec = new Recipe("Cottage", [
  [["", "wheat"], ["brick", "glass"]],
  [["brick", ""], ["glass", "wheat"]],
  [["glass", "brick"], ["wheat", ""]],
  [["wheat", "glass"], ["", "brick"]],
  [["wheat", ""], ["glass", "brick"]],
  [["brick", "glass"], ["", "wheat"]],
  [["", "brick"], ["wheat", "glass"]],
  [["glass", "wheat"], ["brick", ""]]
], "🏠", "🪙3 if this building is fed");

export const chapelRec = new Recipe("Chapel", [
  [["", "", "glass"], ["stone", "glass", "stone"]],
  [["stone", ""], ["glass", ""], ["stone", "glass"]],
  [["stone", "glass", "stone"], ["glass", "", ""]],
  [["glass", "stone"], ["", "glass"], ["", "stone"]],
  [["glass", "", ""], ["stone", "glass", "stone"]],
  [["stone", "glass", "stone"], ["", "", "glass"]],
  [["", "stone"], ["", "glass"], ["glass", "stone"]],
  [["stone", "glass"], ["glass", ""], ["stone", ""]]
], "💒", "🪙1 for each fed 🏠.");

export const farmRec = new Recipe("Farm", [
  [["wheat", "wheat"], ["wood", "wood"]],
  [["wood", "wheat"], ["wood", "wheat"]],
  [["wood", "wood"], ["wheat", "wheat"]],
  [["wheat", "wood"], ["wheat", "wood"]],
  [["wheat", "wheat"], ["wood", "wood"]],
  [["wood", "wood"], ["wheat", "wheat"]],
  [["wheat", "wood"], ["wheat", "wood"]],
  [["wood", "wheat"], ["wood", "wheat"]]
], "🌾", "Feeds 4 🏠 buildings anywhere in your town.");

export const tavernRec = new Recipe("Tavern", [
  [["brick", "brick", "glass"]],
  [["brick"], ["brick"], ["glass"]],
  [["glass", "brick", "brick"]],
  [["glass"], ["brick"], ["brick"]],
  [["glass", "brick", "brick"]],
  [["brick", "brick", "glass"]],
  [["brick"], ["brick"], ["glass"]],
  [["glass"], ["brick"], ["brick"]]
], "🍺", "Pts based on your constructed 🍺.");

export const cathedralRec = new Recipe("Cathedral", [
  [["wheat", ""], ["stone", "glass"]],
  [["stone", "wheat"], ["glass", ""]],
  [["glass", "stone"], ["", "wheat"]],
  [["", "glass"], ["wheat", "stone"]],
  [["", "wheat"], ["glass", "stone"]],
  [["stone", "glass"], ["wheat", ""]],
  [["wheat", "stone"], ["", "glass"]],
  [["glass", ""], ["stone", "wheat"]]
], "🛐", "🪙2. Empty squares in your town are worth 🪙0 instead of 🪙-1");

// Collect all recipes for easy import
export const RECIPES = [
  wellRec,
  theatreRec,
  factoryRec,
  cottageRec,
  chapelRec,
  farmRec,
  tavernRec,
  cathedralRec
];
