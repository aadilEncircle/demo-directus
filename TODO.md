# Directus Complete Setup & Elasticsearch Hook Implementation

## Part 1: Directus Local Deployment (Completed ✅)

## Part 2: Custom Elasticsearch Hook Implementation

### ✅ Implementation Status: COMPLETED

I've successfully implemented a comprehensive Elasticsearch indexing hook for Directus. Here's what was accomplished:

#### ✅ Files Updated:

1. **`directus-backup-old/extensions/elasticsearch/package.json`**
   - Added `@elastic/elasticsearch` dependency
   - Updated description and keywords
   - Configured for Directus hook extension

2. **`directus-backup-old/extensions/elasticsearch/src/index.js`**
   - Complete Elasticsearch client initialization
   - Filter hooks for data validation/modification
   - Action hooks for all CRUD operations
   - Error handling and connection management
   - Index management with auto-creation
   - Configurable via environment variables

### Key Features Implemented

✅ **Automatic Indexing**: Items are automatically indexed when created/updated
✅ **Automatic Deletion**: Items are removed from index when deleted
✅ **Batch Operations**: Handles bulk create/update/delete operations
✅ **Error Handling**: Graceful error handling with logging
✅ **Connection Management**: Reusable Elasticsearch client
✅ **Flexible Configuration**: Environment variable-based setup
✅ **Collection Filtering**: Option to filter which collections are indexed
✅ **SSL Support**: Configurable SSL verification
✅ **Authentication**: Support for Basic Auth with Elasticsearch

### Complete Setup Instructions

Now follow these steps to activate the Elasticsearch hook:

#### Step 1: Install Elasticsearch Dependencies
```bash
cd directus-backup-old/extensions/elasticsearch
npm install
```

#### Step 2: Add Environment Variables to `.env`
Add these to your `directus-backup-old/.env` file:

```bash
# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_elasticsearch_password
ELASTICSEARCH_INDEX=directus_items
# Optional: Comma-separated list of collections to index (leave empty for all)
INDEXED_COLLECTIONS=posts,articles,products
# Optional: Disable SSL verification (for development)
ELASTICSEARCH_VERIFY_SSL=false
```

#### Step 3: Build the Extension
```bash
npm run build
```

This will create the `dist/index.js` file that Directus will load.

#### Step 4: Start Elasticsearch
Make sure Elasticsearch is running on your specified node:

```bash
# If using Docker
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.10.0
```

#### Step 5: Restart Directus
```bash
cd directus-backup-old
docker-compose restart directus
```

#### Step 6: Verify the Extension is Loaded
```bash
docker-compose logs -f directus | grep -i elastic
```

You should see:
```
[Elasticsearch] Hook extension loaded successfully
[Elasticsearch] Index: directus_items
[Elasticsearch] Node: http://localhost:9200
[Elasticsearch] Connected to: 8.10.0
```

### How It Works

#### Filter Hooks (Before Operations):
- `filter('items.create')`: Validates/modifies data before creation
- `filter('items.update')`: Validates/modifies data before update
- Adds timestamps automatically

#### Action Hooks (After Operations):
- `action('items.create')`: Indexes new items in Elasticsearch
- `action('items.update')`: Updates indexed documents
- `action('items.delete')`: Removes items from Elasticsearch
- `action('items.batch_create')`: Bulk index new items
- `action('items.batch_update')`: Bulk update indexed items
- `action('items.batch_delete')`: Bulk remove from index

### Testing the Hook

1. Create a new item in Directus admin panel
2. Check Directus logs:
   ```bash
   docker-compose logs -f directus | grep -i elastic
   ```
3. Query Elasticsearch to verify indexing:
   ```bash
   curl "http://localhost:9200/directus_items/_search?pretty"
   ```

### Configuration Options

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ELASTICSEARCH_NODE` | Yes | http://localhost:9200 | Elasticsearch server URL |
| `ELASTICSEARCH_USERNAME` | No | - | Basic auth username |
| `ELASTICSEARCH_PASSWORD` | No | - | Basic auth password |
| `ELASTICSEARCH_INDEX` | No | directus_items | Index name |
| `INDEXED_COLLECTIONS` | No | All collections | Comma-separated list |
| `ELASTICSEARCH_VERIFY_SSL` | No | true | SSL verification |

### Expected Outcome

✅ Directus will automatically sync all data changes to Elasticsearch
✅ Full-text search capabilities across your content
✅ Real-time indexing as data changes
✅ All existing data preserved and accessible

You can now search your Directus content using Elasticsearch queries!
