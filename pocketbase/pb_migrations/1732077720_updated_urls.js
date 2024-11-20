/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  collection.listRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  collection.listRule = "@request.auth.id != ''"

  return dao.saveCollection(collection)
})
