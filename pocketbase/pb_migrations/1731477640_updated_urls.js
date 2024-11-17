/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "5kymegbk",
        name: "expiration",
        type: "date",
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: "",
          max: "",
        },
      }),
    );

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "wjtpgc6y",
        name: "meta_title",
        type: "text",
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: "",
        },
      }),
    );

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "c1gkanuy",
        name: "meta_description",
        type: "text",
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: "",
        },
      }),
    );

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "cccmfp1f",
        name: "meta_image_url",
        type: "url",
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: [],
          onlyDomains: [],
        },
      }),
    );

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "uycpfmfk",
        name: "qr_code",
        type: "text",
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: "",
        },
      }),
    );

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq");

    // remove
    collection.schema.removeField("5kymegbk");

    // remove
    collection.schema.removeField("wjtpgc6y");

    // remove
    collection.schema.removeField("c1gkanuy");

    // remove
    collection.schema.removeField("cccmfp1f");

    // remove
    collection.schema.removeField("uycpfmfk");

    return dao.saveCollection(collection);
  },
);
