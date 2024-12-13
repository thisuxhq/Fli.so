/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "sz0f8y1cuwqg85u",
    "created": "2024-12-13 20:59:18.002Z",
    "updated": "2024-12-13 20:59:18.002Z",
    "name": "waitlist",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "w6l9teb2",
        "name": "email",
        "type": "email",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": [],
          "onlyDomains": []
        }
      },
      {
        "system": false,
        "id": "ws8ncc6l",
        "name": "message",
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
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("sz0f8y1cuwqg85u");

  return dao.deleteCollection(collection);
})
