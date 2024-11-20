/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4zjs84zpsai0wu4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a7wtqzxk",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "pause"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4zjs84zpsai0wu4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a7wtqzxk",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "active",
        "cancelled",
        "past_due",
        "trialing",
        "incomplete"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
