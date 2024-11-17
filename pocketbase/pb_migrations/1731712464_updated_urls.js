/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "ngm5m1bi",
        name: "expiration_url",
        type: "url",
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: null,
          onlyDomains: null,
        },
      }),
    );

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    // remove
    collection.schema.removeField("ngm5m1bi");

    return dao.saveCollection(collection);
  },
);
