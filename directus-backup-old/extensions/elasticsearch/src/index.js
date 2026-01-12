import { Client } from '@elastic/elasticsearch';

// Configuration from environment variables
const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'directus_items';
const ELASTICSEARCH_VERIFY_SSL = process.env.ELASTICSEARCH_VERIFY_SSL !== 'false';

// Collections to index (leave empty to index all collections)
const INDEXED_COLLECTIONS = (process.env.INDEXED_COLLECTIONS || '').split(',').filter(Boolean);

// Initialize Elasticsearch client
let esClient = null;

function getElasticsearchClient() {
	if (!esClient) {
		const clientConfig = {
			node: ELASTICSEARCH_NODE,
			requestTimeout: 30000,
		};

		// Add authentication if provided
		if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
			clientConfig.auth = {
				username: ELASTICSEARCH_USERNAME,
				password: ELASTICSEARCH_PASSWORD,
			};
		}

		// SSL verification
		if (!ELASTICSEARCH_VERIFY_SSL) {
			clientConfig.tls = {
				rejectUnauthorized: false,
			};
		}

		esClient = new Client(clientConfig);
	}

	return esClient;
}

// Check if collection should be indexed
function shouldIndexCollection(collection) {
	// If no collections specified, index all
	if (INDEXED_COLLECTIONS.length === 0) {
		return true;
	}
	return INDEXED_COLLECTIONS.includes(collection);
}

// Index document in Elasticsearch
async function indexDocument(collection, id, data) {
	const client = getElasticsearchClient();

	try {
		// Create index if it doesn't exist
		await createIndexIfNotExists(client);

		// Index the document
		await client.index({
			index: ELASTICSEARCH_INDEX,
			id: `${collection}_${id}`,
			document: {
				collection,
				item_id: id,
				...data,
				_indexed_at: new Date().toISOString(),
			},
		});

		console.log(`[Elasticsearch] Indexed ${collection}/${id}`);
	} catch (error) {
		console.error(`[Elasticsearch] Error indexing ${collection}/${id}:`, error.message);
	}
}

// Delete document from Elasticsearch
async function deleteDocument(collection, id) {
	const client = getElasticsearchClient();

	try {
		await client.delete({
			index: ELASTICSEARCH_INDEX,
			id: `${collection}_${id}`,
		});

		console.log(`[Elasticsearch] Deleted ${collection}/${id}`);
	} catch (error) {
		// Ignore 404 errors (document already deleted)
		if (error.meta?.statusCode !== 404) {
			console.error(`[Elasticsearch] Error deleting ${collection}/${id}:`, error.message);
		}
	}
}

// Create index with mappings if it doesn't exist
async function createIndexIfNotExists(client) {
	const exists = await client.indices.exists({ index: ELASTICSEARCH_INDEX });

	if (!exists) {
		await client.indices.create({
			index: ELASTICSEARCH_INDEX,
			body: {
				settings: {
					number_of_shards: 1,
					number_of_replicas: 0,
				},
				mappings: {
					properties: {
						collection: { type: 'keyword' },
						item_id: { type: 'keyword' },
						_indexed_at: { type: 'date' },
					},
				},
			},
		});

		console.log(`[Elasticsearch] Created index: ${ELASTICSEARCH_INDEX}`);
	}
}

// Test Elasticsearch connection
async function testConnection() {
	const client = getElasticsearchClient();

	try {
		const info = await client.info();
		console.log(`[Elasticsearch] Connected to: ${info.version.number}`);
		return true;
	} catch (error) {
		console.error('[Elasticsearch] Connection failed:', error.message);
		return false;
	}
}

export default ({ filter, action }, { services, getSchema }) => {
	const { ItemsService } = services;

	// Test connection on startup
	testConnection();

	// FILTER HOOKS - Modify data before it's saved
	filter('items.create', async (payload, { collection }) => {
		if (!shouldIndexCollection(collection)) {
			return payload;
		}

		console.log(`[Elasticsearch] Filter create: ${collection}`);

		// Example: Add timestamp
		if (!payload.created_at) {
			payload.created_at = new Date().toISOString();
		}

		return payload;
	});

	filter('items.update', async (payload, { collection }) => {
		if (!shouldIndexCollection(collection)) {
			return payload;
		}

		console.log(`[Elasticsearch] Filter update: ${collection}`);

		// Example: Add updated timestamp
		payload.updated_at = new Date().toISOString();

		return payload;
	});

	// ACTION HOOKS - Execute code after events
	action('items.create', async ({ collection, item, payload }) => {
		if (!shouldIndexCollection(collection)) {
			return;
		}

		console.log(`[Elasticsearch] Action create: ${collection}/${item.id}`);

		// Index the new item
		await indexDocument(collection, item.id, payload || item);
	});

	action('items.update', async ({ collection, item, payload }) => {
		if (!shouldIndexCollection(collection)) {
			return;
		}

		console.log(`[Elasticsearch] Action update: ${collection}/${item.id}`);

		// Re-index the updated item
		await indexDocument(collection, item.id, payload);
	});

	action('items.delete', async ({ collection, item }) => {
		if (!shouldIndexCollection(collection)) {
			return;
		}

		console.log(`[Elasticsearch] Action delete: ${collection}/${item.id}`);

		// Remove from index
		await deleteDocument(collection, item.id);
	});

	action('items.batch_create', async ({ collection, payload }) => {
		if (!shouldIndexCollection(collection)) {
			return;
		}

		console.log(`[Elasticsearch] Batch create: ${collection} (${payload.length} items)`);

		// Index all new items
		for (const item of payload) {
			await indexDocument(collection, item.id, item);
		}
	});

	action('items.batch_update', async ({ collection, payload }) => {
		if (!shouldIndexCollection(collection)) {
			return;
		}

		console.log(`[Elasticsearch] Batch update: ${collection} (${payload.length} items)`);

		// Re-index all updated items
		for (const item of payload) {
			await indexDocument(collection, item.id, item);
		}
	});

	action('items.batch_delete', async ({ collection, payload }) => {
		if (!shouldIndexCollection(collection)) {
			return;
		}

		console.log(`[Elasticsearch] Batch delete: ${collection} (${payload.length} items)`);

		// Remove all from index
		for (const item of payload) {
			await deleteDocument(collection, item.id);
		}
	});

	console.log('[Elasticsearch] Hook extension loaded successfully');
	console.log(`[Elasticsearch] Index: ${ELASTICSEARCH_INDEX}`);
	console.log(`[Elasticsearch] Node: ${ELASTICSEARCH_NODE}`);
	console.log(`[Elasticsearch] Collections: ${INDEXED_COLLECTIONS.length > 0 ? INDEXED_COLLECTIONS.join(', ') : 'All'}`);
};
