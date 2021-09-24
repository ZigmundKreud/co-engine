/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { COF, System } from "../system/config.js";
import { CofBaseSheet } from "./base-sheet.js";
import { Inventory } from "../controllers/inventory.js";
import { Traversal } from "../utils/traversal.js";
import { ArrayUtils } from "../utils/array-utils.js";

export class CoLootSheet extends CoBaseSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "actor"],
            template: System.templatesPath + "/actors/loot-sheet.hbs",
            width: 950,
            height: 670,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Click to open
        html.find('.compendium-pack').dblclick(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
            if (li.attr("data-open") === "1") pack.apps[0].close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });
        // Click to open
        html.find('.item-create.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
            if (li.attr("data-open") === "1") pack.apps[0].close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Items controls
        html.find('.inventory-qty').click(this._onIncrease.bind(this));
        html.find('.inventory-qty').contextmenu(this._onDecrease.bind(this));
        html.find('.item-edit').click(this._onEditItem.bind(this));
        html.find('div.item-name').click(this._onEditItem.bind(this));
        html.find('.item-delete').click(this._onDeleteItem.bind(this));
        html.find('.foldable h3.item-name').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            const ol = li.parents('.inventory-list');
            const tab = ol.data('tab');
            const category = ol.data('category');
            const itemList = ol.find('.item-list');
            const actor = this.actor;
            itemList.slideToggle("fast", function () {
                ol.toggleClass("folded");
                if (actor.data.data.settings) {
                    if (ol.hasClass("folded")) {
                        if (!actor.data.data.settings[tab].folded.includes(category)) {
                            actor.data.data.settings[tab].folded.push(category);
                        }
                    } else {
                        ArrayUtils.remove(actor.data.data.settings[tab].folded, category)
                    }
                }
                actor.update({ "data.settings": actor.data.data.settings })
            });
        });
    }

    /* -------------------------------------------- */
    /* ITEMS MANAGEMENT                             */
    /* -------------------------------------------- */
    _onIncrease(event) {
        event.preventDefault();
        return Inventory.onModifyQuantity(this.actor, event, 1, false);
    }
    _onDecrease(event) {
        event.preventDefault();
        return Inventory.onModifyQuantity(this.actor, event, 1, true);
    }

    /**
     * Callback on delete item actions
     * @param event
     * @private
     */
    _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        let itemId = li.data("itemId");
        itemId = itemId instanceof Array ? itemId : [itemId];
        this.actor.deleteEmbeddedDocuments("Item", itemId)
    }

    /**
     * Callback on render item actions
     * @param event
     * @private
     */
    _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("itemId");
        const type = (li.data("itemType")) ? li.data("itemType") : "item";
        const pack = (li.data("pack")) ? this.getPackPrefix() + "." + li.data("pack") : null;

        // look first in actor onwed items
        let entity = this.actor.items.get(id);
        return (entity) ? entity.sheet.render(true) : Traversal.getDocument(id, type, pack).then(e => e.sheet.render(true));
    }

    /* -------------------------------------------- */
    /* DROP EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /** @override */
    async _onDrop(event) {
        event.preventDefault();
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {return false;}
        if (!data) return false;
        if (data.type === "Item")  return this._onDropItem(event, data); 
        if (data.type === "Actor") return false; 
    }

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        // let authorized = true;

        // let itemData = await this._getItemDropData(event, data);
        const item = await Item.fromDropData(data);
        let itemData = duplicate(item.data);
        itemData = itemData instanceof Array ? itemData : [itemData];
        switch (itemData.type) {
            case "path":
            case "profile":
            case "species":
            case "capacity":
                return false;
            default:
                // activate the capacity as it is droped on an actor sheet
                // if (itemData.type === "capacity") itemData.data.checked = true;
                // Handle item sorting within the same Actor
                const actor = this.actor;
                let sameActor = (data.actorId === actor.id) || (actor.isToken && (data.tokenId === actor.token.id));
                if (sameActor) return this._onSortItem(event, itemData);
                // Create the owned item
                return this.actor.createEmbeddedDocuments("Item", itemData);
        }
    }

    /** @override */
    getData(options = {}) {
        const data = super.getData(options);
        if (COF.debug) console.log(data);
        data.inventory = {
            count: data.items.filter(i => i.type === "item").length,
            categories: []
        };
        for (const category of Object.keys(game.cof.config.itemCategories)) {
            data.inventory.categories.push({
                id: category,
                label: "COF.category." + category,
                items: Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category).sort((a, b) => (a.name > b.name) ? 1 : -1)
            });
        }
        return data;
    }
}
