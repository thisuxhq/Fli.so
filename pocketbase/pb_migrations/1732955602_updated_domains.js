/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("469ndywsep8ecvn")

  collection.createRule = "@request.auth.id != ''"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("469ndywsep8ecvn")

  collection.createRule = "user_id = @request.auth.id"

  return dao.saveCollection(collection)
})
