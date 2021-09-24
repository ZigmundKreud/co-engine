import { EntitySummary } from "./entity-summary.js";

export class Path {
    /**
     * 
     * @param {*} actor 
     * @param {*} pathsData 
     * @returns 
     */
    static addPathsToActor(actor, pathsData) {
        let items = [];
        pathsData = pathsData instanceof Array ? pathsData : [pathsData];
        pathsData.forEach(p => { items.push(p.toObject(false)) });
        return actor.createEmbeddedDocuments("Item", items).then(newPaths => {
            // on ajoute toutes les metadonnees aux voies nouvellement creees pour faciliter la gestions des capacites qui en dependent
            let updatedPaths = newPaths.map(newPath => {
                const index = newPaths.indexOf(newPath);
                let updatedPath = duplicate(newPath);
                updatedPath.data.capacities = updatedPath.data.capacities.map(cap => {
                    // Ajout de données utilisées pour la gestion des voies/capa
                    cap.data = {
                        key: cap.name.slugify({ strict: true }),
                        rank: updatedPath.data.capacities.indexOf(cap) + 1,
                        checked: false,
                        path: {
                            _id: updatedPath._id,
                            name: updatedPath.name,
                            img: updatedPath.img,
                            key: updatedPath.data.key,
                            sourceId: pathsData[index].sourceId,
                        }
                    };
                    return cap;
                });
                return updatedPath;
            });
            updatedPaths = updatedPaths instanceof Array ? updatedPaths : [updatedPaths];
            return actor.updateEmbeddedDocuments("Item", updatedPaths);
        });
    }
    /**
     * 
     * @param {*} actor 
     * @param {*} pathData 
     * @returns 
     */
    static addToActor(actor, pathData) {
        if (actor.items.filter(item => item.type === "path" && item.data.name === pathData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            return this.addPathsToActor(actor, pathData);
            return this.addPathsToActor(actor, [{ "itemData": pathData, "sourceId": pathData.data.flags.core.sourceId }]);
        }
    }
    /**
     * 
     * @param {*} entity 
     * @param {*} pathData 
     * @returns 
     */
    static addToItem(entity, pathData) {
        let data = duplicate(entity.data);
        let paths = data.data.paths;
        let pathsIds = paths.map(p => p._id);
        if (pathsIds && !pathsIds.includes(pathData._id)) {
            data.data.paths.push(EntitySummary.create(pathData));
            return entity.update(data);
        }
        else ui.notifications.error("Cet objet contient déjà cette voie.")
    }
    /**
     * 
     * @param {*} actor 
     * @param {*} path 
     */
    static removeFromActor(actor, path) {
        Dialog.confirm({
            title: game.i18n.format("COF.dialog.deleteProfile.title"),
            content: `<p>Etes-vous sûr de vouloir supprimer la voie ${path.name} ?</p>`,
            yes: () => {
                const pathData = path.data;
                let items = actor.items.filter(item => item.data.type === "capacity" && item.data.data.path._id === pathData._id).map(c => c.data._id);
                items.push(path.id);
                return actor.deleteEmbeddedDocuments("Item", items);
            },
            defaultYes: true
        });
    }
    /**
     * 
     * @param {*} actor 
     * @param {*} paths 
     * @returns 
     */
    static removePathsFromActor(actor, paths) {
        let items = [];
        paths = paths instanceof Array ? paths : [paths];
        paths.map(path => {
            let caps = actor.items.filter(item => {
                if (item.data.type === "capacity") {
                    if (item.data.data.path._id === path.id) return true;
                }
            });
            caps.map(c => items.push(c.id));
            //caps = caps instanceof Array ? caps : [caps];
            //actor.deleteEmbeddedDocuments("Item", caps);
            items.push(path.id);
        });
        return actor.deleteEmbeddedDocuments("Item", items);
    }
}