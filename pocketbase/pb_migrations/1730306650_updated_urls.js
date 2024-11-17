/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    collection.listRule = "@request.auth.id = @collection.urls.created_by";
    collection.viewRule = "@request.auth.id = @collection.urls.created_by";
    collection.updateRule = "@request.auth.id = @collection.urls.created_by";
    collection.deleteRule = "@request.auth.id = @collection.urls.created_by";

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    collection.listRule = "";
    collection.viewRule = "";
    collection.updateRule = "";
    collection.deleteRule = "";

    return dao.saveCollection(collection);
  },
);
