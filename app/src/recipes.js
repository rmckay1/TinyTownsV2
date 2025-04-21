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
], "🕳️");

export const theatreRec = new Recipe("Theatre", [
  [["", "stone", ""], ["wood", "glass", "wood"]],
  [["wood", ""], ["glass", "stone"], ["wood", ""]],
  [["wood", "glass", "wood"], ["", "stone", ""]],
  [["", "wood"], ["stone", "glass"], ["", "wood"]],
  [["", "stone", ""], ["wood", "glass", "wood"]],
  [["wood", "glass", "wood"], ["", "stone", ""]],
  [["", "wood"], ["stone", "glass"], ["", "wood"]],
  [["wood", ""], ["glass", "stone"], ["wood", ""]]
], "🎭");

export const factoryRec = new Recipe("Factory", [
  [["wood", "", "", ""], ["brick", "stone", "stone", "brick"]],
  [["brick", "wood"], ["stone", ""], ["stone", ""], ["brick", ""]],
  [["brick", "stone", "stone", "brick"], ["", "", "", "wood"]],
  [["", "brick"], ["", "stone"], ["", "stone"], ["wood", "brick"]],
  [["", "", "", "wood"], ["brick", "stone", "stone", "brick"]],
  [["brick", "stone", "stone", "brick"], ["wood", "", "", ""]],
  [["wood", "brick"], ["", "stone"], ["", "stone"], ["", "brick"]],
  [["brick", ""], ["stone", ""], ["stone", ""], ["brick", "wood"]]
], "🏭");

export const cottageRec = new Recipe("Cottage", [
  [["", "wheat"], ["brick", "glass"]],
  [["brick", ""], ["glass", "wheat"]],
  [["glass", "brick"], ["wheat", ""]],
  [["wheat", "glass"], ["", "brick"]],
  [["wheat", ""], ["glass", "brick"]],
  [["brick", "glass"], ["", "wheat"]],
  [["", "brick"], ["wheat", "glass"]],
  [["glass", "wheat"], ["brick", ""]]
], "🏠");

export const chapelRec = new Recipe("Chapel", [
  [["", "", "glass"], ["stone", "glass", "stone"]],
  [["stone", ""], ["glass", ""], ["stone", "glass"]],
  [["stone", "glass", "stone"], ["glass", "", ""]],
  [["glass", "stone"], ["", "glass"], ["", "stone"]],
  [["glass", "", ""], ["stone", "glass", "stone"]],
  [["stone", "glass", "stone"], ["", "", "glass"]],
  [["", "stone"], ["", "glass"], ["glass", "stone"]],
  [["stone", "glass"], ["glass", ""], ["stone", ""]]
], "💒");

export const farmRec = new Recipe("Farm", [
  [["wheat", "wheat"], ["wood", "wood"]],
  [["wood", "wheat"], ["wood", "wheat"]],
  [["wood", "wood"], ["wheat", "wheat"]],
  [["wheat", "wood"], ["wheat", "wood"]],
  [["wheat", "wheat"], ["wood", "wood"]],
  [["wood", "wood"], ["wheat", "wheat"]],
  [["wheat", "wood"], ["wheat", "wood"]],
  [["wood", "wheat"], ["wood", "wheat"]]
], "🌾");

export const tavernRec = new Recipe("Tavern", [
  [["brick", "brick", "glass"]],
  [["brick"], ["brick"], ["glass"]],
  [["glass", "brick", "brick"]],
  [["glass"], ["brick"], ["brick"]],
  [["glass", "brick", "brick"]],
  [["brick", "brick", "glass"]],
  [["brick"], ["brick"], ["glass"]],
  [["glass"], ["brick"], ["brick"]]
], "🍺");

export const cathedralRec = new Recipe("Cathedral", [
  [["wheat", ""], ["stone", "glass"]],
  [["stone", "wheat"], ["glass", ""]],
  [["glass", "stone"], ["", "wheat"]],
  [["", "glass"], ["wheat", "stone"]],
  [["", "wheat"], ["glass", "stone"]],
  [["stone", "glass"], ["wheat", ""]],
  [["wheat", "stone"], ["", "glass"]],
  [["glass", ""], ["stone", "wheat"]]
], "🛐");
