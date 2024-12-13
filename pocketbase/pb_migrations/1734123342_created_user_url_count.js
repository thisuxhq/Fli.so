/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "yyz7bodsf57y7q3",
    "created": "2024-12-13 20:55:42.389Z",
    "updated": "2024-12-13 20:55:42.430Z",
    "name": "user_url_count",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "xm6jhu9o",
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
      },
      {
        "system": false,
        "id": "efzi5yoh",
        "name": "url_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT \n    u.id, \n    u.name, \n    COUNT(url.id) AS url_count\nFROM users u\nLEFT JOIN urls url ON u.id = url.created_by\nGROUP BY u.id, u.name\nORDER BY url_count DESC;\n"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("yyz7bodsf57y7q3");

  return dao.deleteCollection(collection);
})
