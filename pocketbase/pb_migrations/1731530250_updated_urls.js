/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pzgieofw",
    "name": "password_hash",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 8,
      "max": 100,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pzgieofw",
    "name": "password_hash",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 8,
      "max": 100,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
