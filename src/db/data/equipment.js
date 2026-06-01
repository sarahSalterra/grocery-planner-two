export const KITCHEN_EQUIPMENT_LEVELS = [
  {
    id: 'not-equipped',
    label: 'Basic',
    desc: 'Extremely basic kitchen setup, may need substitution hacks for special equipment.',
  },
  {
    id: 'standard',
    label: 'Standard / fully equipped',
    desc: 'A typical home kitchen with common cooking and baking tools.',
  },
  {
    id: 'cooking-equipped-baking-basic',
    label: 'Cooking equipped, baking basics',
    desc: 'Well set up for cooking, with only basic baking tools.',
  },
  {
    id: 'baking-equipped-cooking-basic',
    label: 'Baking equipped, cooking basics',
    desc: 'Well set up for baking, with only basic cooking tools.',
  },
]

export const KITCHEN_EQUIPMENT = [
  { id: 'stove', name: 'Stove', type: 'basic', substitutePossible: false },
  { id: 'oven', name: 'Oven', type: 'basic', substitutePossible: false },
  { id: 'microwave', name: 'Microwave', type: 'basic', substitutePossible: false },
  { id: 'toaster', name: 'Toaster', type: 'basic', substitutePossible: false },
  { id: 'deep-fryer', name: 'Deep fryer (or Air Fryer)', type: 'special', substitutePossible: true },
  { id: 'pot-holder', name: 'Pot holder', type: 'basic', substitutePossible: true },
  { id: 'oven-mitt', name: 'Oven mitt', type: 'basic', substitutePossible: true },
  { id: 'chef-knife', name: 'Chef knife', type: 'basic', substitutePossible: false },
  { id: 'cutting-board', name: 'Cutting board', type: 'basic', substitutePossible: false },
  { id: 'mixing-bowl', name: 'Mixing bowl', type: 'basic', substitutePossible: false },
  { id: 'measuring-cups', name: 'Measuring cups', type: 'basic', substitutePossible: false },
  { id: 'liquid-measuring-cup', name: 'Liquid measuring cup', type: 'special', substitutePossible: true },
  { id: 'measuring-spoons', name: 'Measuring spoons', type: 'basic', substitutePossible: false },
  { id: 'skillet', name: 'Skillet', type: 'basic', substitutePossible: false },
  { id: 'can-opener', name: 'Can opener', type: 'basic', substitutePossible: true },
  { id: 'vegetable-peeler', name: 'Vegetable peeler', type: 'basic', substitutePossible: false },
  { id: 'cheese-grater', name: 'Cheese grater', type: 'basic', substitutePossible: true },
  { id: 'zester', name: 'Zester', type: 'special', substitutePossible: true },
  { id: 'potato-masher', name: 'Potato masher', type: 'special', substitutePossible: true },
  { id: 'saucepan', name: 'Saucepan', type: 'basic', substitutePossible: false },
  { id: 'stock-pot', name: 'Stock pot', type: 'basic', substitutePossible: false },
  { id: 'dutch-oven', name: 'Dutch oven', type: 'special', substitutePossible: true },
  { id: 'baking-sheet', name: 'Baking sheet', type: 'basic', substitutePossible: false },
  { id: 'baking-dish', name: 'Baking dish (or Casserole dish)', type: 'basic', substitutePossible: false },
  { id: 'spatula', name: 'Spatula', type: 'basic', substitutePossible: false },
  { id: 'wooden-spoon', name: 'Wooden spoon', type: 'basic', substitutePossible: true },
  { id: 'salad-tongs', name: 'Salad tongs', type: 'basic', substitutePossible: true },
  { id: 'slotted-spoon', name: 'Slotted spoon', type: 'basic', substitutePossible: true },
  { id: 'ladle', name: 'Ladle', type: 'basic', substitutePossible: true },
  { id: 'whisk', name: 'Whisk', type: 'basic', substitutePossible: false },
  { id: 'colander', name: 'Colander (or Strainer)', type: 'basic', substitutePossible: false },
  { id: 'mesh-sieve', name: 'Mesh sieve (or Mesh strainer)', type: 'special', substitutePossible: true },
  { id: 'sifter', name: 'Sifter', type: 'special', substitutePossible: true },
  { id: 'pastry-cutter', name: 'Pastry cutter', type: 'special', substitutePossible: true },
  { id: 'piping-bag', name: 'Piping bag (and Tip)', type: 'special', substitutePossible: true },
  { id: 'basting-brush', name: 'Basting brush', type: 'special', substitutePossible: true },
  { id: 'rolling-pin', name: 'Rolling pin', type: 'special', substitutePossible: true },
  { id: 'biscuit-cutter', name: 'Biscuit cutter (or Cookie cutter)', type: 'special', substitutePossible: true },
  { id: 'donut-cutter', name: 'Donut cutter', type: 'special', substitutePossible: true },
  { id: 'baking-spatula', name: 'Baking spatula', type: 'special', substitutePossible: false },
  { id: 'loaf-pan', name: 'Loaf pan', type: 'special', substitutePossible: true },
  { id: 'pie-dish', name: 'Pie dish', type: 'special', substitutePossible: true },
  { id: 'muffin-tin', name: 'Muffin tin', type: 'special', substitutePossible: false },
  { id: 'cake-pan', name: 'Cake pan', type: 'special', substitutePossible: true },
  { id: 'springform-pan', name: 'Springform pan', type: 'special', substitutePossible: false },
  { id: 'cake-leveler', name: 'Cake leveler', type: 'special', substitutePossible: true },
  { id: 'icing-spatula', name: 'Icing spatula', type: 'special', substitutePossible: true },
  { id: 'double-boiler', name: 'Double boiler', type: 'special', substitutePossible: true },
  { id: 'wire-rack', name: 'Wire rack', type: 'special', substitutePossible: true },
  { id: 'blender', name: 'Blender', type: 'basic', substitutePossible: true },
  { id: 'food-processor', name: 'Food processor', type: 'special', substitutePossible: true },
  { id: 'immersion-blender', name: 'Immersion blender', type: 'special', substitutePossible: true },
  { id: 'slow-cooker', name: 'Slow cooker', type: 'special', substitutePossible: true },
  { id: 'steamer-basket', name: 'Steamer (or Steamer basket)', type: 'special', substitutePossible: true },
  { id: 'wok', name: 'Wok', type: 'special', substitutePossible: true },
  { id: 'grill-pan', name: 'Grill pan', type: 'special', substitutePossible: true },
  { id: 'grill', name: 'Grill', type: 'special', substitutePossible: true },
  { id: 'rice-cooker', name: 'Rice cooker', type: 'special', substitutePossible: true },
  { id: 'hand-mixer', name: 'Hand mixer', type: 'special', substitutePossible: true },
  { id: 'stand-mixer', name: 'Stand mixer', type: 'special', substitutePossible: true },
  { id: 'waffle-iron', name: 'Waffle iron', type: 'special', substitutePossible: false },
]

export const EQUIPMENT_BY_ID = Object.fromEntries(
  KITCHEN_EQUIPMENT.map((item) => [item.id, item])
)

const EQUIPMENT_INFERENCE_RULES = [
  { id: 'baking-sheet', patterns: [/baking sheet/i, /sheet pan/i] },
  { id: 'rolling-pin', patterns: [/rolling pin/i, /roll out/i] },
  { id: 'baking-spatula', patterns: [/rubber spatula/i, /baking spatula/i, /fold in/i] },
  { id: 'loaf-pan', patterns: [/loaf pan/i] },
  { id: 'pie-dish', patterns: [/pie dish/i, /pie plate/i] },
  { id: 'muffin-tin', patterns: [/muffin tin/i, /muffin pan/i] },
  { id: 'cake-pan', patterns: [/cake pan/i] },
  { id: 'springform-pan', patterns: [/springform/i] },
  { id: 'wire-rack', patterns: [/wire rack/i, /cooling rack/i] },
  { id: 'blender', patterns: [/blender/i, /blend until/i] },
  { id: 'food-processor', patterns: [/food processor/i] },
  { id: 'slow-cooker', patterns: [/slow cooker/i, /crockpot/i] },
  { id: 'steamer-basket', patterns: [/steamer basket/i, /\bsteam\b/i] },
  { id: 'wok', patterns: [/\bwok\b/i] },
  { id: 'grill-pan', patterns: [/grill pan/i] },
  { id: 'hand-mixer', patterns: [/hand mixer/i] },
  { id: 'stand-mixer', patterns: [/stand mixer/i] },
  { id: 'colander', patterns: [/\bdrain\b/i, /colander/i] },
  { id: 'whisk', patterns: [/\bwhisk\b/i] },
]

function getRecipeSearchText(recipe) {
  return [
    recipe?.name,
    recipe?.shortcutReplaces,
    ...(recipe?.steps ?? []).flatMap((step) => [step.name, step.text, step.shortcutText]),
  ]
    .filter(Boolean)
    .join(' ')
}

export function getRecipeEquipmentIds(recipe) {
  const explicit = Array.isArray(recipe?.neededEquipment)
    ? recipe.neededEquipment
    : Array.isArray(recipe?.equipmentIds)
      ? recipe.equipmentIds
      : []
  const text = getRecipeSearchText(recipe)
  const inferred = EQUIPMENT_INFERENCE_RULES
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
    .map((rule) => rule.id)
  return [...new Set([...explicit, ...inferred])]
}

export function getRecipeEquipment(recipe) {
  return getRecipeEquipmentIds(recipe)
    .map((id) => EQUIPMENT_BY_ID[id])
    .filter(Boolean)
}
