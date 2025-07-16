#!/bin/bash

curl --request POST \
  --url "https://api.clickhouse.cloud/v1/organizations/b80ac647-494e-49eb-8285-5b7690b08769/services/db46694e-65f8-4953-80d5-69676c4bce35/clickpipes" \
  --header "Authorization: Basic cTJDTDBRUlp3RjhKWTBjVDVjMEM6NGIxZEdOUEtmdEpPYXNldjZFTlJhOWJtcmRGRWRyYVREU2RqaXpWRHg0" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "openapi_cdc_only_and_slot",
    "description": "migrated existing mirror",
    "source": {
      "postgres": {
        "host": "amogh-qa-test-ch.c7woo84owowd.us-east-2.rds.amazonaws.com",
        "port": 5432,
        "database": "postgres",
        "settings": {
          "syncIntervalSeconds": 10,
          "pullBatchSize": 100000,
          "publicationName": "peerflow_pub_to_migrate",
          "replicationMode": "cdc_only",
          "replicationSlotName": "peerflow_slot_to_migrate",
          "allowNullableColumns": true,
          "initialLoadParallelism": 4,
          "snapshotNumRowsPerPartition": 100000,
          "snapshotNumberOfParallelTables": 1
        },
        "tableMappings": [
          {
            "sourceSchemaName": "public",
            "sourceTable": "t1",
            "targetTable": "t1_migrated",
            "useCustomSortingKey": false,
            "tableEngine": "ReplacingMergeTree"
          }
        ],
        "credentials": {
          "username": "postgres",
          "password": "jXeSDxsix5rwMwiGyBKx"
        }
      },
      "validateSamples": true
    },
    "destination": {
      "database": "openapi_migrated"
    }
  }' 
