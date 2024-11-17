/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "fjhhpzwt",
        name: "tags",
        type: "relation",
        required: false,
        presentable: false,
        unique: false,
        options: {
          collectionId: "6156foct15u4yk8",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: null,
        },
      }),
    );

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    // update
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "fjhhpzwt",
        name: "tags",
        type: "relation",
        required: false,
        presentable: false,
        unique: false,
        options: {
          collectionId: "6156foct15u4yk8",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      }),
    );

    return dao.saveCollection(collection);
  },
);
