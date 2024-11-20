/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4zjs84zpsai0wu4")

  // remove
  collection.schema.removeField("heubi0dr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jafyy8jc",
    "name": "canceled_at",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cdh0dufd",
    "name": "cancel_at_period_end",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4zjs84zpsai0wu4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "heubi0dr",
    "name": "cancel_at_period_end",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // remove
  collection.schema.removeField("jafyy8jc")

  // remove
  collection.schema.removeField("cdh0dufd")

  return dao.saveCollection(collection)
})
