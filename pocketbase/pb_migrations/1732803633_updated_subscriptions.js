/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4zjs84zpsai0wu4")

  collection.listRule = null

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4zjs84zpsai0wu4")

  collection.listRule = "user_id = @request.auth.id"

  return dao.saveCollection(collection)
})
