/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7wrm7o336mkewh")

  collection.listRule = "customer_id.user_id = @request.auth.id"
  collection.viewRule = "customer_id.user_id = @request.auth.id"
  collection.createRule = "customer_id.user_id = @request.auth.id"
  collection.updateRule = "customer_id.user_id = @request.auth.id"
  collection.deleteRule = "customer_id.user_id = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7wrm7o336mkewh")

  collection.listRule = null
  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return dao.saveCollection(collection)
})
