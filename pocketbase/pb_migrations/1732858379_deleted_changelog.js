/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("278npu1lbvs5bq9");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "278npu1lbvs5bq9",
    "created": "2024-11-26 07:25:45.358Z",
    "updated": "2024-11-26 07:25:45.358Z",
    "name": "changelog",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "inlgamof",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
