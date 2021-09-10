const { fromIni } = require('@aws-sdk/credential-providers');
const { BatchWriteItemCommand, DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

function chunk(array, size) {
  return array.reduce((a, _, i) => {
    if (i % size === 0) {
      a.push(array.slice(i, i + size));
    }

    return a;
  }, []);
}

async function load(client, tableName) {
  const cmd = new ScanCommand({
    ProjectionExpression: 'id',
    TableName: tableName
  });

  const { Items, LastEvaluatedKey } = await client.send(cmd);

  return {
    keys: Items,
    nextKey: LastEvaluatedKey
  };
}

async function remove(client, tableName, keys) {
  const cmd = new BatchWriteItemCommand({
    RequestItems: {
      [tableName]: keys.map(key => {
        return {
          DeleteRequest: {
            Key: key
          }
        };
      })
    }
  });

  await client.send(cmd);
}

async function truncate(client, tableName) {
  let hasMore = false;
  let counter = 0;

  do {
    const { keys, nextKey } = await load(client, tableName);

    counter += keys.length;

    const tasks = chunk(keys, 25).map(group => () => remove(client, tableName, group));

    await tasks.reduce(async (a, c) => {
      await a;
      await c();
    }, Promise.resolve());

    hasMore = Boolean(nextKey);

    console.info(`Deleted ${counter} records of ${tableName}`);

  } while (hasMore)
}

(async () => {
  const ddb = new DynamoDBClient({
    region: 'ap-south-1',
    credentials: fromIni({
      profile: 'movement-pass'
    })
  });

  await Promise.all([
    truncate(ddb, 'movement-pass_passes_v1'),
    truncate(ddb, 'movement-pass_applicants_v1')
  ]);
})();
