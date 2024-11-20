/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  collection.listRule = "created_by = @request.auth.id"
  collection.viewRule = "created_by = @request.auth.id"
  collection.updateRule = "created_by = @request.auth.id"
  collection.deleteRule = "created_by = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  collection.listRule = ""
  collection.viewRule = ""
  collection.updateRule = ""
  collection.deleteRule = ""

  return dao.saveCollection(collection)
})
