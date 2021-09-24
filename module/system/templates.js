/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "systems/co/templates/actors/actor-sheet.hbs",
        "systems/co/templates/actors/loot-sheet.hbs",
        "systems/co/templates/actors/parts/actor-details.hbs",
        "systems/co/templates/actors/parts/actor-tabs.hbs",
        "systems/co/templates/actors/parts/actor-description.hbs",
        "systems/co/templates/actors/parts/capacities/actor-capacities.hbs",
        "systems/co/templates/actors/parts/capacities/actor-paths.hbs",
        "systems/co/templates/actors/parts/combat/actor-combat.hbs",
        "systems/co/templates/actors/parts/combat/actor-combat-item.hbs",
        "systems/co/templates/actors/parts/combat/encounter-combat.hbs",
        "systems/co/templates/actors/parts/details/actor-details.hbs",
        "systems/co/templates/actors/parts/details/encounter-details.hbs",
        "systems/co/templates/actors/parts/inventory/actor-inventory.hbs",
        "systems/co/templates/actors/parts/inventory/actor-inventory-item.hbs",
        "systems/co/templates/actors/parts/stats/actor-stats.hbs",
        "systems/co/templates/actors/parts/stats/encounter-stats.hbs",

        "systems/co/templates/actors/parts/stats/actor-attacks.hbs",
        "systems/co/templates/actors/parts/stats/actor-attributes.hbs",
        "systems/co/templates/actors/parts/stats/actor-recovery.hbs",
        "systems/co/templates/actors/parts/stats/actor-resources.hbs",
        "systems/co/templates/actors/parts/stats/actor-vitality.hbs",
        "systems/co/templates/actors/parts/stats/actor-defence.hbs",
        "systems/co/templates/actors/parts/stats/actor-init.hbs",
        
        // EFFECTS
        "systems/co/templates/effects/effects.hbs",
        "systems/co/templates/effects/effects-item.hbs",

        // DIALOGS
        "systems/co/templates/dialogs/parts/roll-dmg-fields.hbs",

        // ITEMS PROPERTIES
        "systems/co/templates/items/parts/properties/item-properties.hbs",

        // ITEMS DETAILS
        "systems/co/templates/items/parts/details/item-details.hbs",
        "systems/co/templates/items/parts/details/capacity-details.hbs",
        "systems/co/templates/items/parts/details/path-details.hbs",
        "systems/co/templates/items/parts/details/profile-details.hbs",
        "systems/co/templates/items/parts/details/ranged-details.hbs",
        "systems/co/templates/items/parts/details/species-details.hbs",
        "systems/co/templates/items/parts/details/equipment-details.hbs",
        "systems/co/templates/items/parts/details/protection-details.hbs",
        "systems/co/templates/items/parts/details/spell-details.hbs",
        "systems/co/templates/items/parts/details/weapon-details.hbs",
        "systems/co/templates/items/parts/details/usage-details.hbs",
        "systems/co/templates/items/parts/details/effects-details.hbs",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
