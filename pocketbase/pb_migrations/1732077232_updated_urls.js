/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  collection.listRule = "@request.auth.id = @request.data.created_by"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yq7y9q93v9mlxmq")

  collection.listRule = "@request.auth.id = @request.data.tags_id.created_by"

  return dao.saveCollection(collection)
})
