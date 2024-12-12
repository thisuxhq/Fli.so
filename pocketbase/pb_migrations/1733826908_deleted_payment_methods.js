/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("x7wrm7o336mkewh");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "x7wrm7o336mkewh",
    "created": "2024-11-26 07:01:25.288Z",
    "updated": "2024-11-29 05:32:59.439Z",
    "name": "payment_methods",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "p4ryjmxg",
        "name": "stripe_payment_method_id",
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
        "id": "rm365mrw",
        "name": "card_brand",
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
        "id": "4eqxjol6",
        "name": "card_last4",
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
        "id": "bjlj8suv",
        "name": "card_exp_month",
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
        "id": "nvzibrot",
        "name": "card_exp_year",
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
        "id": "5vihftrv",
        "name": "is_default",
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
        "id": "a3air834",
        "name": "customer_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "qxxr33ci9lj5ub1",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": "customer_id.user_id = @request.auth.id",
    "viewRule": "customer_id.user_id = @request.auth.id",
    "createRule": "customer_id.user_id = @request.auth.id",
    "updateRule": "customer_id.user_id = @request.auth.id",
    "deleteRule": "customer_id.user_id = @request.auth.id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
